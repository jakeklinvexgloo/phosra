package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/handler/middleware"
	"github.com/guardiangate/api/internal/service"
	"github.com/guardiangate/api/pkg/httputil"
)

type ReportHandler struct {
	reports *service.ReportService
}

func NewReportHandler(reports *service.ReportService) *ReportHandler {
	return &ReportHandler{reports: reports}
}

func (h *ReportHandler) FamilyOverview(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	familyID, err := uuid.Parse(chi.URLParam(r, "familyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid family ID")
		return
	}

	overview, err := h.reports.FamilyOverviewReport(r.Context(), userID, familyID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, overview)
}
