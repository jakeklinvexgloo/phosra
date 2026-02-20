package domain

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// ── Pitch Coaching ──────────────────────────────────────────────

// PitchPersona is the type of AI persona for the mock call.
type PitchPersona string

const (
	PersonaInvestor   PitchPersona = "investor"
	PersonaPartner    PitchPersona = "partner"
	PersonaLegislator PitchPersona = "legislator"
)

// PitchSessionStatus tracks session lifecycle.
type PitchSessionStatus string

const (
	PitchConfiguring PitchSessionStatus = "configuring"
	PitchActive      PitchSessionStatus = "active"
	PitchProcessing  PitchSessionStatus = "processing"
	PitchCompleted   PitchSessionStatus = "completed"
	PitchFailed      PitchSessionStatus = "failed"
)

// PitchSession represents a single pitch practice session.
type PitchSession struct {
	ID                 uuid.UUID          `json:"id"`
	UserID             uuid.UUID          `json:"user_id"`
	Persona            PitchPersona       `json:"persona"`
	PersonaConfig      json.RawMessage    `json:"persona_config"`
	Status             PitchSessionStatus `json:"status"`
	StartedAt          *time.Time         `json:"started_at,omitempty"`
	EndedAt            *time.Time         `json:"ended_at,omitempty"`
	DurationSeconds    *int               `json:"duration_seconds,omitempty"`
	RecordingPath      *string            `json:"recording_path,omitempty"`
	RecordingSizeBytes *int64             `json:"recording_size_bytes,omitempty"`
	Transcript         json.RawMessage    `json:"transcript,omitempty"`
	Feedback           json.RawMessage    `json:"feedback,omitempty"`
	OverallScore       *int               `json:"overall_score,omitempty"`
	CreatedAt          time.Time          `json:"created_at"`
	UpdatedAt          time.Time          `json:"updated_at"`
}

// TranscriptEntry is a single turn in the conversation transcript.
type TranscriptEntry struct {
	Speaker string `json:"speaker"` // "user" or "ai"
	Text    string `json:"text"`
	StartMs int    `json:"start_ms"`
	EndMs   int    `json:"end_ms"`
}

// PitchFeedback is the structured coaching feedback from GPT-4o.
type PitchFeedback struct {
	Summary             string           `json:"summary"`
	Strengths           []string         `json:"strengths"`
	Improvements        []string         `json:"improvements"`
	SpecificMoments     []FeedbackMoment `json:"specific_moments"`
	RecommendedPractice string           `json:"recommended_practice"`
}

// FeedbackMoment annotates a specific timestamp in the session.
type FeedbackMoment struct {
	TimestampMs int    `json:"timestamp_ms"`
	Note        string `json:"note"`
}

// PitchSessionMetrics holds detailed per-session analytics.
type PitchSessionMetrics struct {
	ID                uuid.UUID       `json:"id"`
	SessionID         uuid.UUID       `json:"session_id"`
	FillerWordCount   int             `json:"filler_word_count"`
	FillerWords       json.RawMessage `json:"filler_words"`
	WordsPerMinute    *float64        `json:"words_per_minute,omitempty"`
	SilencePercentage *float64        `json:"silence_percentage,omitempty"`
	ClarityScore      *int            `json:"clarity_score,omitempty"`
	PersuasionScore   *int            `json:"persuasion_score,omitempty"`
	ConfidenceScore   *int            `json:"confidence_score,omitempty"`
	StructureScore    *int            `json:"structure_score,omitempty"`
	EmotionData       json.RawMessage `json:"emotion_data,omitempty"`
	DominantEmotions  json.RawMessage `json:"dominant_emotions,omitempty"`
	CreatedAt         time.Time       `json:"created_at"`
}
