package service

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/repository"
)

type ReportService struct {
	children    repository.ChildRepository
	policies    repository.PolicyRepository
	syncJobs    repository.SyncJobRepository
	syncResults repository.SyncJobResultRepository
	connections repository.ProviderConnectionRepository
	members     repository.FamilyMemberRepository
}

func NewReportService(
	children repository.ChildRepository,
	policies repository.PolicyRepository,
	syncJobs repository.SyncJobRepository,
	syncResults repository.SyncJobResultRepository,
	connections repository.ProviderConnectionRepository,
	members repository.FamilyMemberRepository,
) *ReportService {
	return &ReportService{
		children:    children,
		policies:    policies,
		syncJobs:    syncJobs,
		syncResults: syncResults,
		connections: connections,
		members:     members,
	}
}

type FamilyOverview struct {
	Children       []ChildSummary   `json:"children"`
	TotalProviders int              `json:"total_providers"`
	SyncHealth     string           `json:"sync_health"` // healthy, warning, error
	RecentSyncs    []domain.SyncJob `json:"recent_syncs"`
}

type ChildSummary struct {
	Child          domain.Child `json:"child"`
	ActivePolicies int          `json:"active_policies"`
	LastSyncAt     *time.Time   `json:"last_sync_at,omitempty"`
	SyncStatus     string       `json:"sync_status"`
}

func (s *ReportService) FamilyOverviewReport(ctx context.Context, userID, familyID uuid.UUID) (*FamilyOverview, error) {
	member, err := s.members.GetRole(ctx, familyID, userID)
	if err != nil || member == nil {
		return nil, ErrNotFamilyMember
	}

	children, err := s.children.ListByFamily(ctx, familyID)
	if err != nil {
		return nil, err
	}

	overview := &FamilyOverview{
		SyncHealth: "healthy",
	}

	for _, child := range children {
		summary := ChildSummary{
			Child:      child,
			SyncStatus: "unknown",
		}

		policies, _ := s.policies.ListByChild(ctx, child.ID)
		for _, p := range policies {
			if p.Status == domain.PolicyActive {
				summary.ActivePolicies++
			}
		}

		jobs, _ := s.syncJobs.ListByChild(ctx, child.ID, 1)
		if len(jobs) > 0 {
			summary.LastSyncAt = jobs[0].CompletedAt
			summary.SyncStatus = string(jobs[0].Status)
			if jobs[0].Status == domain.SyncFailed {
				overview.SyncHealth = "error"
			} else if jobs[0].Status == domain.SyncPartial && overview.SyncHealth != "error" {
				overview.SyncHealth = "warning"
			}
		}

		overview.Children = append(overview.Children, summary)
	}

	connections, _ := s.connections.ListByFamily(ctx, familyID)
	overview.TotalProviders = len(connections)

	// Get recent syncs across all children
	for _, child := range children {
		jobs, _ := s.syncJobs.ListByChild(ctx, child.ID, 5)
		overview.RecentSyncs = append(overview.RecentSyncs, jobs...)
	}

	return overview, nil
}
