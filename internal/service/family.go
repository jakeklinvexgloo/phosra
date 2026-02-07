package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/repository"
)

var (
	ErrFamilyNotFound  = errors.New("family not found")
	ErrNotFamilyMember = errors.New("not a member of this family")
	ErrInsufficientRole = errors.New("insufficient role for this action")
)

type FamilyService struct {
	families repository.FamilyRepository
	members  repository.FamilyMemberRepository
}

func NewFamilyService(families repository.FamilyRepository, members repository.FamilyMemberRepository) *FamilyService {
	return &FamilyService{families: families, members: members}
}

func (s *FamilyService) Create(ctx context.Context, userID uuid.UUID, name string) (*domain.Family, error) {
	family := &domain.Family{
		ID:        uuid.New(),
		Name:      name,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := s.families.Create(ctx, family); err != nil {
		return nil, fmt.Errorf("create family: %w", err)
	}

	member := &domain.FamilyMember{
		ID:       uuid.New(),
		FamilyID: family.ID,
		UserID:   userID,
		Role:     domain.RoleOwner,
		JoinedAt: time.Now(),
	}
	if err := s.members.Add(ctx, member); err != nil {
		return nil, fmt.Errorf("add owner: %w", err)
	}

	return family, nil
}

func (s *FamilyService) GetByID(ctx context.Context, familyID, userID uuid.UUID) (*domain.Family, error) {
	if err := s.checkMembership(ctx, familyID, userID); err != nil {
		return nil, err
	}
	return s.families.GetByID(ctx, familyID)
}

func (s *FamilyService) Update(ctx context.Context, familyID, userID uuid.UUID, name string) (*domain.Family, error) {
	if err := s.checkParentRole(ctx, familyID, userID); err != nil {
		return nil, err
	}
	family, err := s.families.GetByID(ctx, familyID)
	if err != nil {
		return nil, err
	}
	if family == nil {
		return nil, ErrFamilyNotFound
	}
	family.Name = name
	family.UpdatedAt = time.Now()
	if err := s.families.Update(ctx, family); err != nil {
		return nil, fmt.Errorf("update family: %w", err)
	}
	return family, nil
}

func (s *FamilyService) Delete(ctx context.Context, familyID, userID uuid.UUID) error {
	member, err := s.members.GetRole(ctx, familyID, userID)
	if err != nil || member == nil {
		return ErrNotFamilyMember
	}
	if member.Role != domain.RoleOwner {
		return ErrInsufficientRole
	}
	return s.families.Delete(ctx, familyID)
}

func (s *FamilyService) ListByUser(ctx context.Context, userID uuid.UUID) ([]domain.Family, error) {
	return s.families.ListByUser(ctx, userID)
}

func (s *FamilyService) AddMember(ctx context.Context, familyID, actorID, userID uuid.UUID, role domain.FamilyRole) error {
	if err := s.checkParentRole(ctx, familyID, actorID); err != nil {
		return err
	}
	if role == domain.RoleOwner {
		return ErrInsufficientRole
	}
	member := &domain.FamilyMember{
		ID:       uuid.New(),
		FamilyID: familyID,
		UserID:   userID,
		Role:     role,
		JoinedAt: time.Now(),
	}
	return s.members.Add(ctx, member)
}

func (s *FamilyService) RemoveMember(ctx context.Context, familyID, actorID, userID uuid.UUID) error {
	if err := s.checkParentRole(ctx, familyID, actorID); err != nil {
		return err
	}
	return s.members.Remove(ctx, familyID, userID)
}

func (s *FamilyService) ListMembers(ctx context.Context, familyID, userID uuid.UUID) ([]domain.FamilyMember, error) {
	if err := s.checkMembership(ctx, familyID, userID); err != nil {
		return nil, err
	}
	return s.members.ListByFamily(ctx, familyID)
}

func (s *FamilyService) checkMembership(ctx context.Context, familyID, userID uuid.UUID) error {
	member, err := s.members.GetRole(ctx, familyID, userID)
	if err != nil || member == nil {
		return ErrNotFamilyMember
	}
	return nil
}

func (s *FamilyService) checkParentRole(ctx context.Context, familyID, userID uuid.UUID) error {
	member, err := s.members.GetRole(ctx, familyID, userID)
	if err != nil || member == nil {
		return ErrNotFamilyMember
	}
	if member.Role != domain.RoleOwner && member.Role != domain.RoleParent {
		return ErrInsufficientRole
	}
	return nil
}
