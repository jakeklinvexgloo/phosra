package postgres

import (
	"context"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type AdminPitchRepo struct {
	*DB
}

func NewAdminPitchRepo(db *DB) *AdminPitchRepo {
	return &AdminPitchRepo{DB: db}
}

// Create inserts a new pitch coaching session.
func (r *AdminPitchRepo) Create(ctx context.Context, s *domain.PitchSession) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	now := time.Now()
	s.CreatedAt = now
	s.UpdatedAt = now
	if s.PersonaConfig == nil {
		s.PersonaConfig = json.RawMessage(`{}`)
	}

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO admin_pitch_sessions
		 (id, user_id, persona, persona_config, status, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		s.ID, s.UserID, s.Persona, s.PersonaConfig, s.Status, s.CreatedAt, s.UpdatedAt,
	)
	return err
}

// GetByID fetches a single pitch session with all fields.
func (r *AdminPitchRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.PitchSession, error) {
	var s domain.PitchSession
	err := r.Pool.QueryRow(ctx,
		`SELECT id, user_id, persona, persona_config, status,
		        started_at, ended_at, duration_seconds,
		        recording_path, recording_size_bytes,
		        transcript, feedback, overall_score,
		        created_at, updated_at
		 FROM admin_pitch_sessions WHERE id = $1`, id,
	).Scan(
		&s.ID, &s.UserID, &s.Persona, &s.PersonaConfig, &s.Status,
		&s.StartedAt, &s.EndedAt, &s.DurationSeconds,
		&s.RecordingPath, &s.RecordingSizeBytes,
		&s.Transcript, &s.Feedback, &s.OverallScore,
		&s.CreatedAt, &s.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// List returns all pitch sessions for a user, newest first.
func (r *AdminPitchRepo) List(ctx context.Context, userID uuid.UUID) ([]domain.PitchSession, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, user_id, persona, persona_config, status,
		        started_at, ended_at, duration_seconds,
		        recording_path, recording_size_bytes,
		        transcript, feedback, overall_score,
		        created_at, updated_at
		 FROM admin_pitch_sessions
		 WHERE user_id = $1
		 ORDER BY created_at DESC`, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []domain.PitchSession
	for rows.Next() {
		var s domain.PitchSession
		if err := rows.Scan(
			&s.ID, &s.UserID, &s.Persona, &s.PersonaConfig, &s.Status,
			&s.StartedAt, &s.EndedAt, &s.DurationSeconds,
			&s.RecordingPath, &s.RecordingSizeBytes,
			&s.Transcript, &s.Feedback, &s.OverallScore,
			&s.CreatedAt, &s.UpdatedAt,
		); err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}
	return sessions, rows.Err()
}

// UpdateStatus changes the session status and sets timing fields.
func (r *AdminPitchRepo) UpdateStatus(ctx context.Context, id uuid.UUID, status domain.PitchSessionStatus) error {
	now := time.Now()

	switch status {
	case domain.PitchActive:
		_, err := r.Pool.Exec(ctx,
			`UPDATE admin_pitch_sessions
			 SET status = $1, started_at = $2, updated_at = $2
			 WHERE id = $3`, status, now, id)
		return err

	case domain.PitchProcessing, domain.PitchCompleted, domain.PitchFailed:
		_, err := r.Pool.Exec(ctx,
			`UPDATE admin_pitch_sessions
			 SET status = $1, ended_at = $2, updated_at = $2,
			     duration_seconds = EXTRACT(EPOCH FROM ($2 - COALESCE(started_at, $2)))::INTEGER
			 WHERE id = $3`, status, now, id)
		return err

	default:
		_, err := r.Pool.Exec(ctx,
			`UPDATE admin_pitch_sessions
			 SET status = $1, updated_at = $2
			 WHERE id = $3`, status, now, id)
		return err
	}
}

// SaveTranscript stores the accumulated conversation transcript.
func (r *AdminPitchRepo) SaveTranscript(ctx context.Context, id uuid.UUID, transcript json.RawMessage) error {
	_, err := r.Pool.Exec(ctx,
		`UPDATE admin_pitch_sessions
		 SET transcript = $1, updated_at = NOW()
		 WHERE id = $2`, transcript, id)
	return err
}

// SaveFeedback stores the coaching feedback and overall score.
func (r *AdminPitchRepo) SaveFeedback(ctx context.Context, id uuid.UUID, feedback json.RawMessage, overallScore int) error {
	_, err := r.Pool.Exec(ctx,
		`UPDATE admin_pitch_sessions
		 SET feedback = $1, overall_score = $2, status = 'completed', updated_at = NOW()
		 WHERE id = $3`, feedback, overallScore, id)
	return err
}

// SaveMetrics inserts a detailed metrics row for a session.
func (r *AdminPitchRepo) SaveMetrics(ctx context.Context, m *domain.PitchSessionMetrics) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	m.CreatedAt = time.Now()
	if m.FillerWords == nil {
		m.FillerWords = json.RawMessage(`[]`)
	}

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO admin_pitch_session_metrics
		 (id, session_id, filler_word_count, filler_words, words_per_minute, silence_percentage,
		  clarity_score, persuasion_score, confidence_score, structure_score,
		  emotion_data, dominant_emotions, created_at)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
		m.ID, m.SessionID, m.FillerWordCount, m.FillerWords,
		m.WordsPerMinute, m.SilencePercentage,
		m.ClarityScore, m.PersuasionScore, m.ConfidenceScore, m.StructureScore,
		m.EmotionData, m.DominantEmotions, m.CreatedAt,
	)
	return err
}

// GetMetrics returns the metrics for a session.
func (r *AdminPitchRepo) GetMetrics(ctx context.Context, sessionID uuid.UUID) (*domain.PitchSessionMetrics, error) {
	var m domain.PitchSessionMetrics
	err := r.Pool.QueryRow(ctx,
		`SELECT id, session_id, filler_word_count, filler_words,
		        words_per_minute, silence_percentage,
		        clarity_score, persuasion_score, confidence_score, structure_score,
		        emotion_data, dominant_emotions, created_at
		 FROM admin_pitch_session_metrics WHERE session_id = $1`, sessionID,
	).Scan(
		&m.ID, &m.SessionID, &m.FillerWordCount, &m.FillerWords,
		&m.WordsPerMinute, &m.SilencePercentage,
		&m.ClarityScore, &m.PersuasionScore, &m.ConfidenceScore, &m.StructureScore,
		&m.EmotionData, &m.DominantEmotions, &m.CreatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

// Delete removes a session and cascades to metrics.
func (r *AdminPitchRepo) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`DELETE FROM admin_pitch_sessions WHERE id = $1`, id)
	return err
}

// DeleteMetrics removes the metrics row for a session (used before re-inserting updated metrics).
func (r *AdminPitchRepo) DeleteMetrics(ctx context.Context, sessionID uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`DELETE FROM admin_pitch_session_metrics WHERE session_id = $1`, sessionID)
	return err
}

// SaveRecordingMeta updates the recording path and size after upload.
func (r *AdminPitchRepo) SaveRecordingMeta(ctx context.Context, id uuid.UUID, path string, sizeBytes int64) error {
	_, err := r.Pool.Exec(ctx,
		`UPDATE admin_pitch_sessions
		 SET recording_path = $1, recording_size_bytes = $2, updated_at = NOW()
		 WHERE id = $3`, path, sizeBytes, id)
	return err
}
