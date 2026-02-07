package handler

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/service"
	"github.com/guardiangate/api/pkg/httputil"
)

type RatingHandler struct {
	ratings *service.RatingService
}

func NewRatingHandler(ratings *service.RatingService) *RatingHandler {
	return &RatingHandler{ratings: ratings}
}

func (h *RatingHandler) GetSystems(w http.ResponseWriter, r *http.Request) {
	systems, err := h.ratings.GetSystems(r.Context())
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get rating systems")
		return
	}
	httputil.JSON(w, http.StatusOK, systems)
}

func (h *RatingHandler) GetBySystem(w http.ResponseWriter, r *http.Request) {
	systemID := chi.URLParam(r, "systemID")
	ratings, err := h.ratings.GetRatingsBySystem(r.Context(), systemID)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get ratings")
		return
	}
	httputil.JSON(w, http.StatusOK, ratings)
}

func (h *RatingHandler) GetByAge(w http.ResponseWriter, r *http.Request) {
	ageStr := r.URL.Query().Get("age")
	age, err := strconv.Atoi(ageStr)
	if err != nil || age < 0 {
		httputil.Error(w, http.StatusBadRequest, "valid age query parameter required")
		return
	}

	ratings, err := h.ratings.GetRatingsForAge(r.Context(), age)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get ratings for age")
		return
	}
	httputil.JSON(w, http.StatusOK, ratings)
}

func (h *RatingHandler) Convert(w http.ResponseWriter, r *http.Request) {
	ratingIDStr := chi.URLParam(r, "ratingID")
	ratingID, err := uuid.Parse(ratingIDStr)
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid rating ID")
		return
	}

	equivalences, err := h.ratings.ConvertRating(r.Context(), ratingID)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to convert rating")
		return
	}
	httputil.JSON(w, http.StatusOK, equivalences)
}

func (h *RatingHandler) GetDescriptors(w http.ResponseWriter, r *http.Request) {
	systemID := chi.URLParam(r, "systemID")
	descriptors, err := h.ratings.GetDescriptors(r.Context(), systemID)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get descriptors")
		return
	}
	httputil.JSON(w, http.StatusOK, descriptors)
}
