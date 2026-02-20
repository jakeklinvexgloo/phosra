package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
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
	"github.com/guardiangate/api/internal/service"
	"github.com/guardiangate/api/pkg/httputil"
)

const (
	// recordingDir is the local directory for pitch session recordings.
	recordingDir = "./data/pitch-recordings"
	// maxRecordingSize is the maximum upload size (500 MB).
	maxRecordingSize = 500 << 20
)

// AdminPitchHandler handles pitch coaching sessions and WebSocket relay.
type AdminPitchHandler struct {
	repo             *postgres.AdminPitchRepo
	openaiKey        string
	transcriptionSvc *service.TranscriptionService // nil if AssemblyAI key not set
	emotionSvc       *service.EmotionService       // nil if Hume AI key not set
}

func NewAdminPitchHandler(repo *postgres.AdminPitchRepo, openaiKey string, transcriptionSvc *service.TranscriptionService, emotionSvc *service.EmotionService) *AdminPitchHandler {
	// Ensure recording directory exists
	if err := os.MkdirAll(recordingDir, 0755); err != nil {
		log.Warn().Err(err).Msg("failed to create pitch recordings directory")
	}
	return &AdminPitchHandler{repo: repo, openaiKey: openaiKey, transcriptionSvc: transcriptionSvc, emotionSvc: emotionSvc}
}

// ── Persona System Prompts ─────────────────────────────────────

var personaPrompts = map[domain.PitchPersona]string{
	domain.PersonaInvestor: `You are a Series A venture capital partner at a top-tier firm. You're taking a first meeting with a founder pitching their child safety technology startup called "Phosra" (formerly GuardianGate).

CONVERSATION STYLE — THIS IS A REAL CONVERSATION, NOT AN INTERVIEW:
- You are having a natural, flowing dialogue — not reading from a script
- React authentically to what the founder says before asking your next question
- If they say something interesting, dig deeper with follow-up questions
- If they're vague, push for specifics: "Can you put a number on that?" or "Walk me through a specific example"
- Occasionally share your own observations: "We see a lot of companies in this space doing X..."
- If there's a pause, fill it naturally — "Take your time" or ask a related question
- Don't ask more than one question at a time — let the conversation breathe
- Keep your turns SHORT — 1-2 sentences max, like a real conversation
- Reference what they just said before pivoting topics

KEY TOPICS TO COVER (work these in naturally, don't rush):
- Market size and timing — why now?
- Unit economics and business model
- Competitive moat — what stops incumbents?
- Team and relevant experience
- Go-to-market strategy
- Current traction and metrics

BEGIN THE CALL by greeting them warmly and asking them to give you the quick overview.`,

	domain.PersonaPartner: `You are a VP of Trust & Safety at a major social media platform (think TikTok, Instagram, or YouTube scale). You're evaluating Phosra as a potential technology partner for child safety compliance.

CONVERSATION STYLE — THIS IS A REAL CONVERSATION, NOT AN INTERVIEW:
- You are having a natural, flowing dialogue between two professionals
- React to what they say — "Interesting, so you're saying..." or "That's actually a pain point for us too"
- Share context about YOUR challenges: "We've been struggling with X" or "Our current vendor does Y but..."
- Ask follow-up questions based on their answers, don't just move to the next topic
- Be direct and practical — you're a busy executive, not a polite listener
- If something sounds too good to be true, say so: "Every vendor says that. What makes you different?"
- Keep your turns SHORT — 1-2 sentences, like texting but spoken
- One question at a time, let them answer fully

KEY TOPICS TO COVER (weave in naturally):
- Technical integration — API, latency, reliability
- Compliance coverage — COPPA, KOSA, EU regulations
- Scale — can this handle your volume?
- Build vs buy — why shouldn't we build this ourselves?
- Pricing and ROI
- False positive rates and UX impact

BEGIN THE CALL by introducing yourself and explaining what you're looking for.`,

	domain.PersonaLegislator: `You are a United States Senator on the Commerce Committee focused on child safety legislation. You're meeting with a technology company to understand how their tools can support enforcement of COPPA, KOSA, and state-level child safety bills.

CONVERSATION STYLE — THIS IS A REAL CONVERSATION, NOT A HEARING:
- You're in a private meeting, not a public hearing — be conversational, not formal
- React to what they say: "That's concerning" or "My colleagues have been asking about exactly that"
- Share your perspective: "The challenge we face is..." or "When I talk to parents in my state, they tell me..."
- Ask follow-up questions — don't jump between topics
- If they use jargon, ask them to explain it simply: "Break that down for me — how would you explain that to a parent?"
- Be genuinely curious — you want to understand this deeply enough to draft policy
- Keep your turns SHORT — 1-2 sentences, conversational
- One question at a time

KEY TOPICS TO COVER (weave in naturally):
- Specific legislation mapping — COPPA, KOSA, state AG enforcement
- Privacy implications — surveillance risks, data collection
- Age verification accuracy and methods
- The enforcement gap — why existing laws fall short
- What platforms are doing vs should be doing
- Concrete examples and data for your committee

BEGIN THE CALL by thanking them for coming in and asking about the problem they're solving.`,
}

// Difficulty modifiers appended to persona prompts
var difficultyModifiers = map[string]string{
	"easy": `

DIFFICULTY: EASY
- Be warm, friendly, and encouraging
- Ask softball questions that give the founder an easy win
- Nod along and validate their points generously
- If they stumble, gently help them get back on track
- Compliment specific aspects of their pitch
- Ask one or two light probing questions but don't push back hard`,

	"medium": `

DIFFICULTY: MEDIUM (default)
- Be professional and interested but appropriately probing
- Ask standard due diligence questions
- Push back gently on unsupported claims
- Balance skepticism with genuine curiosity`,

	"hard": `

DIFFICULTY: HARD
- Be highly skeptical and challenge every claim
- Interrupt occasionally when answers are too long or vague
- Ask gotcha questions — "What happens when a competitor with 10x your resources enters this market?"
- Push back forcefully on weak points — "Those numbers don't add up."
- Show impatience if the founder rambles
- Reference specific competitors and ask why they can't just do this
- Make the founder earn every point they make`,
}

// Scenario context modifiers
var scenarioModifiers = map[string]string{
	"cold_pitch":               "\nSCENARIO: This is a cold first meeting. You have no prior context about the founder or their company. Start from zero.",
	"warm_intro":               "\nSCENARIO: You were introduced to this founder by a trusted mutual connection. You're positively predisposed but still need to be convinced on the merits.",
	"board_update":             "\nSCENARIO: This is a board meeting / investor update. You already invested and want to hear about progress, challenges, and how runway is being managed. Ask about metrics, burn rate, and milestones.",
	"committee_hearing":        "\nSCENARIO: This is a formal committee hearing. Multiple people may ask questions. Be formal, structured, and focused on policy implications. Ask about enforcement mechanisms and measurable outcomes.",
	"partnership_negotiation":  "\nSCENARIO: You're past the pitch phase and discussing specific partnership terms. Focus on pricing, SLAs, integration timeline, data handling, and competitive exclusivity.",
}

// buildPersonaPrompt constructs the full system prompt from base persona + config modifiers.
func buildPersonaPrompt(persona domain.PitchPersona, personaConfig json.RawMessage) string {
	base, ok := personaPrompts[persona]
	if !ok {
		base = personaPrompts[domain.PersonaInvestor]
	}

	// Parse persona config
	var cfg struct {
		Difficulty    string   `json:"difficulty"`
		Scenario      string   `json:"scenario"`
		CustomContext string   `json:"custom_context"`
		FocusAreas    []string `json:"focus_areas"`
	}
	if len(personaConfig) > 0 && string(personaConfig) != "{}" {
		json.Unmarshal(personaConfig, &cfg)
	}

	prompt := base

	// Apply difficulty modifier
	if mod, ok := difficultyModifiers[cfg.Difficulty]; ok {
		prompt += mod
	}

	// Apply scenario modifier
	if mod, ok := scenarioModifiers[cfg.Scenario]; ok {
		prompt += mod
	}

	// Apply custom context
	if cfg.CustomContext != "" {
		prompt += fmt.Sprintf("\n\nADDITIONAL CONTEXT FROM USER: %s", cfg.CustomContext)
	}

	// Apply focus areas
	if len(cfg.FocusAreas) > 0 {
		prompt += "\n\nFOCUS YOUR QUESTIONS ON THESE AREAS:"
		for _, area := range cfg.FocusAreas {
			prompt += fmt.Sprintf("\n- %s", area)
		}
	}

	return prompt
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

// ── Recording Upload / Stream ──────────────────────────────────

// UploadRecording accepts a multipart file upload for a session recording.
func (h *AdminPitchHandler) UploadRecording(w http.ResponseWriter, r *http.Request) {
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

	// Parse multipart (max 500MB)
	if err := r.ParseMultipartForm(maxRecordingSize); err != nil {
		httputil.Error(w, http.StatusBadRequest, "file too large or invalid multipart")
		return
	}

	file, header, err := r.FormFile("recording")
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "missing 'recording' file field")
		return
	}
	defer file.Close()

	// Write to disk
	filename := id.String() + ".webm"
	destPath := filepath.Join(recordingDir, filename)

	dst, err := os.Create(destPath)
	if err != nil {
		log.Error().Err(err).Msg("failed to create recording file")
		httputil.Error(w, http.StatusInternalServerError, "failed to save recording")
		return
	}
	defer dst.Close()

	written, err := io.Copy(dst, file)
	if err != nil {
		log.Error().Err(err).Msg("failed to write recording file")
		httputil.Error(w, http.StatusInternalServerError, "failed to save recording")
		return
	}

	// Save metadata in DB
	if err := h.repo.SaveRecordingMeta(r.Context(), id, destPath, written); err != nil {
		log.Error().Err(err).Msg("failed to save recording metadata")
	}

	log.Info().
		Str("session_id", id.String()).
		Str("filename", header.Filename).
		Int64("size_bytes", written).
		Msg("pitch recording uploaded")

	// If AssemblyAI is configured, trigger transcription in background
	if h.transcriptionSvc != nil {
		go h.runAssemblyAITranscription(id, destPath)
	}

	// If Hume AI is configured, trigger emotion analysis in background
	if h.emotionSvc != nil {
		go h.runEmotionAnalysis(id, destPath)
	}

	httputil.JSON(w, http.StatusOK, map[string]interface{}{
		"path":       destPath,
		"size_bytes": written,
	})
}

// StreamRecording serves a recording file with support for Range requests (video seeking).
func (h *AdminPitchHandler) StreamRecording(w http.ResponseWriter, r *http.Request) {
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

	var recordingPath string
	if session.RecordingPath != nil {
		recordingPath = *session.RecordingPath
	}
	if recordingPath == "" {
		httputil.Error(w, http.StatusNotFound, "no recording for this session")
		return
	}

	// Open file
	f, err := os.Open(recordingPath)
	if err != nil {
		httputil.Error(w, http.StatusNotFound, "recording file not found")
		return
	}
	defer f.Close()

	stat, err := f.Stat()
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to stat recording")
		return
	}

	w.Header().Set("Content-Type", "video/webm")
	w.Header().Set("Accept-Ranges", "bytes")

	// Handle Range header for seeking
	rangeHeader := r.Header.Get("Range")
	if rangeHeader != "" {
		// Parse "bytes=start-end"
		rangeHeader = strings.TrimPrefix(rangeHeader, "bytes=")
		parts := strings.SplitN(rangeHeader, "-", 2)
		start, _ := strconv.ParseInt(parts[0], 10, 64)
		end := stat.Size() - 1
		if len(parts) > 1 && parts[1] != "" {
			end, _ = strconv.ParseInt(parts[1], 10, 64)
		}

		if start > stat.Size()-1 {
			w.Header().Set("Content-Range", fmt.Sprintf("bytes */%d", stat.Size()))
			w.WriteHeader(http.StatusRequestedRangeNotSatisfiable)
			return
		}

		contentLen := end - start + 1
		w.Header().Set("Content-Range", fmt.Sprintf("bytes %d-%d/%d", start, end, stat.Size()))
		w.Header().Set("Content-Length", strconv.FormatInt(contentLen, 10))
		w.WriteHeader(http.StatusPartialContent)

		f.Seek(start, io.SeekStart)
		io.CopyN(w, f, contentLen)
		return
	}

	// Full file response
	w.Header().Set("Content-Length", strconv.FormatInt(stat.Size(), 10))
	io.Copy(w, f)
}

// runAssemblyAITranscription transcribes the recording with AssemblyAI and updates metrics.
func (h *AdminPitchHandler) runAssemblyAITranscription(sessionID uuid.UUID, recordingPath string) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute) // transcription can take a while
	defer cancel()

	log.Info().
		Str("session_id", sessionID.String()).
		Str("path", recordingPath).
		Msg("starting AssemblyAI transcription")

	result, err := h.transcriptionSvc.TranscribeFile(ctx, recordingPath)
	if err != nil {
		log.Error().Err(err).Str("session_id", sessionID.String()).Msg("AssemblyAI transcription failed")
		return
	}

	log.Info().
		Str("session_id", sessionID.String()).
		Int("word_count", len(result.Words)).
		Float64("duration_sec", result.AudioDurationSec).
		Int("filler_words", result.FillerWordCount).
		Msg("AssemblyAI transcription complete")

	// Update metrics with precise AssemblyAI data
	existing, _ := h.repo.GetMetrics(ctx, sessionID)
	if existing != nil {
		// Update with more accurate data from AssemblyAI
		existing.FillerWordCount = result.FillerWordCount
		fillerJSON, _ := json.Marshal(result.FillerWords)
		existing.FillerWords = fillerJSON
		existing.WordsPerMinute = &result.WordsPerMinute
		silPct := result.SilencePct
		existing.SilencePercentage = &silPct

		// Delete old + re-insert (simpler than partial update for JSONB)
		h.repo.DeleteMetrics(ctx, sessionID)
		if err := h.repo.SaveMetrics(ctx, existing); err != nil {
			log.Error().Err(err).Msg("failed to update metrics with AssemblyAI data")
		}
	}
}

// runEmotionAnalysis sends the recording to Hume AI for vocal emotion analysis.
func (h *AdminPitchHandler) runEmotionAnalysis(sessionID uuid.UUID, recordingPath string) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	log.Info().
		Str("session_id", sessionID.String()).
		Str("path", recordingPath).
		Msg("starting Hume AI emotion analysis")

	analysis, err := h.emotionSvc.AnalyzeFile(ctx, recordingPath)
	if err != nil {
		log.Error().Err(err).Str("session_id", sessionID.String()).Msg("Hume AI emotion analysis failed")
		return
	}

	log.Info().
		Str("session_id", sessionID.String()).
		Int("frames", len(analysis.Frames)).
		Float64("confidence_avg", analysis.ConfidenceAvg).
		Float64("nervousness_avg", analysis.NervousnessAvg).
		Msg("Hume AI emotion analysis complete")

	// Marshal emotion data for storage
	emotionDataJSON, _ := json.Marshal(analysis)
	dominantJSON, _ := json.Marshal(analysis.DominantEmotions)

	// Update metrics — get existing or create new
	existing, _ := h.repo.GetMetrics(ctx, sessionID)
	if existing != nil {
		existing.EmotionData = emotionDataJSON
		existing.DominantEmotions = dominantJSON
		h.repo.DeleteMetrics(ctx, sessionID)
		if err := h.repo.SaveMetrics(ctx, existing); err != nil {
			log.Error().Err(err).Msg("failed to update metrics with emotion data")
		}
	} else {
		// Create a new metrics record with just emotion data
		metrics := &domain.PitchSessionMetrics{
			SessionID:        sessionID,
			EmotionData:      emotionDataJSON,
			DominantEmotions: dominantJSON,
		}
		if err := h.repo.SaveMetrics(ctx, metrics); err != nil {
			log.Error().Err(err).Msg("failed to save emotion metrics")
		}
	}
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

	// Send session.update with persona prompt and voice config (including difficulty/scenario)
	persona := session.Persona
	systemPrompt := buildPersonaPrompt(persona, session.PersonaConfig)

	sessionUpdate := map[string]interface{}{
		"type": "session.update",
		"session": map[string]interface{}{
			"modalities":          []string{"text", "audio"},
			"instructions":        systemPrompt,
			"voice":               "alloy",
			"input_audio_format":  "pcm16",
			"output_audio_format": "pcm16",
			"input_audio_transcription": map[string]interface{}{
				"model": "whisper-1",
			},
			"turn_detection": map[string]interface{}{
				"type":                "server_vad",
				"threshold":           0.5,
				"prefix_padding_ms":   300,
				"silence_duration_ms": 700,
			},
		},
	}

	updateJSON, _ := json.Marshal(sessionUpdate)
	if err := openaiConn.Write(r.Context(), websocket.MessageText, updateJSON); err != nil {
		log.Error().Err(err).Msg("failed to send session.update to OpenAI")
		browserConn.Close(websocket.StatusInternalError, "failed to configure AI session")
		return
	}

	// Trigger the AI to speak first — kick off the conversation
	responseCreate := map[string]interface{}{
		"type": "response.create",
		"response": map[string]interface{}{
			"modalities": []string{"text", "audio"},
		},
	}
	responseJSON, _ := json.Marshal(responseCreate)
	if err := openaiConn.Write(r.Context(), websocket.MessageText, responseJSON); err != nil {
		log.Error().Err(err).Msg("failed to send response.create to OpenAI")
	}

	log.Info().
		Str("session_id", sessionID.String()).
		Str("persona", string(persona)).
		Msg("pitch coaching WebSocket relay established — AI will speak first")

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

	// Check if emotion data is available from a prior Hume AI analysis
	var emotionContext string
	existingMetrics, _ := h.repo.GetMetrics(ctx, sessionID)
	if existingMetrics != nil && len(existingMetrics.EmotionData) > 0 && string(existingMetrics.EmotionData) != "null" {
		var emotionAnalysis service.EmotionAnalysis
		if err := json.Unmarshal(existingMetrics.EmotionData, &emotionAnalysis); err == nil {
			emotionContext = fmt.Sprintf(`

=== VOCAL EMOTION DATA (from Hume AI) ===
Average Confidence: %.1f/100
Average Enthusiasm: %.1f/100
Average Nervousness: %.1f/100
Average Calmness: %.1f/100
Lowest Confidence Point: %.1f/100 at %dms
Nervousness Spike Count: %d
Top Dominant Emotions: `,
				emotionAnalysis.ConfidenceAvg,
				emotionAnalysis.EnthusiasmAvg,
				emotionAnalysis.NervousnessAvg,
				emotionAnalysis.CalmAvg,
				emotionAnalysis.ConfidenceMin,
				emotionAnalysis.ConfidenceMinMs,
				len(emotionAnalysis.NervousnessPeaks))

			for i, e := range emotionAnalysis.DominantEmotions {
				if i > 0 {
					emotionContext += ", "
				}
				emotionContext += fmt.Sprintf("%s (%.2f)", e.Name, e.Score)
			}
			emotionContext += `
=== END EMOTION DATA ===

Use this vocal emotion data to provide richer coaching insights about the user's vocal delivery, confidence levels, and emotional state during the pitch.`
		}
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
%s
=== TRANSCRIPT ===
%s
=== END TRANSCRIPT ===

Respond with ONLY the JSON object, no markdown formatting.`, session.Persona, emotionContext, transcriptText.String())

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

