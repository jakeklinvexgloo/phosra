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
	users    repository.UserRepository
}

func NewFamilyService(families repository.FamilyRepository, members repository.FamilyMemberRepository, users ...repository.UserRepository) *FamilyService {
	s := &FamilyService{families: families, members: members}
	if len(users) > 0 {
		s.users = users[0]
	}
	return s
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

func (s *FamilyService) AddMemberByEmail(ctx context.Context, familyID, actorID uuid.UUID, email string, role domain.FamilyRole, displayName string) (*domain.FamilyMember, error) {
	if s.users == nil {
		return nil, fmt.Errorf("user repository not configured")
	}
	if err := s.checkParentRole(ctx, familyID, actorID); err != nil {
		return nil, err
	}
	if role == domain.RoleOwner {
		return nil, ErrInsufficientRole
	}
	user, err := s.users.GetByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("lookup user: %w", err)
	}
	if user == nil {
		// Auto-create a placeholder account so the family member can later
		// sign in via email code (OTP). The ExternalAuthID placeholder is
		// unique and will be replaced on first Stytch login (see auth middleware).
		user = &domain.User{
			ID:             uuid.New(),
			ExternalAuthID: "family-invite:" + uuid.New().String(),
			Email:          email,
			Name:           displayName,
			IsAdmin:        false,
		}
		if err := s.users.Create(ctx, user); err != nil {
			return nil, fmt.Errorf("create user for family invite: %w", err)
		}
	}
	member := &domain.FamilyMember{
		ID:          uuid.New(),
		FamilyID:    familyID,
		UserID:      user.ID,
		Role:        role,
		JoinedAt:    time.Now(),
		Email:       user.Email,
		Name:        user.Name,
		DisplayName: displayName,
	}
	if err := s.members.Add(ctx, member); err != nil {
		return nil, fmt.Errorf("add member: %w", err)
	}
	return member, nil
}

func (s *FamilyService) RemoveMember(ctx context.Context, familyID, actorID, userID uuid.UUID) error {
	if err := s.checkParentRole(ctx, familyID, actorID); err != nil {
		return err
	}
	return s.members.Remove(ctx, familyID, userID)
}

func (s *FamilyService) UpdateMember(ctx context.Context, familyID, memberID, actorID uuid.UUID, displayName string, role domain.FamilyRole) (*domain.FamilyMember, error) {
	if err := s.checkParentRole(ctx, familyID, actorID); err != nil {
		return nil, err
	}

	// Look up the target member to validate they exist and check role constraints
	members, err := s.members.ListByFamily(ctx, familyID)
	if err != nil {
		return nil, fmt.Errorf("list members: %w", err)
	}

	var target *domain.FamilyMember
	for i := range members {
		if members[i].ID == memberID {
			target = &members[i]
			break
		}
	}
	if target == nil {
		return nil, ErrNotFamilyMember
	}

	// Cannot change owner's role
	if target.Role == domain.RoleOwner && role != domain.RoleOwner {
		return nil, ErrInsufficientRole
	}
	// Cannot promote to owner
	if role == domain.RoleOwner && target.Role != domain.RoleOwner {
		return nil, ErrInsufficientRole
	}

	target.DisplayName = displayName
	target.Role = role

	if err := s.members.Update(ctx, target); err != nil {
		return nil, fmt.Errorf("update member: %w", err)
	}
	return target, nil
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
