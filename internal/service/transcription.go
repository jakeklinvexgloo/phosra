package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// WordToken represents a single word with timing and confidence from AssemblyAI.
type WordToken struct {
	Text       string  `json:"text"`
	Start      int     `json:"start"`       // milliseconds
	End        int     `json:"end"`         // milliseconds
	Confidence float64 `json:"confidence"`
	Speaker    string  `json:"speaker,omitempty"` // from speaker diarization
}

// TranscriptionResult holds the full AssemblyAI transcription output.
type TranscriptionResult struct {
	Text             string      `json:"text"`
	Words            []WordToken `json:"words"`
	AudioDurationSec float64     `json:"audio_duration"`
	// Derived analytics
	FillerWords     []string `json:"filler_words"`
	FillerWordCount int      `json:"filler_word_count"`
	WordsPerMinute  float64  `json:"words_per_minute"`
	SilencePct      float64  `json:"silence_percentage"`
}

// TranscriptionService handles speech-to-text via AssemblyAI.
type TranscriptionService struct {
	apiKey string
}

// NewTranscriptionService creates a new transcription service.
func NewTranscriptionService(apiKey string) *TranscriptionService {
	if apiKey == "" {
		return nil
	}
	return &TranscriptionService{apiKey: apiKey}
}

// TranscribeFile uploads a local audio/video file to AssemblyAI and returns word-level transcription.
func (s *TranscriptionService) TranscribeFile(ctx context.Context, filePath string) (*TranscriptionResult, error) {
	// Step 1: Upload the file
	uploadURL, err := s.uploadFile(ctx, filePath)
	if err != nil {
		return nil, fmt.Errorf("upload file: %w", err)
	}

	// Step 2: Create transcription job
	jobID, err := s.createTranscription(ctx, uploadURL)
	if err != nil {
		return nil, fmt.Errorf("create transcription: %w", err)
	}

	// Step 3: Poll for completion
	result, err := s.pollTranscription(ctx, jobID)
	if err != nil {
		return nil, fmt.Errorf("poll transcription: %w", err)
	}

	return result, nil
}

// TranscribeURL transcribes audio/video from a publicly accessible URL.
func (s *TranscriptionService) TranscribeURL(ctx context.Context, audioURL string) (*TranscriptionResult, error) {
	jobID, err := s.createTranscription(ctx, audioURL)
	if err != nil {
		return nil, fmt.Errorf("create transcription: %w", err)
	}

	result, err := s.pollTranscription(ctx, jobID)
	if err != nil {
		return nil, fmt.Errorf("poll transcription: %w", err)
	}

	return result, nil
}

func (s *TranscriptionService) uploadFile(ctx context.Context, filePath string) (string, error) {
	// Read the file
	fileData, err := io.ReadAll(io.LimitReader(mustOpenFile(filePath), 500<<20)) // 500MB max
	if err != nil {
		return "", fmt.Errorf("read file: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.assemblyai.com/v2/upload", bytes.NewReader(fileData))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", s.apiKey)
	req.Header.Set("Content-Type", "application/octet-stream")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("upload failed (%d): %s", resp.StatusCode, string(body))
	}

	var result struct {
		UploadURL string `json:"upload_url"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	return result.UploadURL, nil
}

func (s *TranscriptionService) createTranscription(ctx context.Context, audioURL string) (string, error) {
	reqBody := map[string]interface{}{
		"audio_url":          audioURL,
		"speaker_labels":     true,
		"word_boost":         []string{"Phosra", "GuardianGate", "COPPA", "KOSA", "PCSS"},
		"language_detection": false,
		"language_code":      "en",
	}

	bodyBytes, _ := json.Marshal(reqBody)
	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.assemblyai.com/v2/transcript", bytes.NewReader(bodyBytes))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("create transcription failed (%d): %s", resp.StatusCode, string(body))
	}

	var result struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	return result.ID, nil
}

func (s *TranscriptionService) pollTranscription(ctx context.Context, jobID string) (*TranscriptionResult, error) {
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-ticker.C:
			req, err := http.NewRequestWithContext(ctx, "GET",
				fmt.Sprintf("https://api.assemblyai.com/v2/transcript/%s", jobID), nil)
			if err != nil {
				return nil, err
			}
			req.Header.Set("Authorization", s.apiKey)

			resp, err := http.DefaultClient.Do(req)
			if err != nil {
				return nil, err
			}

			var raw struct {
				ID             string  `json:"id"`
				Status         string  `json:"status"`
				Text           string  `json:"text"`
				Words          []WordToken `json:"words"`
				AudioDuration  float64 `json:"audio_duration"`
				Error          string  `json:"error"`
			}
			if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
				resp.Body.Close()
				return nil, err
			}
			resp.Body.Close()

			switch raw.Status {
			case "completed":
				result := &TranscriptionResult{
					Text:             raw.Text,
					Words:            raw.Words,
					AudioDurationSec: raw.AudioDuration / 1000.0, // ms → seconds
				}
				s.computeAnalytics(result)
				return result, nil

			case "error":
				return nil, fmt.Errorf("transcription failed: %s", raw.Error)

			default:
				// still processing, continue polling
			}
		}
	}
}

// computeAnalytics derives filler word counts, WPM, and silence percentage from word tokens.
func (s *TranscriptionService) computeAnalytics(result *TranscriptionResult) {
	fillerSet := map[string]bool{
		"um": true, "uh": true, "like": true, "you know": true,
		"basically": true, "so": true, "actually": true, "right": true,
		"I mean": true, "kind of": true, "sort of": true,
	}

	fillerCounts := make(map[string]int)
	totalSpeechMs := 0

	for _, w := range result.Words {
		lower := strings.ToLower(w.Text)
		if fillerSet[lower] {
			fillerCounts[lower]++
			result.FillerWordCount++
		}
		totalSpeechMs += w.End - w.Start
	}

	// Build filler word list
	for word := range fillerCounts {
		result.FillerWords = append(result.FillerWords, word)
	}

	// WPM
	if result.AudioDurationSec > 0 {
		result.WordsPerMinute = float64(len(result.Words)) / (result.AudioDurationSec / 60.0)
	}

	// Silence percentage
	if result.AudioDurationSec > 0 {
		speechSec := float64(totalSpeechMs) / 1000.0
		result.SilencePct = (1.0 - speechSec/result.AudioDurationSec) * 100.0
		if result.SilencePct < 0 {
			result.SilencePct = 0
		}
	}
}

// mustOpenFile opens a file or panics. Used internally for upload.
func mustOpenFile(path string) io.Reader {
	f, err := os.Open(path)
	if err != nil {
		return bytes.NewReader(nil)
	}
	return f
}
