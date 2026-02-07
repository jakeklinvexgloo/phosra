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

var ErrChildNotFound = errors.New("child not found")

type ChildService struct {
	children repository.ChildRepository
	families repository.FamilyRepository
	members  repository.FamilyMemberRepository
	ratings  repository.RatingRepository
}

func NewChildService(
	children repository.ChildRepository,
	families repository.FamilyRepository,
	members repository.FamilyMemberRepository,
	ratings repository.RatingRepository,
) *ChildService {
	return &ChildService{
		children: children,
		families: families,
		members:  members,
		ratings:  ratings,
	}
}

func (s *ChildService) Create(ctx context.Context, userID, familyID uuid.UUID, name string, birthDate time.Time) (*domain.Child, error) {
	if err := s.checkParentRole(ctx, familyID, userID); err != nil {
		return nil, err
	}
	child := &domain.Child{
		ID:        uuid.New(),
		FamilyID:  familyID,
		Name:      name,
		BirthDate: birthDate,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := s.children.Create(ctx, child); err != nil {
		return nil, fmt.Errorf("create child: %w", err)
	}
	return child, nil
}

func (s *ChildService) GetByID(ctx context.Context, userID, childID uuid.UUID) (*domain.Child, error) {
	child, err := s.children.GetByID(ctx, childID)
	if err != nil || child == nil {
		return nil, ErrChildNotFound
	}
	if err := s.checkMembership(ctx, child.FamilyID, userID); err != nil {
		return nil, err
	}
	return child, nil
}

func (s *ChildService) Update(ctx context.Context, userID, childID uuid.UUID, name string, birthDate time.Time) (*domain.Child, error) {
	child, err := s.children.GetByID(ctx, childID)
	if err != nil || child == nil {
		return nil, ErrChildNotFound
	}
	if err := s.checkParentRole(ctx, child.FamilyID, userID); err != nil {
		return nil, err
	}
	child.Name = name
	child.BirthDate = birthDate
	child.UpdatedAt = time.Now()
	if err := s.children.Update(ctx, child); err != nil {
		return nil, fmt.Errorf("update child: %w", err)
	}
	return child, nil
}

func (s *ChildService) Delete(ctx context.Context, userID, childID uuid.UUID) error {
	child, err := s.children.GetByID(ctx, childID)
	if err != nil || child == nil {
		return ErrChildNotFound
	}
	if err := s.checkParentRole(ctx, child.FamilyID, userID); err != nil {
		return err
	}
	return s.children.Delete(ctx, childID)
}

func (s *ChildService) ListByFamily(ctx context.Context, userID, familyID uuid.UUID) ([]domain.Child, error) {
	if err := s.checkMembership(ctx, familyID, userID); err != nil {
		return nil, err
	}
	return s.children.ListByFamily(ctx, familyID)
}

// AgeRatingsResult returns the recommended ratings for a child based on their age.
type AgeRatingsResult struct {
	Age     int                      `json:"age"`
	Ratings map[string]domain.Rating `json:"ratings"` // system_id -> rating
}

func (s *ChildService) GetAgeRatings(ctx context.Context, userID, childID uuid.UUID) (*AgeRatingsResult, error) {
	child, err := s.GetByID(ctx, userID, childID)
	if err != nil {
		return nil, err
	}

	age := child.Age()
	mappings, err := s.ratings.GetRatingsForAge(ctx, age)
	if err != nil {
		return nil, fmt.Errorf("get age ratings: %w", err)
	}

	result := &AgeRatingsResult{
		Age:     age,
		Ratings: make(map[string]domain.Rating),
	}

	for _, m := range mappings {
		rating, err := s.ratings.GetRatingByID(ctx, m.RatingID)
		if err != nil || rating == nil {
			continue
		}
		result.Ratings[m.SystemID] = *rating
	}

	return result, nil
}

func (s *ChildService) checkMembership(ctx context.Context, familyID, userID uuid.UUID) error {
	member, err := s.members.GetRole(ctx, familyID, userID)
	if err != nil || member == nil {
		return ErrNotFamilyMember
	}
	return nil
}

func (s *ChildService) checkParentRole(ctx context.Context, familyID, userID uuid.UUID) error {
	member, err := s.members.GetRole(ctx, familyID, userID)
	if err != nil || member == nil {
		return ErrNotFamilyMember
	}
	if member.Role != domain.RoleOwner && member.Role != domain.RoleParent {
		return ErrInsufficientRole
	}
	return nil
}
