package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
	"github.com/guardiangate/api/internal/repository"
)

var ErrPlatformNotFound = errors.New("platform not found")

type PlatformService struct {
	platforms      repository.PlatformRepository
	complianceLinks repository.ComplianceLinkRepository
	members        repository.FamilyMemberRepository
	registry       *provider.Registry
}

func NewPlatformService(
	platforms repository.PlatformRepository,
	complianceLinks repository.ComplianceLinkRepository,
	members repository.FamilyMemberRepository,
	registry *provider.Registry,
) *PlatformService {
	return &PlatformService{
		platforms:      platforms,
		complianceLinks: complianceLinks,
		members:        members,
		registry:       registry,
	}
}

type PlatformWithCapabilities struct {
	domain.Platform
	Capabilities []provider.Capability `json:"capabilities"`
}

func (s *PlatformService) List(ctx context.Context) ([]PlatformWithCapabilities, error) {
	platforms, err := s.platforms.List(ctx)
	if err != nil {
		return nil, err
	}
	result := make([]PlatformWithCapabilities, len(platforms))
	for i, p := range platforms {
		result[i] = PlatformWithCapabilities{Platform: p}
		if adapter, ok := s.registry.Get(p.ID); ok {
			result[i].Capabilities = adapter.Capabilities()
		}
	}
	return result, nil
}

func (s *PlatformService) GetByID(ctx context.Context, id string) (*PlatformWithCapabilities, error) {
	p, err := s.platforms.GetByID(ctx, id)
	if err != nil || p == nil {
		return nil, ErrPlatformNotFound
	}
	result := &PlatformWithCapabilities{Platform: *p}
	if adapter, ok := s.registry.Get(id); ok {
		result.Capabilities = adapter.Capabilities()
	}
	return result, nil
}

func (s *PlatformService) ListByCategory(ctx context.Context, category domain.PlatformCategory) ([]PlatformWithCapabilities, error) {
	platforms, err := s.platforms.ListByCategory(ctx, category)
	if err != nil {
		return nil, err
	}
	result := make([]PlatformWithCapabilities, len(platforms))
	for i, p := range platforms {
		result[i] = PlatformWithCapabilities{Platform: p}
		if adapter, ok := s.registry.Get(p.ID); ok {
			result[i].Capabilities = adapter.Capabilities()
		}
	}
	return result, nil
}

func (s *PlatformService) ListByCapability(ctx context.Context, cap provider.Capability) ([]PlatformWithCapabilities, error) {
	allPlatforms, err := s.List(ctx)
	if err != nil {
		return nil, err
	}
	var result []PlatformWithCapabilities
	for _, p := range allPlatforms {
		for _, c := range p.Capabilities {
			if c == cap {
				result = append(result, p)
				break
			}
		}
	}
	return result, nil
}

func (s *PlatformService) VerifyCompliance(ctx context.Context, userID, familyID uuid.UUID, platformID, encryptedCreds string) (*domain.ComplianceLink, error) {
	if err := s.checkParentRole(ctx, familyID, userID); err != nil {
		return nil, err
	}

	adapter, ok := s.registry.Get(platformID)
	if !ok {
		return nil, ErrPlatformNotFound
	}

	// Validate credentials
	if err := adapter.ValidateAuth(ctx, provider.AuthConfig{EncryptedCreds: encryptedCreds}); err != nil {
		return nil, fmt.Errorf("invalid credentials: %w", err)
	}

	link := &domain.ComplianceLink{
		ID:             uuid.New(),
		FamilyID:       familyID,
		PlatformID:     platformID,
		Status:         "verified",
		EncryptedCreds: encryptedCreds,
		VerifiedAt:     time.Now(),
	}
	if err := s.complianceLinks.Create(ctx, link); err != nil {
		return nil, fmt.Errorf("create compliance link: %w", err)
	}
	return link, nil
}

func (s *PlatformService) RevokeCertification(ctx context.Context, userID, linkID uuid.UUID) error {
	link, err := s.complianceLinks.GetByID(ctx, linkID)
	if err != nil || link == nil {
		return ErrComplianceLinkNotFound
	}
	if err := s.checkParentRole(ctx, link.FamilyID, userID); err != nil {
		return err
	}

	// Try to revoke on the platform side
	if adapter, ok := s.registry.Get(link.PlatformID); ok {
		_ = adapter.RevokePolicy(ctx, provider.AuthConfig{EncryptedCreds: link.EncryptedCreds})
	}

	return s.complianceLinks.Delete(ctx, linkID)
}

func (s *PlatformService) VerifyLink(ctx context.Context, userID, linkID uuid.UUID) error {
	link, err := s.complianceLinks.GetByID(ctx, linkID)
	if err != nil || link == nil {
		return ErrComplianceLinkNotFound
	}
	if err := s.checkMembership(ctx, link.FamilyID, userID); err != nil {
		return err
	}

	adapter, ok := s.registry.Get(link.PlatformID)
	if !ok {
		return ErrPlatformNotFound
	}

	return adapter.ValidateAuth(ctx, provider.AuthConfig{EncryptedCreds: link.EncryptedCreds})
}

func (s *PlatformService) ListComplianceLinks(ctx context.Context, userID, familyID uuid.UUID) ([]domain.ComplianceLink, error) {
	if err := s.checkMembership(ctx, familyID, userID); err != nil {
		return nil, err
	}
	return s.complianceLinks.ListByFamily(ctx, familyID)
}

func (s *PlatformService) checkMembership(ctx context.Context, familyID, userID uuid.UUID) error {
	member, err := s.members.GetRole(ctx, familyID, userID)
	if err != nil || member == nil {
		return ErrNotFamilyMember
	}
	return nil
}

func (s *PlatformService) checkParentRole(ctx context.Context, familyID, userID uuid.UUID) error {
	member, err := s.members.GetRole(ctx, familyID, userID)
	if err != nil || member == nil {
		return ErrNotFamilyMember
	}
	if member.Role != domain.RoleOwner && member.Role != domain.RoleParent {
		return ErrInsufficientRole
	}
	return nil
}
