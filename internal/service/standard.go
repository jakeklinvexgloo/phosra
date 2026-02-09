package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/repository"
)

var ErrStandardNotFound = errors.New("standard not found")

type StandardService struct {
	standards repository.StandardRepository
	adoptions repository.StandardAdoptionRepository
	children  repository.ChildRepository
	members   repository.FamilyMemberRepository
}

func NewStandardService(
	standards repository.StandardRepository,
	adoptions repository.StandardAdoptionRepository,
	children repository.ChildRepository,
	members repository.FamilyMemberRepository,
) *StandardService {
	return &StandardService{
		standards: standards,
		adoptions: adoptions,
		children:  children,
		members:   members,
	}
}

// ListPublished returns all published community standards with their rules and adoption counts.
func (s *StandardService) ListPublished(ctx context.Context) ([]domain.Standard, error) {
	standards, err := s.standards.List(ctx, true)
	if err != nil {
		return nil, err
	}
	for i := range standards {
		rules, err := s.standards.GetRulesByStandard(ctx, standards[i].ID)
		if err != nil {
			return nil, err
		}
		standards[i].Rules = rules

		count, err := s.standards.GetAdoptionCount(ctx, standards[i].ID)
		if err != nil {
			return nil, err
		}
		standards[i].AdoptionCount = count
	}
	return standards, nil
}

// GetBySlug returns a single standard with rules and adoption count.
func (s *StandardService) GetBySlug(ctx context.Context, slug string) (*domain.Standard, error) {
	std, err := s.standards.GetBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	if std == nil {
		return nil, ErrStandardNotFound
	}

	rules, err := s.standards.GetRulesByStandard(ctx, std.ID)
	if err != nil {
		return nil, err
	}
	std.Rules = rules

	count, err := s.standards.GetAdoptionCount(ctx, std.ID)
	if err != nil {
		return nil, err
	}
	std.AdoptionCount = count
	return std, nil
}

// GetByID returns a single standard with rules and adoption count.
func (s *StandardService) GetByID(ctx context.Context, id uuid.UUID) (*domain.Standard, error) {
	std, err := s.standards.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if std == nil {
		return nil, ErrStandardNotFound
	}

	rules, err := s.standards.GetRulesByStandard(ctx, std.ID)
	if err != nil {
		return nil, err
	}
	std.Rules = rules

	count, err := s.standards.GetAdoptionCount(ctx, std.ID)
	if err != nil {
		return nil, err
	}
	std.AdoptionCount = count
	return std, nil
}

// Adopt adds a community standard to a child, verified by family membership.
func (s *StandardService) Adopt(ctx context.Context, userID, childID, standardID uuid.UUID) (*domain.StandardAdoption, error) {
	// Verify child exists and user has access
	child, err := s.children.GetByID(ctx, childID)
	if err != nil {
		return nil, err
	}
	if child == nil {
		return nil, ErrChildNotFound
	}
	_, err = s.members.GetRole(ctx, child.FamilyID, userID)
	if err != nil {
		return nil, ErrNotFamilyMember
	}

	// Verify standard exists
	std, err := s.standards.GetByID(ctx, standardID)
	if err != nil {
		return nil, err
	}
	if std == nil {
		return nil, ErrStandardNotFound
	}

	adoption := &domain.StandardAdoption{
		ChildID:    childID,
		StandardID: standardID,
	}
	if err := s.adoptions.Adopt(ctx, adoption); err != nil {
		return nil, err
	}
	return adoption, nil
}

// Unadopt removes a community standard from a child.
func (s *StandardService) Unadopt(ctx context.Context, userID, childID, standardID uuid.UUID) error {
	child, err := s.children.GetByID(ctx, childID)
	if err != nil {
		return err
	}
	if child == nil {
		return ErrChildNotFound
	}
	_, err = s.members.GetRole(ctx, child.FamilyID, userID)
	if err != nil {
		return ErrNotFamilyMember
	}
	return s.adoptions.Unadopt(ctx, childID, standardID)
}

// ListByChild returns all standards adopted by a child.
func (s *StandardService) ListByChild(ctx context.Context, userID, childID uuid.UUID) ([]domain.Standard, error) {
	child, err := s.children.GetByID(ctx, childID)
	if err != nil {
		return nil, err
	}
	if child == nil {
		return nil, ErrChildNotFound
	}
	_, err = s.members.GetRole(ctx, child.FamilyID, userID)
	if err != nil {
		return nil, ErrNotFamilyMember
	}

	adoptions, err := s.adoptions.ListByChild(ctx, childID)
	if err != nil {
		return nil, err
	}

	var standards []domain.Standard
	for _, a := range adoptions {
		std, err := s.GetByID(ctx, a.StandardID)
		if err != nil {
			continue
		}
		standards = append(standards, *std)
	}
	return standards, nil
}
