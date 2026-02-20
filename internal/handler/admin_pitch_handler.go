package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/coder/websocket"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/handler/middleware"
	"github.com/guardiangate/api/internal/repository/postgres"
	"github.com/guardiangate/api/pkg/httputil"
)

// AdminPitchHandler handles pitch coaching sessions and WebSocket relay.
type AdminPitchHandler struct {
	repo      *postgres.AdminPitchRepo
	openaiKey string
}

func NewAdminPitchHandler(repo *postgres.AdminPitchRepo, openaiKey string) *AdminPitchHandler {
	return &AdminPitchHandler{repo: repo, openaiKey: openaiKey}
}

// ── Persona System Prompts ─────────────────────────────────────

var personaPrompts = map[domain.PitchPersona]string{
	domain.PersonaInvestor: `You are a Series A venture capital partner at a top-tier firm. You're taking a first meeting with a founder pitching their child safety technology startup called "Phosra" (formerly GuardianGate).

Your approach:
- Be interested but appropriately skeptical
- Ask probing questions about market size, unit economics, competitive moat, team, and go-to-market
- Push back on vague claims — ask for specifics and data
- Evaluate whether this is a venture-scale opportunity
- Keep your responses conversational and under 30 seconds
- Occasionally reference comparable companies or market dynamics
- If the founder makes a strong point, acknowledge it before moving on

Start by saying something like "Thanks for coming in. I've been looking forward to hearing about what you're building. Why don't you give me the quick overview?"`,

	domain.PersonaPartner: `You are a VP of Trust & Safety at a major social media platform (think TikTok, Instagram, or YouTube scale). You're evaluating Phosra as a potential technology partner for child safety compliance.

Your approach:
- Focus on technical integration — API reliability, latency, data handling
- Ask about compliance coverage — which specific regulations does this address?
- Evaluate pricing model and ROI vs building in-house
- Be concerned about false positives and user experience impact
- Ask about scale — can this handle millions of daily active users?
- Keep responses practical and under 30 seconds
- You've seen many vendors; you need to be convinced this is different

Start by saying something like "I appreciate you taking the time. We get pitched by a lot of child safety vendors. Walk me through what makes Phosra different from what we've already evaluated."`,

	domain.PersonaLegislator: `You are a United States Senator on the Commerce Committee with a focus on child safety legislation. You're in a meeting to understand how technology can support enforcement of laws like COPPA, KOSA, and state-level child safety bills.

Your approach:
- Ask about specific legislation — how does this technology map to COPPA, KOSA, state AG enforcement?
- Be concerned about privacy implications — does this create new surveillance risks?
- Ask about age verification methods and their accuracy
- Want to understand what platforms are currently doing vs what they should be doing
- Ask about the enforcement gap — why aren't existing laws enough?
- Keep responses formal but conversational, under 30 seconds
- You want concrete examples and data points you can reference

Start by saying something like "Thank you for meeting with us today. I've been hearing a lot about the enforcement challenges with our existing child safety laws. Tell me about your technology and how it addresses these gaps."`,
}

// ── REST Endpoints ─────────────────────────────────────────────

// CreateSession creates a new pitch coaching session.
func (h *AdminPitchHandler) CreateSession(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == uuid.Nil {
		httputil.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req struct {
		Persona       string          `json:"persona"`
		PersonaConfig json.RawMessage `json:"persona_config,omitempty"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	persona := domain.PitchPersona(req.Persona)
	switch persona {
	case domain.PersonaInvestor, domain.PersonaPartner, domain.PersonaLegislator:
		// valid
	default:
		httputil.Error(w, http.StatusBadRequest, "invalid persona: must be investor, partner, or legislator")
		return
	}

	session := &domain.PitchSession{
		UserID:        userID,
		Persona:       persona,
		PersonaConfig: req.PersonaConfig,
		Status:        domain.PitchConfiguring,
	}

	if err := h.repo.Create(r.Context(), session); err != nil {
		log.Error().Err(err).Msg("failed to create pitch session")
		httputil.Error(w, http.StatusInternalServerError, "failed to create session")
		return
	}

	httputil.Created(w, session)
}

// ListSessions returns all pitch sessions for the current user.
func (h *AdminPitchHandler) ListSessions(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == uuid.Nil {
		httputil.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	sessions, err := h.repo.List(r.Context(), userID)
	if err != nil {
		log.Error().Err(err).Msg("failed to list pitch sessions")
		httputil.Error(w, http.StatusInternalServerError, "failed to list sessions")
		return
	}
	if sessions == nil {
		sessions = []domain.PitchSession{}
	}
	httputil.JSON(w, http.StatusOK, sessions)
}

// GetSession returns a single pitch session with metrics.
func (h *AdminPitchHandler) GetSession(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "sessionID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid session ID")
		return
	}

	session, err := h.repo.GetByID(r.Context(), id)
	if err != nil {
		log.Error().Err(err).Msg("failed to get pitch session")
		httputil.Error(w, http.StatusInternalServerError, "failed to get session")
		return
	}
	if session == nil {
		httputil.Error(w, http.StatusNotFound, "session not found")
		return
	}

	// Include metrics if available
	metrics, _ := h.repo.GetMetrics(r.Context(), id)

	httputil.JSON(w, http.StatusOK, struct {
		*domain.PitchSession
		Metrics *domain.PitchSessionMetrics `json:"metrics,omitempty"`
	}{session, metrics})
}

// DeleteSession removes a pitch session.
func (h *AdminPitchHandler) DeleteSession(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "sessionID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid session ID")
		return
	}

	if err := h.repo.Delete(r.Context(), id); err != nil {
		log.Error().Err(err).Msg("failed to delete pitch session")
		httputil.Error(w, http.StatusInternalServerError, "failed to delete session")
		return
	}

	httputil.NoContent(w)
}

// EndSession marks a session as ended and triggers the feedback pipeline.
func (h *AdminPitchHandler) EndSession(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "sessionID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid session ID")
		return
	}

	session, err := h.repo.GetByID(r.Context(), id)
	if err != nil || session == nil {
		httputil.Error(w, http.StatusNotFound, "session not found")
		return
	}

	if session.Status != domain.PitchActive {
		httputil.Error(w, http.StatusConflict, "session is not active")
		return
	}

	// Mark as processing
	if err := h.repo.UpdateStatus(r.Context(), id, domain.PitchProcessing); err != nil {
		log.Error().Err(err).Msg("failed to update pitch session status")
		httputil.Error(w, http.StatusInternalServerError, "failed to end session")
		return
	}

	// Run feedback pipeline in background
	go h.runFeedbackPipeline(id)

	httputil.JSON(w, http.StatusOK, map[string]string{
		"status":  "processing",
		"message": "Session ended. Generating feedback...",
	})
}

// ── WebSocket Relay ────────────────────────────────────────────

// HandleRealtimeWS establishes a bidirectional WebSocket relay between
// the browser and OpenAI's Realtime API.
func (h *AdminPitchHandler) HandleRealtimeWS(w http.ResponseWriter, r *http.Request) {
	sessionID, err := uuid.Parse(chi.URLParam(r, "sessionID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid session ID")
		return
	}

	if h.openaiKey == "" {
		httputil.Error(w, http.StatusServiceUnavailable, "OpenAI API key not configured")
		return
	}

	// Validate session exists and is in a valid state
	session, err := h.repo.GetByID(r.Context(), sessionID)
	if err != nil || session == nil {
		httputil.Error(w, http.StatusNotFound, "session not found")
		return
	}
	if session.Status != domain.PitchConfiguring && session.Status != domain.PitchActive {
		httputil.Error(w, http.StatusConflict, "session cannot be connected in current state")
		return
	}

	// Accept browser WebSocket
	browserConn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		// Allow cross-origin for dev
		InsecureSkipVerify: true,
	})
	if err != nil {
		log.Error().Err(err).Msg("failed to accept WebSocket connection")
		return
	}
	defer browserConn.CloseNow()

	// Set generous read limit for audio data
	browserConn.SetReadLimit(1 << 20) // 1MB

	// Connect to OpenAI Realtime API
	openaiURL := "wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview"
	openaiConn, _, err := websocket.Dial(r.Context(), openaiURL, &websocket.DialOptions{
		HTTPHeader: http.Header{
			"Authorization": []string{"Bearer " + h.openaiKey},
			"OpenAI-Beta":   []string{"realtime=v1"},
		},
	})
	if err != nil {
		log.Error().Err(err).Msg("failed to connect to OpenAI Realtime API")
		browserConn.Close(websocket.StatusInternalError, "failed to connect to AI service")
		return
	}
	defer openaiConn.CloseNow()

	openaiConn.SetReadLimit(1 << 20) // 1MB

	// Mark session as active
	if err := h.repo.UpdateStatus(r.Context(), sessionID, domain.PitchActive); err != nil {
		log.Error().Err(err).Msg("failed to mark pitch session as active")
	}

	// Send session.update with persona prompt and voice config
	persona := session.Persona
	systemPrompt, ok := personaPrompts[persona]
	if !ok {
		systemPrompt = personaPrompts[domain.PersonaInvestor]
	}

	sessionUpdate := map[string]interface{}{
		"type": "session.update",
		"session": map[string]interface{}{
			"modalities":          []string{"text", "audio"},
			"instructions":        systemPrompt,
			"voice":               "alloy",
			"input_audio_format":  "pcm16",
			"output_audio_format": "pcm16",
			"turn_detection": map[string]interface{}{
				"type":                "server_vad",
				"threshold":           0.5,
				"prefix_padding_ms":   300,
				"silence_duration_ms": 500,
			},
		},
	}

	updateJSON, _ := json.Marshal(sessionUpdate)
	if err := openaiConn.Write(r.Context(), websocket.MessageText, updateJSON); err != nil {
		log.Error().Err(err).Msg("failed to send session.update to OpenAI")
		browserConn.Close(websocket.StatusInternalError, "failed to configure AI session")
		return
	}

	log.Info().
		Str("session_id", sessionID.String()).
		Str("persona", string(persona)).
		Msg("pitch coaching WebSocket relay established")

	// Transcript accumulator
	var (
		transcriptMu      sync.Mutex
		transcriptEntries []domain.TranscriptEntry
	)

	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	errCh := make(chan error, 2)

	// Goroutine 1: Browser → OpenAI
	go func() {
		for {
			msgType, data, err := browserConn.Read(ctx)
			if err != nil {
				errCh <- fmt.Errorf("browser read: %w", err)
				return
			}
			if err := openaiConn.Write(ctx, msgType, data); err != nil {
				errCh <- fmt.Errorf("openai write: %w", err)
				return
			}
		}
	}()

	// Goroutine 2: OpenAI → Browser (with transcript accumulation)
	go func() {
		for {
			msgType, data, err := openaiConn.Read(ctx)
			if err != nil {
				errCh <- fmt.Errorf("openai read: %w", err)
				return
			}

			// Try to accumulate transcript from response events
			if msgType == websocket.MessageText {
				h.accumulateTranscript(data, &transcriptMu, &transcriptEntries)
			}

			if err := browserConn.Write(ctx, msgType, data); err != nil {
				errCh <- fmt.Errorf("browser write: %w", err)
				return
			}
		}
	}()

	// Wait for either goroutine to finish (connection closed)
	relayErr := <-errCh
	cancel() // Stop the other goroutine

	log.Info().
		Str("session_id", sessionID.String()).
		AnErr("relay_error", relayErr).
		Int("transcript_entries", len(transcriptEntries)).
		Msg("pitch coaching WebSocket relay closed")

	// Save accumulated transcript
	transcriptMu.Lock()
	if len(transcriptEntries) > 0 {
		transcriptJSON, err := json.Marshal(transcriptEntries)
		if err == nil {
			if saveErr := h.repo.SaveTranscript(context.Background(), sessionID, transcriptJSON); saveErr != nil {
				log.Error().Err(saveErr).Str("session_id", sessionID.String()).Msg("failed to save transcript")
			}
		}
	}
	transcriptMu.Unlock()

	browserConn.Close(websocket.StatusNormalClosure, "session ended")
}

// accumulateTranscript parses OpenAI Realtime events and collects transcript entries.
func (h *AdminPitchHandler) accumulateTranscript(data []byte, mu *sync.Mutex, entries *[]domain.TranscriptEntry) {
	var event struct {
		Type       string `json:"type"`
		Transcript string `json:"transcript"`
		Text       string `json:"text"`
	}
	if err := json.Unmarshal(data, &event); err != nil {
		return
	}

	var entry *domain.TranscriptEntry

	switch event.Type {
	case "response.audio_transcript.done":
		// AI finished speaking — capture the full transcript
		if event.Transcript != "" {
			entry = &domain.TranscriptEntry{
				Speaker: "ai",
				Text:    event.Transcript,
			}
		}
	case "conversation.item.input_audio_transcription.completed":
		// User finished speaking — capture the transcription
		if event.Transcript != "" {
			entry = &domain.TranscriptEntry{
				Speaker: "user",
				Text:    event.Transcript,
			}
		}
	}

	if entry != nil {
		mu.Lock()
		*entries = append(*entries, *entry)
		mu.Unlock()
	}
}

// ── Feedback Pipeline ──────────────────────────────────────────

// runFeedbackPipeline sends the transcript to GPT-4o for coaching analysis.
func (h *AdminPitchHandler) runFeedbackPipeline(sessionID uuid.UUID) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	log.Info().Str("session_id", sessionID.String()).Msg("starting feedback pipeline")

	// Fetch session + transcript
	session, err := h.repo.GetByID(ctx, sessionID)
	if err != nil || session == nil {
		log.Error().Err(err).Str("session_id", sessionID.String()).Msg("feedback pipeline: session not found")
		h.repo.UpdateStatus(ctx, sessionID, domain.PitchFailed)
		return
	}

	if len(session.Transcript) == 0 || string(session.Transcript) == "null" {
		log.Warn().Str("session_id", sessionID.String()).Msg("feedback pipeline: no transcript available")
		h.repo.UpdateStatus(ctx, sessionID, domain.PitchFailed)
		return
	}

	// Parse transcript entries
	var transcriptEntries []domain.TranscriptEntry
	if err := json.Unmarshal(session.Transcript, &transcriptEntries); err != nil {
		log.Error().Err(err).Msg("feedback pipeline: failed to parse transcript")
		h.repo.UpdateStatus(ctx, sessionID, domain.PitchFailed)
		return
	}

	// Build transcript text for the coaching prompt
	var transcriptText strings.Builder
	for _, entry := range transcriptEntries {
		speaker := "User"
		if entry.Speaker == "ai" {
			speaker = "AI (" + string(session.Persona) + ")"
		}
		transcriptText.WriteString(fmt.Sprintf("[%s]: %s\n\n", speaker, entry.Text))
	}

	// Build coaching prompt
	coachingPrompt := fmt.Sprintf(`You are an expert pitch coach and communication trainer. Analyze the following pitch practice conversation where the user was pitching to an AI playing the role of a %s.

Provide structured coaching feedback as JSON with exactly this schema:
{
  "summary": "1-2 paragraph overall assessment of the pitch",
  "strengths": ["strength1", "strength2", ...],
  "improvements": ["improvement1", "improvement2", ...],
  "specific_moments": [
    {"timestamp_ms": 0, "note": "description of a specific good or bad moment"}
  ],
  "recommended_practice": "Specific recommendation for what to practice next",
  "scores": {
    "overall": 0-100,
    "clarity": 0-100,
    "persuasion": 0-100,
    "confidence": 0-100,
    "structure": 0-100
  },
  "speech_metrics": {
    "estimated_filler_words": ["um", "uh", "like"],
    "filler_word_count": 0,
    "estimated_wpm": 0
  }
}

Be constructive but honest. Give specific, actionable feedback. Reference specific things the user said when possible.

=== TRANSCRIPT ===
%s
=== END TRANSCRIPT ===

Respond with ONLY the JSON object, no markdown formatting.`, session.Persona, transcriptText.String())

	// Call GPT-4o for coaching analysis
	feedbackJSON, err := h.callGPT4o(ctx, coachingPrompt)
	if err != nil {
		log.Error().Err(err).Str("session_id", sessionID.String()).Msg("feedback pipeline: GPT-4o call failed")
		h.repo.UpdateStatus(ctx, sessionID, domain.PitchFailed)
		return
	}

	// Parse the response
	var feedbackResp struct {
		Summary             string                `json:"summary"`
		Strengths           []string              `json:"strengths"`
		Improvements        []string              `json:"improvements"`
		SpecificMoments     []domain.FeedbackMoment `json:"specific_moments"`
		RecommendedPractice string                `json:"recommended_practice"`
		Scores              struct {
			Overall    int `json:"overall"`
			Clarity    int `json:"clarity"`
			Persuasion int `json:"persuasion"`
			Confidence int `json:"confidence"`
			Structure  int `json:"structure"`
		} `json:"scores"`
		SpeechMetrics struct {
			EstimatedFillerWords []string `json:"estimated_filler_words"`
			FillerWordCount      int      `json:"filler_word_count"`
			EstimatedWPM         float64  `json:"estimated_wpm"`
		} `json:"speech_metrics"`
	}

	if err := json.Unmarshal(feedbackJSON, &feedbackResp); err != nil {
		log.Error().Err(err).Str("raw", string(feedbackJSON)).Msg("feedback pipeline: failed to parse GPT-4o response")
		h.repo.UpdateStatus(ctx, sessionID, domain.PitchFailed)
		return
	}

	// Build feedback JSONB
	feedback := domain.PitchFeedback{
		Summary:             feedbackResp.Summary,
		Strengths:           feedbackResp.Strengths,
		Improvements:        feedbackResp.Improvements,
		SpecificMoments:     feedbackResp.SpecificMoments,
		RecommendedPractice: feedbackResp.RecommendedPractice,
	}
	feedbackBytes, _ := json.Marshal(feedback)

	// Save feedback + score
	if err := h.repo.SaveFeedback(ctx, sessionID, feedbackBytes, feedbackResp.Scores.Overall); err != nil {
		log.Error().Err(err).Msg("feedback pipeline: failed to save feedback")
		h.repo.UpdateStatus(ctx, sessionID, domain.PitchFailed)
		return
	}

	// Save detailed metrics
	wpm := feedbackResp.SpeechMetrics.EstimatedWPM
	clarityScore := feedbackResp.Scores.Clarity
	persuasionScore := feedbackResp.Scores.Persuasion
	confidenceScore := feedbackResp.Scores.Confidence
	structureScore := feedbackResp.Scores.Structure

	fillerWordsJSON, _ := json.Marshal(feedbackResp.SpeechMetrics.EstimatedFillerWords)

	metrics := &domain.PitchSessionMetrics{
		SessionID:       sessionID,
		FillerWordCount: feedbackResp.SpeechMetrics.FillerWordCount,
		FillerWords:     fillerWordsJSON,
		WordsPerMinute:  &wpm,
		ClarityScore:    &clarityScore,
		PersuasionScore: &persuasionScore,
		ConfidenceScore: &confidenceScore,
		StructureScore:  &structureScore,
	}

	if err := h.repo.SaveMetrics(ctx, metrics); err != nil {
		log.Error().Err(err).Msg("feedback pipeline: failed to save metrics")
		// Non-fatal — feedback is already saved
	}

	log.Info().
		Str("session_id", sessionID.String()).
		Int("overall_score", feedbackResp.Scores.Overall).
		Msg("feedback pipeline completed")
}

// callGPT4o makes a chat completion request to GPT-4o.
func (h *AdminPitchHandler) callGPT4o(ctx context.Context, prompt string) (json.RawMessage, error) {
	reqBody := map[string]interface{}{
		"model": "gpt-4o",
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
		"temperature":   0.7,
		"response_format": map[string]string{"type": "json_object"},
	}

	bodyBytes, _ := json.Marshal(reqBody)

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/chat/completions", bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+h.openaiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http call: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("OpenAI API error %d: %s", resp.StatusCode, string(respBody))
	}

	// Parse the chat completion response
	var chatResp struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.Unmarshal(respBody, &chatResp); err != nil {
		return nil, fmt.Errorf("parse response: %w", err)
	}

	if len(chatResp.Choices) == 0 {
		return nil, fmt.Errorf("no choices in response")
	}

	content := chatResp.Choices[0].Message.Content
	// Strip markdown code fences if present
	content = strings.TrimSpace(content)
	content = strings.TrimPrefix(content, "```json")
	content = strings.TrimPrefix(content, "```")
	content = strings.TrimSuffix(content, "```")
	content = strings.TrimSpace(content)

	return json.RawMessage(content), nil
}

