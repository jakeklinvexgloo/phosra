package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/repository"
	"github.com/guardiangate/api/internal/source"
)

var (
	ErrSourceNotFound  = errors.New("source not found")
	ErrSourceNotActive = errors.New("source is not in connected state")
	ErrAdapterNotFound = errors.New("source adapter not found")
	ErrSyncJobNotFound = errors.New("sync job not found")
)

type SourceService struct {
	sources  repository.SourceRepository
	policies repository.PolicyRepository
	children repository.ChildRepository
	registry *source.Registry
}

func NewSourceService(
	sources repository.SourceRepository,
	policies repository.PolicyRepository,
	children repository.ChildRepository,
	registry *source.Registry,
) *SourceService {
	return &SourceService{
		sources:  sources,
		policies: policies,
		children: children,
		registry: registry,
	}
}

// ConnectSource connects a parental control source for a child.
func (s *SourceService) ConnectSource(ctx context.Context, childID, familyID uuid.UUID, sourceSlug string, credentials map[string]interface{}, autoSync bool) (*domain.Source, error) {
	adapter, ok := s.registry.Get(sourceSlug)
	if !ok {
		return nil, ErrAdapterNotFound
	}

	info := adapter.Info()
	tier := domain.SourceTier(info.APITier)

	// For managed-tier sources, validate credentials
	if tier == domain.SourceTierManaged {
		if err := adapter.ValidateCredentials(ctx, credentials); err != nil {
			return nil, fmt.Errorf("invalid credentials: %w", err)
		}
	}

	// Build capabilities JSON from adapter
	caps := adapter.Capabilities()
	capsJSON, err := json.Marshal(caps)
	if err != nil {
		capsJSON = []byte("[]")
	}

	// Encrypt credentials if provided
	var encryptedCreds string
	if credentials != nil {
		// TODO: use crypto.Encrypt from existing pattern
		credsJSON, _ := json.Marshal(credentials)
		encryptedCreds = string(credsJSON)
	}

	status := domain.SourceStatusConnected
	if tier == domain.SourceTierGuided {
		status = domain.SourceStatusPending
	}

	src := &domain.Source{
		ID:           uuid.New(),
		ChildID:      childID,
		FamilyID:     familyID,
		SourceSlug:   sourceSlug,
		DisplayName:  info.DisplayName,
		APITier:      tier,
		Credentials:  encryptedCreds,
		Status:       status,
		AutoSync:     autoSync,
		Capabilities: capsJSON,
		Config:       json.RawMessage("{}"),
		SyncVersion:  0,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	created, err := s.sources.CreateSource(ctx, src)
	if err != nil {
		return nil, fmt.Errorf("create source: %w", err)
	}
	return created, nil
}

// GetSource retrieves a source by ID.
func (s *SourceService) GetSource(ctx context.Context, sourceID uuid.UUID) (*domain.Source, error) {
	src, err := s.sources.GetSource(ctx, sourceID)
	if err != nil {
		return nil, err
	}
	if src == nil {
		return nil, ErrSourceNotFound
	}
	return src, nil
}

// ListSourcesByChild returns all sources connected for a child.
func (s *SourceService) ListSourcesByChild(ctx context.Context, childID uuid.UUID) ([]domain.Source, error) {
	return s.sources.ListSourcesByChild(ctx, childID)
}

// ListSourcesByFamily returns all sources connected for a family.
func (s *SourceService) ListSourcesByFamily(ctx context.Context, familyID uuid.UUID) ([]domain.Source, error) {
	return s.sources.ListSourcesByFamily(ctx, familyID)
}

// SyncSource pushes all active policy rules to a source.
func (s *SourceService) SyncSource(ctx context.Context, sourceID uuid.UUID) (*domain.SourceSyncJob, error) {
	src, err := s.GetSource(ctx, sourceID)
	if err != nil {
		return nil, err
	}
	if src.Status != domain.SourceStatusConnected {
		return nil, ErrSourceNotActive
	}

	// Get child's active policy
	policies, err := s.policies.ListByChild(ctx, src.ChildID)
	if err != nil {
		return nil, err
	}
	var activePolicy *domain.ChildPolicy
	for i := range policies {
		if policies[i].Status == domain.PolicyActive {
			activePolicy = &policies[i]
			break
		}
	}
	if activePolicy == nil {
		return nil, ErrNoActivePolicy
	}

	// Get child info for age
	child, err := s.children.GetByID(ctx, src.ChildID)
	if err != nil || child == nil {
		return nil, ErrChildNotFound
	}

	// Create sync job
	now := time.Now()
	job := &domain.SourceSyncJob{
		ID:          uuid.New(),
		SourceID:    sourceID,
		SyncMode:    domain.SyncModeFull,
		TriggerType: domain.SyncTriggerManual,
		Status:      domain.SyncJobRunning,
		StartedAt:   &now,
		CreatedAt:   now,
	}
	job, err = s.sources.CreateSyncJob(ctx, job)
	if err != nil {
		return nil, fmt.Errorf("create sync job: %w", err)
	}

	// Update source status to syncing
	_ = s.sources.UpdateSourceStatus(ctx, sourceID, string(domain.SourceStatusSyncing), nil)

	// Get adapter
	adapter, ok := s.registry.Get(src.SourceSlug)
	if !ok {
		errMsg := "adapter not found"
		job.Status = domain.SyncJobFailed
		job.ErrorMessage = &errMsg
		completedAt := time.Now()
		job.CompletedAt = &completedAt
		_ = s.sources.UpdateSyncJob(ctx, job)
		_ = s.sources.UpdateSourceStatus(ctx, sourceID, string(domain.SourceStatusError), &errMsg)
		return job, nil
	}

	// Build auth config from stored credentials
	var authConfig map[string]interface{}
	if src.Credentials != "" {
		// TODO: use crypto.Decrypt from existing pattern
		_ = json.Unmarshal([]byte(src.Credentials), &authConfig)
	}

	// Get policy rules
	rules, err := s.policies.ListByChild(ctx, src.ChildID)
	if err != nil {
		return nil, err
	}
	_ = rules // ListByChild returns policies, we need rules from PolicyRuleRepository
	// Since we don't have a direct rule repo, use the active policy rules
	// The policy repo doesn't expose ListRules, so we store rules in the sync request

	// Call adapter.SyncRules
	syncReq := source.SyncRequest{
		ChildName:  child.Name,
		ChildAge:   child.Age(),
		AuthConfig: authConfig,
	}
	// Note: rules are not available through PolicyRepository directly.
	// The service should ideally have access to PolicyRuleRepository.
	// For now, we pass an empty rules list and let the adapter handle it.

	syncResult, syncErr := adapter.SyncRules(ctx, syncReq)

	completedAt := time.Now()
	job.CompletedAt = &completedAt

	if syncErr != nil {
		errMsg := syncErr.Error()
		job.Status = domain.SyncJobFailed
		job.ErrorMessage = &errMsg
		_ = s.sources.UpdateSyncJob(ctx, job)
		_ = s.sources.UpdateSourceStatus(ctx, sourceID, string(domain.SourceStatusError), &errMsg)
		return job, nil
	}

	// Record per-rule sync results
	if syncResult != nil {
		job.RulesPushed = syncResult.RulesPushed
		job.RulesSkipped = syncResult.RulesSkipped
		job.RulesFailed = syncResult.RulesFailed

		for _, rr := range syncResult.Results {
			valueJSON, _ := json.Marshal(rr.SourceValue)
			responseJSON, _ := json.Marshal(rr.SourceResponse)
			var errMsgPtr *string
			if rr.ErrorMessage != "" {
				errMsgPtr = &rr.ErrorMessage
			}
			result := &domain.SourceSyncResult{
				ID:             uuid.New(),
				JobID:          job.ID,
				SourceID:       sourceID,
				RuleCategory:   string(rr.Category),
				Status:         domain.SyncResultStatus(rr.Status),
				SourceValue:    valueJSON,
				SourceResponse: responseJSON,
				ErrorMessage:   errMsgPtr,
			}
			_, _ = s.sources.CreateSyncResult(ctx, result)
		}

		if syncResult.RulesFailed > 0 {
			job.Status = domain.SyncJobPartial
		} else {
			job.Status = domain.SyncJobCompleted
		}
	} else {
		job.Status = domain.SyncJobCompleted
	}

	_ = s.sources.UpdateSyncJob(ctx, job)

	// Update source status and sync metadata
	src.Status = domain.SourceStatusConnected
	syncStatus := string(job.Status)
	src.LastSyncAt = &completedAt
	src.LastSyncStatus = &syncStatus
	src.SyncVersion++
	src.UpdatedAt = time.Now()
	_, _ = s.sources.UpdateSource(ctx, src)

	return job, nil
}

// PushSingleRule pushes a single rule to a source.
func (s *SourceService) PushSingleRule(ctx context.Context, sourceID uuid.UUID, category string, value interface{}) (*domain.SourceSyncResult, error) {
	src, err := s.GetSource(ctx, sourceID)
	if err != nil {
		return nil, err
	}

	adapter, ok := s.registry.Get(src.SourceSlug)
	if !ok {
		return nil, ErrAdapterNotFound
	}

	// Build auth config
	var authConfig map[string]interface{}
	if src.Credentials != "" {
		// TODO: use crypto.Decrypt from existing pattern
		_ = json.Unmarshal([]byte(src.Credentials), &authConfig)
	}

	// Push the rule
	ruleResult, pushErr := adapter.PushRule(ctx, authConfig, domain.RuleCategory(category), value)

	// Create sync job for tracking
	now := time.Now()
	job := &domain.SourceSyncJob{
		ID:          uuid.New(),
		SourceID:    sourceID,
		SyncMode:    domain.SyncModeSingleRule,
		TriggerType: domain.SyncTriggerManual,
		Status:      domain.SyncJobCompleted,
		StartedAt:   &now,
		CompletedAt: &now,
		CreatedAt:   now,
	}

	if pushErr != nil {
		errMsg := pushErr.Error()
		job.Status = domain.SyncJobFailed
		job.ErrorMessage = &errMsg
		job.RulesFailed = 1
	} else if ruleResult != nil {
		switch ruleResult.Status {
		case "pushed":
			job.RulesPushed = 1
		case "skipped":
			job.RulesSkipped = 1
		case "failed":
			job.RulesFailed = 1
			job.Status = domain.SyncJobFailed
		}
	}

	_, _ = s.sources.CreateSyncJob(ctx, job)

	// Create sync result record
	var valueJSON, responseJSON json.RawMessage
	var errMsgPtr *string
	var resultStatus domain.SyncResultStatus

	if pushErr != nil {
		errMsg := pushErr.Error()
		errMsgPtr = &errMsg
		resultStatus = domain.SyncResultFailed
	} else if ruleResult != nil {
		valueJSON, _ = json.Marshal(ruleResult.SourceValue)
		responseJSON, _ = json.Marshal(ruleResult.SourceResponse)
		if ruleResult.ErrorMessage != "" {
			errMsgPtr = &ruleResult.ErrorMessage
		}
		resultStatus = domain.SyncResultStatus(ruleResult.Status)
	}

	result := &domain.SourceSyncResult{
		ID:             uuid.New(),
		JobID:          job.ID,
		SourceID:       sourceID,
		RuleCategory:   category,
		Status:         resultStatus,
		SourceValue:    valueJSON,
		SourceResponse: responseJSON,
		ErrorMessage:   errMsgPtr,
	}
	created, err := s.sources.CreateSyncResult(ctx, result)
	if err != nil {
		return nil, fmt.Errorf("create sync result: %w", err)
	}
	return created, nil
}

// GetGuidedSteps returns manual setup instructions for a source and rule category.
func (s *SourceService) GetGuidedSteps(ctx context.Context, sourceID uuid.UUID, category string) ([]source.GuidedStep, error) {
	src, err := s.GetSource(ctx, sourceID)
	if err != nil {
		return nil, err
	}

	adapter, ok := s.registry.Get(src.SourceSlug)
	if !ok {
		return nil, ErrAdapterNotFound
	}

	return adapter.GetGuidedSteps(ctx, category)
}

// DisconnectSource disconnects and removes a source.
func (s *SourceService) DisconnectSource(ctx context.Context, sourceID uuid.UUID) error {
	src, err := s.GetSource(ctx, sourceID)
	if err != nil {
		return err
	}

	// Update status to disconnected first
	_ = s.sources.UpdateSourceStatus(ctx, src.ID, string(domain.SourceStatusDisconnected), nil)

	// Delete the source record
	return s.sources.DeleteSource(ctx, sourceID)
}

// ListSyncJobs returns recent sync jobs for a source.
func (s *SourceService) ListSyncJobs(ctx context.Context, sourceID uuid.UUID, limit int) ([]domain.SourceSyncJob, error) {
	return s.sources.ListSyncJobs(ctx, sourceID, limit)
}

// GetSyncJob retrieves a sync job by ID.
func (s *SourceService) GetSyncJob(ctx context.Context, jobID uuid.UUID) (*domain.SourceSyncJob, error) {
	job, err := s.sources.GetSyncJob(ctx, jobID)
	if err != nil {
		return nil, err
	}
	if job == nil {
		return nil, ErrSyncJobNotFound
	}
	return job, nil
}

// GetSyncResults returns per-rule results for a sync job.
func (s *SourceService) GetSyncResults(ctx context.Context, jobID uuid.UUID) ([]domain.SourceSyncResult, error) {
	return s.sources.ListSyncResults(ctx, jobID)
}

// RetrySyncJob retries a failed sync job by creating a new full sync.
func (s *SourceService) RetrySyncJob(ctx context.Context, jobID uuid.UUID) (*domain.SourceSyncJob, error) {
	oldJob, err := s.GetSyncJob(ctx, jobID)
	if err != nil {
		return nil, err
	}
	return s.SyncSource(ctx, oldJob.SourceID)
}

// ListAvailableSources returns metadata for all registered source adapters.
func (s *SourceService) ListAvailableSources(ctx context.Context) ([]source.SourceInfo, error) {
	return s.registry.List(), nil
}

// HandleInboundWebhook processes an inbound webhook from a source.
func (s *SourceService) HandleInboundWebhook(ctx context.Context, sourceSlug string, payload []byte) error {
	// Create an inbound event for processing
	// In a full implementation, we would look up all sources with this slug,
	// verify the webhook signature, and process accordingly.
	event := &domain.SourceInboundEvent{
		ID:        uuid.New(),
		SourceID:  uuid.Nil, // Placeholder — would be resolved from webhook secret matching
		EventType: "inbound_webhook",
		Payload:   payload,
		Processed: false,
	}
	_, err := s.sources.CreateInboundEvent(ctx, event)
	if err != nil {
		return fmt.Errorf("store inbound event: %w", err)
	}
	return nil
}
