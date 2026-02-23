package handler

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/email"
	"github.com/guardiangate/api/internal/google"
	"github.com/guardiangate/api/pkg/httputil"
)

// ── Autopilot Config ────────────────────────────────────────────

func (h *AdminHandler) GetAutopilotConfig(w http.ResponseWriter, r *http.Request) {
	cfg, err := h.outreach.GetConfig(r.Context())
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get config")
		return
	}
	if cfg == nil {
		httputil.Error(w, http.StatusNotFound, "config not found")
		return
	}
	httputil.JSON(w, http.StatusOK, cfg)
}

func (h *AdminHandler) UpdateAutopilotConfig(w http.ResponseWriter, r *http.Request) {
	var req domain.OutreachConfig
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	cfg, err := h.outreach.GetConfig(r.Context())
	if err != nil || cfg == nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get config")
		return
	}

	// Update fields
	cfg.SenderName = req.SenderName
	cfg.SenderTitle = req.SenderTitle
	cfg.SenderPhone = req.SenderPhone
	cfg.SenderLinkedIn = req.SenderLinkedIn
	cfg.ActivePersona = req.ActivePersona
	cfg.CompanyBrief = req.CompanyBrief
	cfg.EmailSignature = req.EmailSignature
	if req.SendHourUTC >= 0 && req.SendHourUTC <= 23 {
		cfg.SendHourUTC = req.SendHourUTC
	}
	if req.MaxEmailsPerDay >= 1 && req.MaxEmailsPerDay <= 100 {
		cfg.MaxEmailsPerDay = req.MaxEmailsPerDay
	}
	if req.FollowUpDelayDays >= 1 && req.FollowUpDelayDays <= 30 {
		cfg.FollowUpDelayDays = req.FollowUpDelayDays
	}

	if err := h.outreach.UpdateConfig(r.Context(), cfg); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to update config")
		return
	}
	httputil.JSON(w, http.StatusOK, cfg)
}

func (h *AdminHandler) ToggleAutopilot(w http.ResponseWriter, r *http.Request) {
	cfg, err := h.outreach.GetConfig(r.Context())
	if err != nil || cfg == nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get config")
		return
	}

	cfg.AutopilotEnabled = !cfg.AutopilotEnabled
	if err := h.outreach.UpdateConfig(r.Context(), cfg); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to toggle autopilot")
		return
	}
	httputil.JSON(w, http.StatusOK, cfg)
}

func (h *AdminHandler) GetAutopilotStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.outreach.AutopilotStats(r.Context())
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get autopilot stats")
		return
	}
	httputil.JSON(w, http.StatusOK, stats)
}

// ── Sequences ───────────────────────────────────────────────────

func (h *AdminHandler) ListSequences(w http.ResponseWriter, r *http.Request) {
	seqs, err := h.outreach.ListSequencesWithContacts(r.Context())
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to list sequences")
		return
	}
	if seqs == nil {
		seqs = []domain.OutreachSequence{}
	}
	httputil.JSON(w, http.StatusOK, seqs)
}

func (h *AdminHandler) StartSequence(w http.ResponseWriter, r *http.Request) {
	contactID, err := uuid.Parse(chi.URLParam(r, "contactID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid contact ID")
		return
	}

	// Check contact exists and has email
	contact, err := h.outreach.GetByID(r.Context(), contactID)
	if err != nil || contact == nil {
		httputil.Error(w, http.StatusNotFound, "contact not found")
		return
	}
	if contact.Email == nil || *contact.Email == "" {
		httputil.Error(w, http.StatusBadRequest, "contact has no email address")
		return
	}

	// Check no existing active sequence
	existing, _ := h.outreach.GetSequenceByContactID(r.Context(), contactID)
	if existing != nil && (existing.Status == domain.SequenceActive || existing.Status == domain.SequencePaused) {
		httputil.Error(w, http.StatusConflict, "contact already has an active sequence")
		return
	}

	nextAction := time.Now()
	seq := &domain.OutreachSequence{
		ContactID:    contactID,
		Status:       domain.SequenceActive,
		CurrentStep:  0,
		NextActionAt: &nextAction,
	}
	if err := h.outreach.CreateSequence(r.Context(), seq); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to create sequence")
		return
	}
	httputil.Created(w, seq)
}

func (h *AdminHandler) PauseSequence(w http.ResponseWriter, r *http.Request) {
	h.updateSequenceStatus(w, r, domain.SequencePaused)
}

func (h *AdminHandler) ResumeSequence(w http.ResponseWriter, r *http.Request) {
	h.updateSequenceStatus(w, r, domain.SequenceActive)
}

func (h *AdminHandler) CancelSequence(w http.ResponseWriter, r *http.Request) {
	h.updateSequenceStatus(w, r, domain.SequenceCancelled)
}

func (h *AdminHandler) updateSequenceStatus(w http.ResponseWriter, r *http.Request, status domain.SequenceStatus) {
	id, err := uuid.Parse(chi.URLParam(r, "sequenceID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid sequence ID")
		return
	}

	seq, err := h.outreach.GetSequenceByID(r.Context(), id)
	if err != nil || seq == nil {
		httputil.Error(w, http.StatusNotFound, "sequence not found")
		return
	}

	seq.Status = status
	if status == domain.SequenceActive {
		now := time.Now()
		seq.NextActionAt = &now
	}

	if err := h.outreach.UpdateSequence(r.Context(), seq); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to update sequence")
		return
	}
	httputil.JSON(w, http.StatusOK, seq)
}

func (h *AdminHandler) BulkStartSequences(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ContactIDs []string `json:"contact_ids"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var started, skipped int
	for _, idStr := range req.ContactIDs {
		contactID, err := uuid.Parse(idStr)
		if err != nil {
			skipped++
			continue
		}

		contact, err := h.outreach.GetByID(r.Context(), contactID)
		if err != nil || contact == nil || contact.Email == nil || *contact.Email == "" {
			skipped++
			continue
		}

		existing, _ := h.outreach.GetSequenceByContactID(r.Context(), contactID)
		if existing != nil && (existing.Status == domain.SequenceActive || existing.Status == domain.SequencePaused) {
			skipped++
			continue
		}

		nextAction := time.Now()
		seq := &domain.OutreachSequence{
			ContactID:    contactID,
			Status:       domain.SequenceActive,
			CurrentStep:  0,
			NextActionAt: &nextAction,
		}
		if err := h.outreach.CreateSequence(r.Context(), seq); err != nil {
			skipped++
			continue
		}
		started++
	}

	httputil.JSON(w, http.StatusOK, map[string]int{"started": started, "skipped": skipped})
}

// ── Pending Emails ──────────────────────────────────────────────

func (h *AdminHandler) ListPendingEmails(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	emails, err := h.outreach.ListPendingEmails(r.Context(), status)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to list pending emails")
		return
	}
	if emails == nil {
		emails = []domain.OutreachPendingEmail{}
	}
	httputil.JSON(w, http.StatusOK, emails)
}

func (h *AdminHandler) ApprovePendingEmail(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "emailID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid email ID")
		return
	}

	pe, err := h.outreach.GetPendingEmailByID(r.Context(), id)
	if err != nil || pe == nil {
		httputil.Error(w, http.StatusNotFound, "pending email not found")
		return
	}
	if pe.Status != domain.PendingReview {
		httputil.Error(w, http.StatusBadRequest, "email is not pending review")
		return
	}

	// Send via outreach Gmail
	if h.googleOutreach == nil {
		httputil.Error(w, http.StatusServiceUnavailable, "outreach Google account not configured")
		return
	}

	// Wrap body with branded HTML signature
	cfg, _ := h.outreach.GetConfig(r.Context())
	sigParams := email.SignatureParams{}
	if cfg != nil {
		sigParams = email.SignatureParams{
			Name:     cfg.SenderName,
			Title:    cfg.SenderTitle,
			Email:    cfg.SenderEmail,
			Phone:    cfg.SenderPhone,
			LinkedIn: cfg.SenderLinkedIn,
		}
	}
	htmlBody := email.WrapWithSignature(pe.Body, sigParams)

	sent, err := h.googleOutreach.SendMessage(r.Context(), pe.ToEmail, pe.Subject, htmlBody, "")
	if err != nil {
		if errors.Is(err, google.ErrGoogleDisconnected) {
			httputil.Error(w, http.StatusUnauthorized, "outreach Google account disconnected — please reconnect")
			return
		}
		log.Error().Err(err).Str("to", pe.ToEmail).Msg("failed to send approved email")
		pe.Status = domain.PendingFailed
		_ = h.outreach.UpdatePendingEmail(r.Context(), pe)
		httputil.Error(w, http.StatusInternalServerError, "failed to send email")
		return
	}

	// Update pending email
	pe.Status = domain.PendingSent
	msgID := sent.ID
	pe.GmailMessageID = &msgID
	if err := h.outreach.UpdatePendingEmail(r.Context(), pe); err != nil {
		log.Error().Err(err).Msg("failed to update pending email after send")
	}

	// Update contact status
	contact, _ := h.outreach.GetByID(r.Context(), pe.ContactID)
	if contact != nil {
		contact.EmailStatus = domain.EmailAwaitingReply
		contact.Status = domain.OutreachReachedOut
		now := time.Now()
		contact.LastContactAt = &now
		_ = h.outreach.Update(r.Context(), contact)
	}

	// Update sequence thread ID + advance
	if pe.SequenceID != nil {
		seq, _ := h.outreach.GetSequenceByID(r.Context(), *pe.SequenceID)
		if seq != nil {
			threadID := sent.ThreadID
			seq.GmailThreadID = &threadID
			now := time.Now()
			seq.LastSentAt = &now
			// Schedule next step
			delayDays := 3
			if cfg != nil {
				delayDays = cfg.FollowUpDelayDays
			}
			if seq.CurrentStep < 3 {
				seq.CurrentStep++
				next := now.AddDate(0, 0, delayDays)
				seq.NextActionAt = &next
			} else {
				seq.Status = domain.SequenceCompleted
				seq.NextActionAt = nil
			}
			_ = h.outreach.UpdateSequence(r.Context(), seq)
		}
	}

	// Log activity
	activity := &domain.OutreachActivity{
		ContactID:    pe.ContactID,
		ActivityType: domain.ActivityEmailSent,
		Subject:      pe.Subject,
		Body:         pe.Body,
	}
	_ = h.outreach.CreateActivity(r.Context(), activity)

	httputil.JSON(w, http.StatusOK, pe)
}

func (h *AdminHandler) QueuePendingEmail(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "emailID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid email ID")
		return
	}

	pe, err := h.outreach.GetPendingEmailByID(r.Context(), id)
	if err != nil || pe == nil {
		httputil.Error(w, http.StatusNotFound, "pending email not found")
		return
	}
	if pe.Status != domain.PendingReview {
		httputil.Error(w, http.StatusBadRequest, "email is not pending review")
		return
	}

	pe.Status = domain.PendingApproved
	if err := h.outreach.UpdatePendingEmail(r.Context(), pe); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to queue email")
		return
	}
	httputil.JSON(w, http.StatusOK, pe)
}

func (h *AdminHandler) SendQueuedEmail(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "emailID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid email ID")
		return
	}

	pe, err := h.outreach.GetPendingEmailByID(r.Context(), id)
	if err != nil || pe == nil {
		httputil.Error(w, http.StatusNotFound, "pending email not found")
		return
	}
	if pe.Status != domain.PendingApproved {
		httputil.Error(w, http.StatusBadRequest, "email is not queued")
		return
	}

	if h.googleOutreach == nil {
		httputil.Error(w, http.StatusServiceUnavailable, "outreach Google account not configured")
		return
	}

	// Wrap body with branded HTML signature
	cfg, _ := h.outreach.GetConfig(r.Context())
	sigParams := email.SignatureParams{}
	if cfg != nil {
		sigParams = email.SignatureParams{
			Name:     cfg.SenderName,
			Title:    cfg.SenderTitle,
			Email:    cfg.SenderEmail,
			Phone:    cfg.SenderPhone,
			LinkedIn: cfg.SenderLinkedIn,
		}
	}
	htmlBody := email.WrapWithSignature(pe.Body, sigParams)

	sent, err := h.googleOutreach.SendMessage(r.Context(), pe.ToEmail, pe.Subject, htmlBody, "")
	if err != nil {
		if errors.Is(err, google.ErrGoogleDisconnected) {
			httputil.Error(w, http.StatusUnauthorized, "outreach Google account disconnected — please reconnect")
			return
		}
		log.Error().Err(err).Str("to", pe.ToEmail).Msg("failed to send queued email")
		pe.Status = domain.PendingFailed
		_ = h.outreach.UpdatePendingEmail(r.Context(), pe)
		httputil.Error(w, http.StatusInternalServerError, "failed to send email")
		return
	}

	pe.Status = domain.PendingSent
	msgID := sent.ID
	pe.GmailMessageID = &msgID
	if err := h.outreach.UpdatePendingEmail(r.Context(), pe); err != nil {
		log.Error().Err(err).Msg("failed to update pending email after send")
	}

	contact, _ := h.outreach.GetByID(r.Context(), pe.ContactID)
	if contact != nil {
		contact.EmailStatus = domain.EmailAwaitingReply
		contact.Status = domain.OutreachReachedOut
		now := time.Now()
		contact.LastContactAt = &now
		_ = h.outreach.Update(r.Context(), contact)
	}

	if pe.SequenceID != nil {
		seq, _ := h.outreach.GetSequenceByID(r.Context(), *pe.SequenceID)
		if seq != nil {
			threadID := sent.ThreadID
			seq.GmailThreadID = &threadID
			now := time.Now()
			seq.LastSentAt = &now
			delayDays := 3
			if cfg != nil {
				delayDays = cfg.FollowUpDelayDays
			}
			if seq.CurrentStep < 3 {
				seq.CurrentStep++
				next := now.AddDate(0, 0, delayDays)
				seq.NextActionAt = &next
			} else {
				seq.Status = domain.SequenceCompleted
				seq.NextActionAt = nil
			}
			_ = h.outreach.UpdateSequence(r.Context(), seq)
		}
	}

	activity := &domain.OutreachActivity{
		ContactID:    pe.ContactID,
		ActivityType: domain.ActivityEmailSent,
		Subject:      pe.Subject,
		Body:         pe.Body,
	}
	_ = h.outreach.CreateActivity(r.Context(), activity)

	httputil.JSON(w, http.StatusOK, pe)
}

func (h *AdminHandler) RejectPendingEmail(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "emailID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid email ID")
		return
	}

	pe, err := h.outreach.GetPendingEmailByID(r.Context(), id)
	if err != nil || pe == nil {
		httputil.Error(w, http.StatusNotFound, "pending email not found")
		return
	}

	pe.Status = domain.PendingRejected
	if err := h.outreach.UpdatePendingEmail(r.Context(), pe); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to reject email")
		return
	}
	httputil.JSON(w, http.StatusOK, pe)
}

func (h *AdminHandler) EditPendingEmail(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "emailID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid email ID")
		return
	}

	var req struct {
		Subject string `json:"subject"`
		Body    string `json:"body"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	pe, err := h.outreach.GetPendingEmailByID(r.Context(), id)
	if err != nil || pe == nil {
		httputil.Error(w, http.StatusNotFound, "pending email not found")
		return
	}
	if pe.Status != domain.PendingReview && pe.Status != domain.PendingApproved {
		httputil.Error(w, http.StatusBadRequest, "can only edit emails pending review or queued")
		return
	}

	if req.Subject != "" {
		pe.Subject = req.Subject
	}
	if req.Body != "" {
		pe.Body = req.Body
	}

	if err := h.outreach.UpdatePendingEmail(r.Context(), pe); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to update email")
		return
	}
	httputil.JSON(w, http.StatusOK, pe)
}

// ── Outreach Google OAuth ───────────────────────────────────────

func (h *AdminHandler) requireOutreachGoogle(w http.ResponseWriter) bool {
	if h.googleOutreach == nil {
		httputil.Error(w, http.StatusServiceUnavailable, "outreach Google integration not configured")
		return false
	}
	return true
}

func (h *AdminHandler) GetOutreachGoogleAuthURL(w http.ResponseWriter, r *http.Request) {
	if !h.requireOutreachGoogle(w) {
		return
	}
	state := "phosra-outreach-google"
	url := h.googleOutreach.AuthorizeURL(state)
	httputil.JSON(w, http.StatusOK, map[string]string{"url": url})
}

func (h *AdminHandler) OutreachGoogleCallback(w http.ResponseWriter, r *http.Request) {
	if !h.requireOutreachGoogle(w) {
		return
	}

	var req struct {
		Code string `json:"code"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil || req.Code == "" {
		httputil.Error(w, http.StatusBadRequest, "missing authorization code")
		return
	}

	tokens, err := h.googleOutreach.ExchangeCode(r.Context(), req.Code)
	if err != nil {
		log.Error().Err(err).Msg("outreach Google OAuth code exchange failed")
		httputil.Error(w, http.StatusBadRequest, "failed to exchange code: "+err.Error())
		return
	}

	httputil.JSON(w, http.StatusOK, map[string]interface{}{
		"connected": true,
		"email":     tokens.GoogleEmail,
		"scopes":    tokens.Scopes,
	})
}

func (h *AdminHandler) GetOutreachGoogleStatus(w http.ResponseWriter, r *http.Request) {
	if !h.requireOutreachGoogle(w) {
		return
	}

	connected, email, err := h.googleOutreach.IsConnected(r.Context())
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to check outreach Google status")
		return
	}

	httputil.JSON(w, http.StatusOK, map[string]interface{}{
		"connected": connected,
		"email":     email,
	})
}

func (h *AdminHandler) DisconnectOutreachGoogle(w http.ResponseWriter, r *http.Request) {
	if !h.requireOutreachGoogle(w) {
		return
	}

	if err := h.googleOutreach.Disconnect(r.Context()); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to disconnect outreach Google")
		return
	}
	httputil.JSON(w, http.StatusOK, map[string]string{"status": "disconnected"})
}

// ── Worker API Endpoints ────────────────────────────────────────

func (h *AdminHandler) WorkerSendGmail(w http.ResponseWriter, r *http.Request) {
	if !h.requireOutreachGoogle(w) {
		return
	}

	var req struct {
		To               string `json:"to"`
		Subject          string `json:"subject"`
		Body             string `json:"body"`
		ReplyToMessageID string `json:"reply_to_message_id,omitempty"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	sent, err := h.googleOutreach.SendMessage(r.Context(), req.To, req.Subject, req.Body, req.ReplyToMessageID)
	if err != nil {
		if errors.Is(err, google.ErrGoogleDisconnected) {
			httputil.Error(w, http.StatusUnauthorized, "outreach Google disconnected")
			return
		}
		httputil.Error(w, http.StatusInternalServerError, "failed to send email")
		return
	}
	httputil.JSON(w, http.StatusOK, sent)
}

func (h *AdminHandler) WorkerSearchGmail(w http.ResponseWriter, r *http.Request) {
	if !h.requireOutreachGoogle(w) {
		return
	}

	query := r.URL.Query().Get("q")
	if query == "" {
		httputil.Error(w, http.StatusBadRequest, "query parameter 'q' is required")
		return
	}

	msgs, err := h.googleOutreach.SearchMessages(r.Context(), query, 20)
	if err != nil {
		if errors.Is(err, google.ErrGoogleDisconnected) {
			httputil.Error(w, http.StatusUnauthorized, "outreach Google disconnected")
			return
		}
		httputil.Error(w, http.StatusInternalServerError, "failed to search Gmail")
		return
	}
	httputil.JSON(w, http.StatusOK, msgs)
}

func (h *AdminHandler) WorkerGetGmailMessage(w http.ResponseWriter, r *http.Request) {
	if !h.requireOutreachGoogle(w) {
		return
	}

	messageID := chi.URLParam(r, "messageID")
	if messageID == "" {
		httputil.Error(w, http.StatusBadRequest, "missing message ID")
		return
	}

	msg, err := h.googleOutreach.GetMessage(r.Context(), messageID)
	if err != nil {
		if errors.Is(err, google.ErrGoogleDisconnected) {
			httputil.Error(w, http.StatusUnauthorized, "outreach Google disconnected")
			return
		}
		httputil.Error(w, http.StatusInternalServerError, "failed to get message")
		return
	}
	httputil.JSON(w, http.StatusOK, msg)
}

func (h *AdminHandler) WorkerListCalendarEvents(w http.ResponseWriter, r *http.Request) {
	if !h.requireOutreachGoogle(w) {
		return
	}

	timeMin := time.Now()
	timeMax := timeMin.AddDate(0, 0, 7)

	events, err := h.googleOutreach.ListEvents(r.Context(), timeMin, timeMax, 50, "")
	if err != nil {
		if errors.Is(err, google.ErrGoogleDisconnected) {
			httputil.Error(w, http.StatusUnauthorized, "outreach Google disconnected")
			return
		}
		httputil.Error(w, http.StatusInternalServerError, "failed to list calendar events")
		return
	}
	httputil.JSON(w, http.StatusOK, events)
}

func (h *AdminHandler) WorkerCreateCalendarEvent(w http.ResponseWriter, r *http.Request) {
	if !h.requireOutreachGoogle(w) {
		return
	}

	var req struct {
		Summary     string   `json:"summary"`
		Description string   `json:"description"`
		Start       string   `json:"start"`
		End         string   `json:"end"`
		Attendees   []string `json:"attendees"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	startTime, err := time.Parse(time.RFC3339, req.Start)
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid start time")
		return
	}
	endTime, err := time.Parse(time.RFC3339, req.End)
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid end time")
		return
	}

	event := google.CalendarEvent{
		Summary:     req.Summary,
		Description: req.Description,
		Start:       startTime,
		End:         endTime,
		Attendees:   req.Attendees,
	}

	created, err := h.googleOutreach.CreateEvent(r.Context(), event)
	if err != nil {
		if errors.Is(err, google.ErrGoogleDisconnected) {
			httputil.Error(w, http.StatusUnauthorized, "outreach Google disconnected")
			return
		}
		httputil.Error(w, http.StatusInternalServerError, "failed to create calendar event")
		return
	}
	httputil.Created(w, created)
}

func (h *AdminHandler) WorkerListActiveSequences(w http.ResponseWriter, r *http.Request) {
	seqs, err := h.outreach.ListActiveSequences(r.Context())
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to list active sequences")
		return
	}
	if seqs == nil {
		seqs = []domain.OutreachSequence{}
	}
	httputil.JSON(w, http.StatusOK, seqs)
}

func (h *AdminHandler) WorkerAdvanceSequence(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "sequenceID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid sequence ID")
		return
	}

	var req struct {
		GmailThreadID string `json:"gmail_thread_id,omitempty"`
	}
	_ = httputil.DecodeJSON(r, &req)

	seq, err := h.outreach.GetSequenceByID(r.Context(), id)
	if err != nil || seq == nil {
		httputil.Error(w, http.StatusNotFound, "sequence not found")
		return
	}

	now := time.Now()
	seq.LastSentAt = &now

	if req.GmailThreadID != "" {
		seq.GmailThreadID = &req.GmailThreadID
	}

	cfg, _ := h.outreach.GetConfig(r.Context())
	delayDays := 3
	if cfg != nil {
		delayDays = cfg.FollowUpDelayDays
	}

	if seq.CurrentStep < 3 {
		seq.CurrentStep++
		next := now.AddDate(0, 0, delayDays)
		seq.NextActionAt = &next
	} else {
		seq.Status = domain.SequenceCompleted
		seq.NextActionAt = nil
	}

	if err := h.outreach.UpdateSequence(r.Context(), seq); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to advance sequence")
		return
	}
	httputil.JSON(w, http.StatusOK, seq)
}

func (h *AdminHandler) WorkerCreatePendingEmail(w http.ResponseWriter, r *http.Request) {
	var pe domain.OutreachPendingEmail
	if err := httputil.DecodeJSON(r, &pe); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.outreach.CreatePendingEmail(r.Context(), &pe); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to create pending email")
		return
	}
	httputil.Created(w, pe)
}

func (h *AdminHandler) WorkerUpdateContact(w http.ResponseWriter, r *http.Request) {
	contactID, err := uuid.Parse(chi.URLParam(r, "contactID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid contact ID")
		return
	}

	var req struct {
		Status         *string    `json:"status"`
		Email          *string    `json:"email"`
		EmailStatus    *string    `json:"email_status"`
		LinkedinURL    *string    `json:"linkedin_url"`
		TwitterHandle  *string    `json:"twitter_handle"`
		Title          *string    `json:"title"`
		Notes          *string    `json:"notes"`
		LastContactAt  *time.Time `json:"last_contact_at"`
		NextFollowupAt *time.Time `json:"next_followup_at"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	contact, err := h.outreach.GetByID(r.Context(), contactID)
	if err != nil || contact == nil {
		httputil.Error(w, http.StatusNotFound, "contact not found")
		return
	}

	if req.Status != nil {
		contact.Status = domain.OutreachStatus(*req.Status)
	}
	if req.Email != nil {
		contact.Email = req.Email
	}
	if req.EmailStatus != nil {
		contact.EmailStatus = domain.EmailStatus(*req.EmailStatus)
	}
	if req.LinkedinURL != nil {
		contact.LinkedinURL = req.LinkedinURL
	}
	if req.TwitterHandle != nil {
		contact.TwitterHandle = req.TwitterHandle
	}
	if req.Title != nil {
		contact.Title = *req.Title
	}
	if req.Notes != nil {
		contact.Notes = req.Notes
	}
	if req.LastContactAt != nil {
		contact.LastContactAt = req.LastContactAt
	}
	if req.NextFollowupAt != nil {
		contact.NextFollowupAt = req.NextFollowupAt
	}

	if err := h.outreach.Update(r.Context(), contact); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to update contact")
		return
	}
	httputil.JSON(w, http.StatusOK, contact)
}

func (h *AdminHandler) WorkerCreateActivity(w http.ResponseWriter, r *http.Request) {
	contactID, err := uuid.Parse(chi.URLParam(r, "contactID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid contact ID")
		return
	}

	var req struct {
		ActivityType         string   `json:"activity_type"`
		Subject              string   `json:"subject"`
		Body                 string   `json:"body"`
		IntentClassification *string  `json:"intent_classification,omitempty"`
		ConfidenceScore      *float64 `json:"confidence_score,omitempty"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	activity := &domain.OutreachActivity{
		ContactID:            contactID,
		ActivityType:         domain.OutreachActivityType(req.ActivityType),
		Subject:              req.Subject,
		Body:                 req.Body,
		IntentClassification: req.IntentClassification,
		ConfidenceScore:      req.ConfidenceScore,
	}
	if err := h.outreach.CreateActivity(r.Context(), activity); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to create activity")
		return
	}
	httputil.Created(w, activity)
}

func (h *AdminHandler) WorkerGetConfig(w http.ResponseWriter, r *http.Request) {
	cfg, err := h.outreach.GetConfig(r.Context())
	if err != nil || cfg == nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get config")
		return
	}
	httputil.JSON(w, http.StatusOK, cfg)
}

func (h *AdminHandler) WorkerGetContact(w http.ResponseWriter, r *http.Request) {
	contactID, err := uuid.Parse(chi.URLParam(r, "contactID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid contact ID")
		return
	}

	contact, err := h.outreach.GetByID(r.Context(), contactID)
	if err != nil || contact == nil {
		httputil.Error(w, http.StatusNotFound, "contact not found")
		return
	}
	httputil.JSON(w, http.StatusOK, contact)
}

func (h *AdminHandler) ListRecentActivities(w http.ResponseWriter, r *http.Request) {
	limit := 50
	if l := r.URL.Query().Get("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 {
			limit = n
		}
	}
	activities, err := h.outreach.ListRecentActivities(r.Context(), limit)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to list recent activities")
		return
	}
	if activities == nil {
		activities = []domain.OutreachActivityWithContact{}
	}
	httputil.JSON(w, http.StatusOK, activities)
}

func (h *AdminHandler) GetActivitySummary(w http.ResponseWriter, r *http.Request) {
	sinceStr := r.URL.Query().Get("since")
	if sinceStr == "" {
		httputil.Error(w, http.StatusBadRequest, "missing 'since' query parameter")
		return
	}
	since, err := time.Parse(time.RFC3339, sinceStr)
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid 'since' timestamp")
		return
	}
	summary, err := h.outreach.ActivitySummary(r.Context(), since)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get activity summary")
		return
	}
	httputil.JSON(w, http.StatusOK, summary)
}

func (h *AdminHandler) WorkerCountSentToday(w http.ResponseWriter, r *http.Request) {
	count, err := h.outreach.CountSentToday(r.Context())
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to count sent emails")
		return
	}
	httputil.JSON(w, http.StatusOK, map[string]int{"count": count})
}
