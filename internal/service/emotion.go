package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"sort"
	"time"
)

// EmotionDimension holds a single emotion score at a given time range.
type EmotionDimension struct {
	Name  string  `json:"name"`
	Score float64 `json:"score"`
}

// EmotionFrame is a snapshot of emotion scores for one audio segment.
type EmotionFrame struct {
	StartMs   int                `json:"start_ms"`
	EndMs     int                `json:"end_ms"`
	Emotions  []EmotionDimension `json:"emotions"`
}

// EmotionAnalysis holds the full vocal emotion analysis result.
type EmotionAnalysis struct {
	Frames           []EmotionFrame     `json:"frames"`
	DominantEmotions []EmotionDimension `json:"dominant_emotions"` // top 5 across entire session

	// Derived summary scores (0–100 scale)
	ConfidenceAvg  float64 `json:"confidence_avg"`
	ConfidenceMin  float64 `json:"confidence_min"`
	ConfidenceMinMs int    `json:"confidence_min_ms"` // timestamp of lowest confidence
	EnthusiasmAvg  float64 `json:"enthusiasm_avg"`
	NervousnessAvg float64 `json:"nervousness_avg"`
	NervousnessPeaks []int  `json:"nervousness_peaks"` // timestamps (ms) of nervousness spikes
	CalmAvg        float64 `json:"calm_avg"`
}

// EmotionService handles vocal emotion analysis via Hume AI Expression Measurement.
type EmotionService struct {
	apiKey string
}

// NewEmotionService creates a new emotion analysis service.
func NewEmotionService(apiKey string) *EmotionService {
	if apiKey == "" {
		return nil
	}
	return &EmotionService{apiKey: apiKey}
}

// AnalyzeFile sends a local audio/video file to Hume AI and returns emotion analysis.
func (s *EmotionService) AnalyzeFile(ctx context.Context, filePath string) (*EmotionAnalysis, error) {
	// Step 1: Submit the job
	jobID, err := s.submitJob(ctx, filePath)
	if err != nil {
		return nil, fmt.Errorf("submit emotion job: %w", err)
	}

	// Step 2: Poll for completion
	result, err := s.pollJob(ctx, jobID)
	if err != nil {
		return nil, fmt.Errorf("poll emotion job: %w", err)
	}

	return result, nil
}

// submitJob uploads the file to Hume AI Batch API and returns a job ID.
func (s *EmotionService) submitJob(ctx context.Context, filePath string) (string, error) {
	// Open the file
	f, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("open file: %w", err)
	}
	defer f.Close()

	// Build multipart form
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	// Add the file
	part, err := writer.CreateFormFile("file", filePath)
	if err != nil {
		return "", fmt.Errorf("create form file: %w", err)
	}
	if _, err := io.Copy(part, f); err != nil {
		return "", fmt.Errorf("copy file to form: %w", err)
	}

	// Add models JSON — request prosody (vocal) analysis
	modelsJSON := `[{"prosody": {}}]`
	if err := writer.WriteField("models", modelsJSON); err != nil {
		return "", fmt.Errorf("write models field: %w", err)
	}

	if err := writer.Close(); err != nil {
		return "", fmt.Errorf("close writer: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST",
		"https://api.hume.ai/v0/batch/jobs", &body)
	if err != nil {
		return "", err
	}
	req.Header.Set("X-Hume-Api-Key", s.apiKey)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("hume submit failed (%d): %s", resp.StatusCode, string(respBody))
	}

	var result struct {
		JobID string `json:"job_id"`
	}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return "", fmt.Errorf("parse submit response: %w", err)
	}

	return result.JobID, nil
}

// pollJob polls Hume AI until the job completes, then fetches predictions.
func (s *EmotionService) pollJob(ctx context.Context, jobID string) (*EmotionAnalysis, error) {
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-ticker.C:
			// Check job status
			req, err := http.NewRequestWithContext(ctx, "GET",
				fmt.Sprintf("https://api.hume.ai/v0/batch/jobs/%s", jobID), nil)
			if err != nil {
				return nil, err
			}
			req.Header.Set("X-Hume-Api-Key", s.apiKey)

			resp, err := http.DefaultClient.Do(req)
			if err != nil {
				return nil, err
			}

			var status struct {
				State struct {
					Status string `json:"status"`
				} `json:"state"`
			}
			if err := json.NewDecoder(resp.Body).Decode(&status); err != nil {
				resp.Body.Close()
				return nil, fmt.Errorf("parse status: %w", err)
			}
			resp.Body.Close()

			switch status.State.Status {
			case "COMPLETED":
				return s.fetchPredictions(ctx, jobID)
			case "FAILED":
				return nil, fmt.Errorf("hume job failed")
			default:
				// still running, continue polling
			}
		}
	}
}

// fetchPredictions retrieves the completed job's predictions.
func (s *EmotionService) fetchPredictions(ctx context.Context, jobID string) (*EmotionAnalysis, error) {
	req, err := http.NewRequestWithContext(ctx, "GET",
		fmt.Sprintf("https://api.hume.ai/v0/batch/jobs/%s/predictions", jobID), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("X-Hume-Api-Key", s.apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read predictions: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("hume predictions failed (%d): %s", resp.StatusCode, string(body))
	}

	// Parse Hume response structure:
	// [{ "source": {...}, "results": { "predictions": [{ "models": { "prosody": { "grouped_predictions": [...] } } }] } }]
	var humeResp []struct {
		Results struct {
			Predictions []struct {
				Models struct {
					Prosody struct {
						GroupedPredictions []struct {
							Predictions []struct {
								Time struct {
									Begin float64 `json:"begin"`
									End   float64 `json:"end"`
								} `json:"time"`
								Emotions []struct {
									Name  string  `json:"name"`
									Score float64 `json:"score"`
								} `json:"emotions"`
							} `json:"predictions"`
						} `json:"grouped_predictions"`
					} `json:"prosody"`
				} `json:"models"`
			} `json:"predictions"`
		} `json:"results"`
	}

	if err := json.Unmarshal(body, &humeResp); err != nil {
		return nil, fmt.Errorf("parse predictions: %w", err)
	}

	analysis := &EmotionAnalysis{}

	// Accumulate all frames
	emotionSums := make(map[string]float64)
	emotionCounts := make(map[string]int)
	var confidenceMin float64 = 1.0
	confidenceMinMs := 0

	for _, source := range humeResp {
		for _, pred := range source.Results.Predictions {
			for _, group := range pred.Models.Prosody.GroupedPredictions {
				for _, p := range group.Predictions {
					frame := EmotionFrame{
						StartMs: int(p.Time.Begin * 1000),
						EndMs:   int(p.Time.End * 1000),
					}

					for _, e := range p.Emotions {
						frame.Emotions = append(frame.Emotions, EmotionDimension{
							Name:  e.Name,
							Score: e.Score,
						})
						emotionSums[e.Name] += e.Score
						emotionCounts[e.Name]++
					}

					analysis.Frames = append(analysis.Frames, frame)

					// Extract key scores for this frame
					confidence := getEmotionScore(p.Emotions, "Confidence")
					nervousness := getEmotionScore(p.Emotions, "Anxiety")
					enthusiasm := getEmotionScore(p.Emotions, "Excitement")
					calm := getEmotionScore(p.Emotions, "Calmness")

					if confidence < confidenceMin {
						confidenceMin = confidence
						confidenceMinMs = frame.StartMs
					}

					// Detect nervousness peaks (anxiety > 0.4)
					if nervousness > 0.4 {
						analysis.NervousnessPeaks = append(analysis.NervousnessPeaks, frame.StartMs)
					}

					// Accumulate for averages
					_ = enthusiasm
					_ = calm
				}
			}
		}
	}

	// Compute averages
	frameCount := len(analysis.Frames)
	if frameCount > 0 {
		var confSum, enthSum, nervSum, calmSum float64
		for _, frame := range analysis.Frames {
			confSum += getFrameScore(frame.Emotions, "Confidence")
			enthSum += getFrameScore(frame.Emotions, "Excitement")
			nervSum += getFrameScore(frame.Emotions, "Anxiety")
			calmSum += getFrameScore(frame.Emotions, "Calmness")
		}
		fc := float64(frameCount)
		analysis.ConfidenceAvg = confSum / fc * 100  // scale to 0–100
		analysis.EnthusiasmAvg = enthSum / fc * 100
		analysis.NervousnessAvg = nervSum / fc * 100
		analysis.CalmAvg = calmSum / fc * 100
		analysis.ConfidenceMin = confidenceMin * 100
		analysis.ConfidenceMinMs = confidenceMinMs
	}

	// Top 5 dominant emotions (by average score)
	type emotionAvg struct {
		name string
		avg  float64
	}
	var avgList []emotionAvg
	for name, sum := range emotionSums {
		if count, ok := emotionCounts[name]; ok && count > 0 {
			avgList = append(avgList, emotionAvg{name: name, avg: sum / float64(count)})
		}
	}
	sort.Slice(avgList, func(i, j int) bool {
		return avgList[i].avg > avgList[j].avg
	})
	topN := 5
	if len(avgList) < topN {
		topN = len(avgList)
	}
	for i := 0; i < topN; i++ {
		analysis.DominantEmotions = append(analysis.DominantEmotions, EmotionDimension{
			Name:  avgList[i].name,
			Score: avgList[i].avg,
		})
	}

	return analysis, nil
}

// Helper to get a specific emotion score from a list
func getEmotionScore(emotions []struct {
	Name  string  `json:"name"`
	Score float64 `json:"score"`
}, name string) float64 {
	for _, e := range emotions {
		if e.Name == name {
			return e.Score
		}
	}
	return 0
}

// Helper to get a specific emotion score from EmotionDimension slice
func getFrameScore(emotions []EmotionDimension, name string) float64 {
	for _, e := range emotions {
		if e.Name == name {
			return e.Score
		}
	}
	return 0
}
