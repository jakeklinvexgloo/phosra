package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/repository"
)

var ErrRatingNotFound = errors.New("rating not found")

type RatingService struct {
	ratings repository.RatingRepository
}

func NewRatingService(ratings repository.RatingRepository) *RatingService {
	return &RatingService{ratings: ratings}
}

func (s *RatingService) GetSystems(ctx context.Context) ([]domain.RatingSystem, error) {
	return s.ratings.GetSystems(ctx)
}

func (s *RatingService) GetRatingsBySystem(ctx context.Context, systemID string) ([]domain.Rating, error) {
	return s.ratings.GetRatingsBySystem(ctx, systemID)
}

func (s *RatingService) GetRatingsForAge(ctx context.Context, age int) (map[string]domain.Rating, error) {
	mappings, err := s.ratings.GetRatingsForAge(ctx, age)
	if err != nil {
		return nil, err
	}
	result := make(map[string]domain.Rating)
	for _, m := range mappings {
		rating, err := s.ratings.GetRatingByID(ctx, m.RatingID)
		if err != nil || rating == nil {
			continue
		}
		result[m.SystemID] = *rating
	}
	return result, nil
}

func (s *RatingService) ConvertRating(ctx context.Context, ratingID uuid.UUID) ([]domain.RatingEquivalence, error) {
	return s.ratings.GetEquivalences(ctx, ratingID)
}

func (s *RatingService) GetDescriptors(ctx context.Context, systemID string) ([]domain.ContentDescriptor, error) {
	return s.ratings.GetDescriptors(ctx, systemID)
}

func (s *RatingService) GetAgeRatingMap(ctx context.Context) ([]domain.AgeRatingMap, error) {
	return s.ratings.GetAgeRatingMap(ctx)
}
