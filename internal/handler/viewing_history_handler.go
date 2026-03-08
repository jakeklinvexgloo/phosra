package handler

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/handler/middleware"
	"github.com/guardiangate/api/internal/repository"
	"github.com/guardiangate/api/pkg/httputil"
)

// ViewingHistoryHandler serves viewing history and CSM review endpoints.
type ViewingHistoryHandler struct {
	viewingRepo repository.ViewingHistoryRepository
	csmRepo     repository.CSMReviewRepository
	childRepo   repository.ChildRepository
	familyRepo  repository.FamilyRepository
}

func NewViewingHistoryHandler(vr repository.ViewingHistoryRepository, cr repository.CSMReviewRepository, childRepo repository.ChildRepository, familyRepo repository.FamilyRepository) *ViewingHistoryHandler {
	return &ViewingHistoryHandler{viewingRepo: vr, csmRepo: cr, childRepo: childRepo, familyRepo: familyRepo}
}

// syncEntry is the lightweight payload the browser sends per title.
type syncEntry struct {
	ChildID        string  `json:"child_id"`
	ChildName      string  `json:"child_name"` // fallback for name-based resolution
	Platform       string  `json:"platform"`
	Title          string  `json:"title"`
	SeriesTitle    *string `json:"series_title"`
	WatchedDate    *string `json:"watched_date"` // YYYY-MM-DD or null
	NetflixProfile string  `json:"netflix_profile"`
}

// SyncHistory upserts viewing history entries.
// Resolves child_id by UUID or by name within the user's family.
// POST /api/v1/viewing-history/sync
func (h *ViewingHistoryHandler) SyncHistory(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Entries []syncEntry `json:"entries"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if len(req.Entries) == 0 {
		httputil.Error(w, http.StatusBadRequest, "entries is required")
		return
	}

	// Build a map of child_id (UUID) -> family_id
	// Also build a map of child name -> (child_id, family_id) for name-based fallback
	type childInfo struct {
		childID  uuid.UUID
		familyID uuid.UUID
	}

	childByUUID := make(map[uuid.UUID]childInfo)
	childByName := make(map[string]childInfo) // lowercase name -> info

	// Try to load user's families and all children for name-based resolution
	userID := middleware.GetUserID(r.Context())
	if userID != uuid.Nil {
		families, err := h.familyRepo.ListByUser(r.Context(), userID)
		if err == nil {
			for _, fam := range families {
				kids, err := h.childRepo.ListByFamily(r.Context(), fam.ID)
				if err != nil {
					continue
				}
				for _, kid := range kids {
					info := childInfo{childID: kid.ID, familyID: fam.ID}
					childByUUID[kid.ID] = info
					childByName[strings.ToLower(kid.Name)] = info
				}
			}
		}
	}

	// Also resolve any direct UUID child_ids not already in the map
	for _, e := range req.Entries {
		cid, err := uuid.Parse(e.ChildID)
		if err != nil {
			continue
		}
		if _, ok := childByUUID[cid]; !ok {
			child, err := h.childRepo.GetByID(r.Context(), cid)
			if err != nil || child == nil {
				continue
			}
			childByUUID[cid] = childInfo{childID: cid, familyID: child.FamilyID}
		}
	}

	// Build domain entries
	var entries []domain.ViewingHistoryEntry
	for _, e := range req.Entries {
		var info childInfo
		var found bool

		// Try UUID first
		cid, err := uuid.Parse(e.ChildID)
		if err == nil {
			info, found = childByUUID[cid]
		}

		// Fallback: match by child_name
		if !found && e.ChildName != "" {
			name := strings.ToLower(strings.TrimSpace(e.ChildName))
			// Try exact match
			info, found = childByName[name]
			// Try stripping common prefixes (e.g. "Persist_Chap" -> "chap")
			if !found {
				for _, prefix := range []string{"persist_"} {
					if stripped := strings.TrimPrefix(name, prefix); stripped != name {
						info, found = childByName[stripped]
						if found {
							break
						}
					}
				}
			}
			// Try suffix match (e.g. "persist_chap" ends with "chap")
			if !found {
				for cn, ci := range childByName {
					if strings.HasSuffix(name, cn) || strings.HasSuffix(cn, name) {
						info = ci
						found = true
						break
					}
				}
			}
		}

		if !found {
			continue
		}

		var watchedDate *time.Time
		if e.WatchedDate != nil && *e.WatchedDate != "" {
			t, err := time.Parse("2006-01-02", *e.WatchedDate)
			if err == nil {
				watchedDate = &t
			}
		}

		entries = append(entries, domain.ViewingHistoryEntry{
			ChildID:        info.childID,
			FamilyID:       info.familyID,
			Platform:       e.Platform,
			Title:          e.Title,
			SeriesTitle:    e.SeriesTitle,
			WatchedDate:    watchedDate,
			NetflixProfile: e.NetflixProfile,
		})
	}

	if len(entries) == 0 {
		httputil.JSON(w, http.StatusOK, map[string]any{
			"synced":  0,
			"skipped": len(req.Entries),
			"reason":  "no entries matched known children",
		})
		return
	}

	if err := h.viewingRepo.UpsertBatch(r.Context(), entries); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to sync viewing history")
		return
	}

	httputil.JSON(w, http.StatusOK, map[string]any{
		"synced":  len(entries),
		"skipped": len(req.Entries) - len(entries),
	})
}

// GetChildHistory returns viewing history for a child.
// GET /api/v1/viewing-history/{childId}
func (h *ViewingHistoryHandler) GetChildHistory(w http.ResponseWriter, r *http.Request) {
	childID, err := uuid.Parse(chi.URLParam(r, "childId"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child ID")
		return
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	entries, err := h.viewingRepo.ListByChild(r.Context(), childID, limit, offset)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to list viewing history")
		return
	}
	if entries == nil {
		entries = []domain.ViewingHistoryEntry{}
	}

	httputil.JSON(w, http.StatusOK, entries)
}

// DeleteChildHistory removes all viewing history for a child.
// DELETE /api/v1/viewing-history/{childId}
func (h *ViewingHistoryHandler) DeleteChildHistory(w http.ResponseWriter, r *http.Request) {
	childID, err := uuid.Parse(chi.URLParam(r, "childId"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child ID")
		return
	}

	if err := h.viewingRepo.DeleteByChild(r.Context(), childID); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to delete viewing history")
		return
	}
	httputil.NoContent(w)
}

// GetCSMReview returns a single CSM review by slug.
// GET /api/v1/csm/review/{slug}
func (h *ViewingHistoryHandler) GetCSMReview(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	if slug == "" {
		httputil.Error(w, http.StatusBadRequest, "slug is required")
		return
	}

	review, err := h.csmRepo.GetBySlug(r.Context(), slug)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get review")
		return
	}
	if review == nil {
		httputil.Error(w, http.StatusNotFound, "review not found")
		return
	}

	httputil.JSON(w, http.StatusOK, review)
}

// BulkUpsertReviews upserts a batch of CSM reviews.
// POST /api/v1/csm/reviews/bulk
func (h *ViewingHistoryHandler) BulkUpsertReviews(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Reviews []domain.CSMReview `json:"reviews"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if len(req.Reviews) == 0 {
		httputil.Error(w, http.StatusBadRequest, "reviews is required")
		return
	}

	if err := h.csmRepo.UpsertBatch(r.Context(), req.Reviews); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to upsert reviews")
		return
	}

	httputil.JSON(w, http.StatusOK, map[string]any{
		"upserted": len(req.Reviews),
	})
}

// LinkCSM links viewing_history entries to csm_reviews by matching series_title or title.
// POST /api/v1/viewing-history/link-csm
func (h *ViewingHistoryHandler) LinkCSM(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == uuid.Nil {
		httputil.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	linked, err := h.viewingRepo.LinkCSMReviews(r.Context(), userID)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to link CSM reviews")
		return
	}

	httputil.JSON(w, http.StatusOK, map[string]any{
		"linked": linked,
	})
}

// GetAnalytics returns viewing analytics for a child.
// GET /api/v1/viewing-analytics/{childId}
func (h *ViewingHistoryHandler) GetAnalytics(w http.ResponseWriter, r *http.Request) {
	childID, err := uuid.Parse(chi.URLParam(r, "childId"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child ID")
		return
	}

	analytics, err := h.viewingRepo.GetAnalytics(r.Context(), childID)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get analytics")
		return
	}
	if analytics == nil {
		httputil.Error(w, http.StatusNotFound, "no viewing history found for child")
		return
	}

	httputil.JSON(w, http.StatusOK, analytics)
}
