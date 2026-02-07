package service

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/repository"
)

var ErrWebhookNotFound = errors.New("webhook not found")

type WebhookService struct {
	webhooks   repository.WebhookRepository
	deliveries repository.WebhookDeliveryRepository
	members    repository.FamilyMemberRepository
	httpClient *http.Client
}

func NewWebhookService(
	webhooks repository.WebhookRepository,
	deliveries repository.WebhookDeliveryRepository,
	members repository.FamilyMemberRepository,
) *WebhookService {
	return &WebhookService{
		webhooks:   webhooks,
		deliveries: deliveries,
		members:    members,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

func (s *WebhookService) Create(ctx context.Context, userID, familyID uuid.UUID, url string, events []string) (*domain.Webhook, error) {
	if err := s.checkParentRole(ctx, familyID, userID); err != nil {
		return nil, err
	}

	secret := make([]byte, 32)
	if _, err := rand.Read(secret); err != nil {
		return nil, err
	}

	webhook := &domain.Webhook{
		ID:        uuid.New(),
		FamilyID:  familyID,
		URL:       url,
		Secret:    hex.EncodeToString(secret),
		Events:    events,
		Active:    true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := s.webhooks.Create(ctx, webhook); err != nil {
		return nil, fmt.Errorf("create webhook: %w", err)
	}
	return webhook, nil
}

func (s *WebhookService) GetByID(ctx context.Context, userID, webhookID uuid.UUID) (*domain.Webhook, error) {
	wh, err := s.webhooks.GetByID(ctx, webhookID)
	if err != nil || wh == nil {
		return nil, ErrWebhookNotFound
	}
	if err := s.checkMembership(ctx, wh.FamilyID, userID); err != nil {
		return nil, err
	}
	return wh, nil
}

func (s *WebhookService) Update(ctx context.Context, userID, webhookID uuid.UUID, url string, events []string, active bool) (*domain.Webhook, error) {
	wh, err := s.GetByID(ctx, userID, webhookID)
	if err != nil {
		return nil, err
	}
	wh.URL = url
	wh.Events = events
	wh.Active = active
	wh.UpdatedAt = time.Now()
	if err := s.webhooks.Update(ctx, wh); err != nil {
		return nil, err
	}
	return wh, nil
}

func (s *WebhookService) Delete(ctx context.Context, userID, webhookID uuid.UUID) error {
	wh, err := s.GetByID(ctx, userID, webhookID)
	if err != nil {
		return err
	}
	if err := s.checkParentRole(ctx, wh.FamilyID, userID); err != nil {
		return err
	}
	return s.webhooks.Delete(ctx, webhookID)
}

func (s *WebhookService) ListByFamily(ctx context.Context, userID, familyID uuid.UUID) ([]domain.Webhook, error) {
	if err := s.checkMembership(ctx, familyID, userID); err != nil {
		return nil, err
	}
	return s.webhooks.ListByFamily(ctx, familyID)
}

func (s *WebhookService) TestWebhook(ctx context.Context, userID, webhookID uuid.UUID) (*domain.WebhookDelivery, error) {
	wh, err := s.GetByID(ctx, userID, webhookID)
	if err != nil {
		return nil, err
	}
	payload := map[string]any{
		"event":     "test",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"data":      map[string]string{"message": "This is a test webhook delivery"},
	}
	return s.deliver(ctx, wh, "test", payload)
}

func (s *WebhookService) Dispatch(ctx context.Context, familyID uuid.UUID, event string, data any) {
	webhooks, err := s.webhooks.ListActiveByEvent(ctx, familyID, event)
	if err != nil {
		return
	}
	payload := map[string]any{
		"event":     event,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"data":      data,
	}
	for _, wh := range webhooks {
		go func(w domain.Webhook) {
			_, _ = s.deliver(context.Background(), &w, event, payload)
		}(wh)
	}
}

func (s *WebhookService) deliver(ctx context.Context, wh *domain.Webhook, event string, payload any) (*domain.WebhookDelivery, error) {
	body, _ := json.Marshal(payload)

	delivery := &domain.WebhookDelivery{
		ID:        uuid.New(),
		WebhookID: wh.ID,
		Event:     event,
		Payload:   body,
		Attempts:  1,
		CreatedAt: time.Now(),
	}

	mac := hmac.New(sha256.New, []byte(wh.Secret))
	mac.Write(body)
	signature := hex.EncodeToString(mac.Sum(nil))

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, wh.URL, bytes.NewReader(body))
	if err != nil {
		delivery.Success = false
		_ = s.deliveries.Create(ctx, delivery)
		return delivery, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-GuardianGate-Signature", signature)
	req.Header.Set("X-GuardianGate-Event", event)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		delivery.Success = false
		_ = s.deliveries.Create(ctx, delivery)
		return delivery, err
	}
	defer resp.Body.Close()

	code := resp.StatusCode
	delivery.ResponseCode = &code
	delivery.Success = code >= 200 && code < 300

	if !delivery.Success {
		retryAt := time.Now().Add(time.Minute)
		delivery.NextRetryAt = &retryAt
	}

	_ = s.deliveries.Create(ctx, delivery)
	return delivery, nil
}

func (s *WebhookService) ListDeliveries(ctx context.Context, userID, webhookID uuid.UUID, limit int) ([]domain.WebhookDelivery, error) {
	if _, err := s.GetByID(ctx, userID, webhookID); err != nil {
		return nil, err
	}
	return s.deliveries.ListByWebhook(ctx, webhookID, limit)
}

func (s *WebhookService) checkMembership(ctx context.Context, familyID, userID uuid.UUID) error {
	member, err := s.members.GetRole(ctx, familyID, userID)
	if err != nil || member == nil {
		return ErrNotFamilyMember
	}
	return nil
}

func (s *WebhookService) checkParentRole(ctx context.Context, familyID, userID uuid.UUID) error {
	member, err := s.members.GetRole(ctx, familyID, userID)
	if err != nil || member == nil {
		return ErrNotFamilyMember
	}
	if member.Role != domain.RoleOwner && member.Role != domain.RoleParent {
		return ErrInsufficientRole
	}
	return nil
}
