package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/ratings"
	"github.com/guardiangate/api/internal/repository"
)

var (
	ErrDeviceNotFound = errors.New("device not found")
	ErrDeviceRevoked  = errors.New("device has been revoked")
	ErrInvalidAPIKey  = errors.New("invalid device API key")
)

// DevicePolicyService compiles policies for on-device enforcement (Apple FamilyControls)
// and manages device registrations and activity reports.
type DevicePolicyService struct {
	children    repository.ChildRepository
	policies    repository.PolicyRepository
	rules       repository.PolicyRuleRepository
	devices     repository.DeviceRegistrationRepository
	reports     repository.DeviceReportRepository
	activityLog repository.ActivityLogRepository
	members     repository.FamilyMemberRepository
}

func NewDevicePolicyService(
	children repository.ChildRepository,
	policies repository.PolicyRepository,
	rules repository.PolicyRuleRepository,
	devices repository.DeviceRegistrationRepository,
	reports repository.DeviceReportRepository,
	activityLog repository.ActivityLogRepository,
	members repository.FamilyMemberRepository,
) *DevicePolicyService {
	return &DevicePolicyService{
		children:    children,
		policies:    policies,
		rules:       rules,
		devices:     devices,
		reports:     reports,
		activityLog: activityLog,
		members:     members,
	}
}

// ── Compiled Policy Types ───────────────────────────────────────

type CompiledPolicy struct {
	Version       int           `json:"version"`
	ChildID       string        `json:"child_id"`
	ChildAge      int           `json:"child_age"`
	AgeGroup      string        `json:"age_group"`
	PolicyID      string        `json:"policy_id"`
	Status        string        `json:"status"`
	GeneratedAt   time.Time     `json:"generated_at"`
	ContentFilter ContentFilter `json:"content_filter"`
	ScreenTime    ScreenTime    `json:"screen_time"`
	Purchases     Purchases     `json:"purchases"`
	Privacy       Privacy       `json:"privacy"`
	Social        Social        `json:"social"`
	Notifications Notifications `json:"notifications"`
	WebFilter     WebFilter     `json:"web_filter"`
}

type ContentFilter struct {
	AgeRating     string            `json:"age_rating"`
	MaxRatings    map[string]string `json:"max_ratings"`
	BlockedApps   []string          `json:"blocked_apps"`
	AllowedApps   []string          `json:"allowed_apps"`
	AllowlistMode bool              `json:"allowlist_mode"`
}

type ScreenTime struct {
	DailyLimitMinutes int              `json:"daily_limit_minutes"`
	PerAppLimits      []AppLimit       `json:"per_app_limits,omitempty"`
	DowntimeWindows   []DowntimeWindow `json:"downtime_windows,omitempty"`
	AlwaysAllowedApps []string         `json:"always_allowed_apps"`
	Schedule          *ScheduleConfig  `json:"schedule,omitempty"`
}

type AppLimit struct {
	BundleID     string `json:"bundle_id"`
	DailyMinutes int    `json:"daily_minutes"`
}

type DowntimeWindow struct {
	DaysOfWeek []string `json:"days_of_week"`
	StartTime  string   `json:"start_time"`
	EndTime    string   `json:"end_time"`
}

type ScheduleConfig struct {
	Weekday TimeRange `json:"weekday"`
	Weekend TimeRange `json:"weekend"`
}

type TimeRange struct {
	Start string `json:"start"`
	End   string `json:"end"`
}

type Purchases struct {
	RequireApproval bool    `json:"require_approval"`
	BlockIAP        bool    `json:"block_iap"`
	SpendingCapUSD  float64 `json:"spending_cap_usd,omitempty"`
}

type Privacy struct {
	LocationSharingEnabled  bool   `json:"location_sharing_enabled"`
	ProfileVisibility       string `json:"profile_visibility"`
	AccountCreationApproval bool   `json:"account_creation_approval"`
	DataSharingRestricted   bool   `json:"data_sharing_restricted"`
}

type Social struct {
	ChatMode        string `json:"chat_mode"`
	DMRestriction   string `json:"dm_restriction"`
	MultiplayerMode string `json:"multiplayer_mode"`
}

type Notifications struct {
	CurfewStart   string `json:"curfew_start,omitempty"`
	CurfewEnd     string `json:"curfew_end,omitempty"`
	UsageTimerMin int    `json:"usage_timer_minutes,omitempty"`
}

type WebFilter struct {
	Level             string   `json:"level"`
	SafeSearch        bool     `json:"safe_search"`
	BlockedDomains    []string `json:"blocked_domains"`
	AllowedDomains    []string `json:"allowed_domains"`
	BlockedCategories []string `json:"blocked_categories"`
}

// ── Policy Compilation ──────────────────────────────────────────

func (s *DevicePolicyService) CompilePolicy(ctx context.Context, childID uuid.UUID) (*CompiledPolicy, error) {
	child, err := s.children.GetByID(ctx, childID)
	if err != nil || child == nil {
		return nil, ErrChildNotFound
	}

	policies, err := s.policies.ListByChild(ctx, childID)
	if err != nil {
		return nil, fmt.Errorf("list policies: %w", err)
	}

	// Find the active policy
	var activePolicy *domain.ChildPolicy
	for i := range policies {
		if policies[i].Status == domain.PolicyActive {
			activePolicy = &policies[i]
			break
		}
	}
	if activePolicy == nil {
		return nil, ErrPolicyNotFound
	}

	rules, err := s.rules.ListByPolicy(ctx, activePolicy.ID)
	if err != nil {
		return nil, fmt.Errorf("list rules: %w", err)
	}

	age := child.Age()
	ageGroup := ratings.GetAgeGroup(age)
	ageRatings := ratings.GetRatingsForAge(age)

	compiled := &CompiledPolicy{
		Version:     activePolicy.Version,
		ChildID:     childID.String(),
		ChildAge:    age,
		AgeGroup:    ageGroup.Label,
		PolicyID:    activePolicy.ID.String(),
		Status:      string(activePolicy.Status),
		GeneratedAt: time.Now(),
		ContentFilter: ContentFilter{
			AgeRating:   ageRatings["apple"],
			MaxRatings:  ageRatings,
			BlockedApps: []string{},
			AllowedApps: []string{},
		},
		ScreenTime: ScreenTime{
			AlwaysAllowedApps: []string{
				"com.apple.mobilephone",
				"com.apple.MobileSMS",
				"com.apple.Maps",
			},
		},
		WebFilter: WebFilter{
			BlockedDomains:    []string{},
			AllowedDomains:    []string{},
			BlockedCategories: []string{},
		},
	}

	// Populate from rules
	for _, rule := range rules {
		if !rule.Enabled {
			continue
		}
		s.applyRuleToPolicy(compiled, rule)
	}

	return compiled, nil
}

func (s *DevicePolicyService) applyRuleToPolicy(cp *CompiledPolicy, rule domain.PolicyRule) {
	var cfg map[string]any
	_ = json.Unmarshal(rule.Config, &cfg)

	switch rule.Category {
	// Content
	case domain.RuleContentRating:
		if maxRatings, ok := cfg["max_ratings"].(map[string]any); ok {
			for sys, rating := range maxRatings {
				if r, ok := rating.(string); ok {
					cp.ContentFilter.MaxRatings[sys] = r
				}
			}
		}
	case domain.RuleContentAllowlistMode:
		cp.ContentFilter.AllowlistMode = boolVal(cfg, "enabled")
	case domain.RuleContentBlockTitle:
		if apps, ok := cfg["bundle_ids"].([]any); ok {
			for _, a := range apps {
				if s, ok := a.(string); ok {
					cp.ContentFilter.BlockedApps = append(cp.ContentFilter.BlockedApps, s)
				}
			}
		}
	case domain.RuleContentAllowTitle:
		if apps, ok := cfg["bundle_ids"].([]any); ok {
			for _, a := range apps {
				if s, ok := a.(string); ok {
					cp.ContentFilter.AllowedApps = append(cp.ContentFilter.AllowedApps, s)
				}
			}
		}

	// Screen Time
	case domain.RuleTimeDailyLimit:
		cp.ScreenTime.DailyLimitMinutes = intVal(cfg, "daily_minutes")
	case domain.RuleTimePerAppLimit:
		if limits, ok := cfg["limits"].([]any); ok {
			for _, l := range limits {
				if m, ok := l.(map[string]any); ok {
					cp.ScreenTime.PerAppLimits = append(cp.ScreenTime.PerAppLimits, AppLimit{
						BundleID:     stringVal(m, "bundle_id"),
						DailyMinutes: intVal(m, "daily_minutes"),
					})
				}
			}
		}
	case domain.RuleTimeScheduledHours:
		if sched, ok := cfg["schedule"].(map[string]any); ok {
			sc := &ScheduleConfig{}
			if wd, ok := sched["weekday"].(map[string]any); ok {
				sc.Weekday = TimeRange{Start: stringVal(wd, "start"), End: stringVal(wd, "end")}
			}
			if we, ok := sched["weekend"].(map[string]any); ok {
				sc.Weekend = TimeRange{Start: stringVal(we, "start"), End: stringVal(we, "end")}
			}
			cp.ScreenTime.Schedule = sc
		}
	case domain.RuleTimeDowntime:
		dw := DowntimeWindow{
			StartTime: stringVal(cfg, "start"),
			EndTime:   stringVal(cfg, "end"),
		}
		if days, ok := cfg["days"].([]any); ok {
			for _, d := range days {
				if s, ok := d.(string); ok {
					dw.DaysOfWeek = append(dw.DaysOfWeek, s)
				}
			}
		}
		if dw.DaysOfWeek == nil {
			dw.DaysOfWeek = []string{"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"}
		}
		cp.ScreenTime.DowntimeWindows = append(cp.ScreenTime.DowntimeWindows, dw)

	// Purchases
	case domain.RulePurchaseApproval:
		cp.Purchases.RequireApproval = boolVal(cfg, "require_approval")
	case domain.RulePurchaseBlockIAP:
		cp.Purchases.BlockIAP = boolVal(cfg, "block_iap")
	case domain.RulePurchaseSpendingCap:
		cp.Purchases.SpendingCapUSD = floatVal(cfg, "amount")

	// Privacy
	case domain.RulePrivacyLocation:
		cp.Privacy.LocationSharingEnabled = boolVal(cfg, "enabled")
	case domain.RulePrivacyProfileVisibility:
		cp.Privacy.ProfileVisibility = stringVal(cfg, "visibility")
	case domain.RulePrivacyAccountCreation:
		cp.Privacy.AccountCreationApproval = boolVal(cfg, "require_approval")
	case domain.RulePrivacyDataSharing:
		cp.Privacy.DataSharingRestricted = boolVal(cfg, "restricted")

	// Social
	case domain.RuleSocialChatControl:
		cp.Social.ChatMode = stringVal(cfg, "mode")
	case domain.RuleDMRestriction:
		cp.Social.DMRestriction = stringVal(cfg, "mode")
	case domain.RuleSocialMultiplayer:
		cp.Social.MultiplayerMode = stringVal(cfg, "mode")

	// Notifications
	case domain.RuleNotificationCurfew:
		cp.Notifications.CurfewStart = stringVal(cfg, "start")
		cp.Notifications.CurfewEnd = stringVal(cfg, "end")
	case domain.RuleUsageTimerNotification:
		cp.Notifications.UsageTimerMin = intVal(cfg, "interval_minutes")

	// Web Filtering
	case domain.RuleWebFilterLevel:
		cp.WebFilter.Level = stringVal(cfg, "level")
	case domain.RuleWebSafeSearch:
		cp.WebFilter.SafeSearch = boolVal(cfg, "enabled")
	case domain.RuleWebCustomBlocklist:
		if domains, ok := cfg["domains"].([]any); ok {
			for _, d := range domains {
				if s, ok := d.(string); ok {
					cp.WebFilter.BlockedDomains = append(cp.WebFilter.BlockedDomains, s)
				}
			}
		}
	case domain.RuleWebCustomAllowlist:
		if domains, ok := cfg["domains"].([]any); ok {
			for _, d := range domains {
				if s, ok := d.(string); ok {
					cp.WebFilter.AllowedDomains = append(cp.WebFilter.AllowedDomains, s)
				}
			}
		}
	case domain.RuleWebCategoryBlock:
		if cats, ok := cfg["categories"].([]any); ok {
			for _, c := range cats {
				if s, ok := c.(string); ok {
					cp.WebFilter.BlockedCategories = append(cp.WebFilter.BlockedCategories, s)
				}
			}
		}
	}
}

// ── Device Registration ─────────────────────────────────────────

type RegisterDeviceRequest struct {
	DeviceName   string   `json:"device_name"`
	DeviceModel  string   `json:"device_model"`
	OSVersion    string   `json:"os_version"`
	AppVersion   string   `json:"app_version"`
	APNsToken    *string  `json:"apns_token,omitempty"`
	Capabilities []string `json:"capabilities,omitempty"`
}

type RegisterDeviceResponse struct {
	Device *domain.DeviceRegistration `json:"device"`
	APIKey string                     `json:"api_key"`
}

func (s *DevicePolicyService) RegisterDevice(ctx context.Context, userID, childID uuid.UUID, req RegisterDeviceRequest) (*RegisterDeviceResponse, error) {
	child, err := s.children.GetByID(ctx, childID)
	if err != nil || child == nil {
		return nil, ErrChildNotFound
	}
	if err := s.checkParentRole(ctx, child.FamilyID, userID); err != nil {
		return nil, err
	}

	// Generate a random 32-byte API key
	keyBytes := make([]byte, 32)
	if _, err := rand.Read(keyBytes); err != nil {
		return nil, fmt.Errorf("generate API key: %w", err)
	}
	apiKey := hex.EncodeToString(keyBytes)

	// Store SHA-256 hash
	hash := sha256.Sum256([]byte(apiKey))
	hashHex := hex.EncodeToString(hash[:])

	caps := req.Capabilities
	if caps == nil {
		caps = []string{}
	}

	reg := &domain.DeviceRegistration{
		ID:                 uuid.New(),
		ChildID:            childID,
		FamilyID:           child.FamilyID,
		PlatformID:         "apple",
		DeviceName:         req.DeviceName,
		DeviceModel:        req.DeviceModel,
		OSVersion:          req.OSVersion,
		AppVersion:         req.AppVersion,
		APNsToken:          req.APNsToken,
		APIKeyHash:         hashHex,
		Capabilities:       caps,
		EnforcementSummary: json.RawMessage("{}"),
		Status:             "active",
	}

	if err := s.devices.Create(ctx, reg); err != nil {
		return nil, fmt.Errorf("create device registration: %w", err)
	}

	return &RegisterDeviceResponse{
		Device: reg,
		APIKey: apiKey,
	}, nil
}

func (s *DevicePolicyService) AuthenticateDevice(ctx context.Context, apiKey string) (*domain.DeviceRegistration, error) {
	hash := sha256.Sum256([]byte(apiKey))
	hashHex := hex.EncodeToString(hash[:])

	reg, err := s.devices.GetByAPIKeyHash(ctx, hashHex)
	if err != nil {
		return nil, fmt.Errorf("lookup device: %w", err)
	}
	if reg == nil {
		return nil, ErrInvalidAPIKey
	}
	if reg.Status == "revoked" {
		return nil, ErrDeviceRevoked
	}

	// Update last_seen_at
	now := time.Now()
	reg.LastSeenAt = &now
	_ = s.devices.Update(ctx, reg)

	return reg, nil
}

type UpdateDeviceRequest struct {
	DeviceName *string `json:"device_name,omitempty"`
	APNsToken  *string `json:"apns_token,omitempty"`
	AppVersion *string `json:"app_version,omitempty"`
	OSVersion  *string `json:"os_version,omitempty"`
}

func (s *DevicePolicyService) UpdateDevice(ctx context.Context, userID, deviceID uuid.UUID, req UpdateDeviceRequest) (*domain.DeviceRegistration, error) {
	reg, err := s.devices.GetByID(ctx, deviceID)
	if err != nil || reg == nil {
		return nil, ErrDeviceNotFound
	}
	if err := s.checkParentRole(ctx, reg.FamilyID, userID); err != nil {
		return nil, err
	}

	if req.DeviceName != nil {
		reg.DeviceName = *req.DeviceName
	}
	if req.APNsToken != nil {
		reg.APNsToken = req.APNsToken
	}
	if req.AppVersion != nil {
		reg.AppVersion = *req.AppVersion
	}
	if req.OSVersion != nil {
		reg.OSVersion = *req.OSVersion
	}

	if err := s.devices.Update(ctx, reg); err != nil {
		return nil, err
	}
	return reg, nil
}

func (s *DevicePolicyService) RevokeDevice(ctx context.Context, userID, deviceID uuid.UUID) error {
	reg, err := s.devices.GetByID(ctx, deviceID)
	if err != nil || reg == nil {
		return ErrDeviceNotFound
	}
	if err := s.checkParentRole(ctx, reg.FamilyID, userID); err != nil {
		return err
	}

	reg.Status = "revoked"
	return s.devices.Update(ctx, reg)
}

func (s *DevicePolicyService) ListDevices(ctx context.Context, userID, childID uuid.UUID) ([]domain.DeviceRegistration, error) {
	child, err := s.children.GetByID(ctx, childID)
	if err != nil || child == nil {
		return nil, ErrChildNotFound
	}
	if err := s.checkMembership(ctx, child.FamilyID, userID); err != nil {
		return nil, err
	}
	return s.devices.ListByChild(ctx, childID)
}

// ── Activity Reporting ──────────────────────────────────────────

type DeviceReportRequest struct {
	ReportType string          `json:"report_type"`
	Payload    json.RawMessage `json:"payload"`
	ReportedAt time.Time       `json:"reported_at"`
}

// EnforcementStatusReport is the structured payload for report_type "enforcement_status".
type EnforcementStatusReport struct {
	PolicyVersion int                         `json:"policy_version"`
	Results       []CategoryEnforcementResult `json:"results"`
}

// CategoryEnforcementResult describes the outcome of enforcing a single rule category.
type CategoryEnforcementResult struct {
	Category  string `json:"category"`              // e.g. "time_daily_limit"
	Status    string `json:"status"`                // "enforced", "partial", "failed", "unsupported"
	Framework string `json:"framework"`             // "DeviceActivity", "ManagedSettings", "FamilyControls"
	Detail    string `json:"detail,omitempty"`       // error message or note
}

func (s *DevicePolicyService) IngestReport(ctx context.Context, device *domain.DeviceRegistration, req DeviceReportRequest) error {
	report := &domain.DeviceReport{
		ID:         uuid.New(),
		DeviceID:   device.ID,
		ChildID:    device.ChildID,
		ReportType: req.ReportType,
		Payload:    req.Payload,
		ReportedAt: req.ReportedAt,
	}

	if err := s.reports.Create(ctx, report); err != nil {
		return fmt.Errorf("create device report: %w", err)
	}

	// Fan out to activity_logs for the existing analytics pipeline
	activityLog := &domain.ActivityLog{
		ID:         uuid.New(),
		ChildID:    device.ChildID,
		PlatformID: "apple",
		Category:   req.ReportType,
		Detail:     req.Payload,
		RecordedAt: req.ReportedAt,
	}
	_ = s.activityLog.Create(ctx, activityLog)

	// For enforcement_status reports, update the device's enforcement summary
	if req.ReportType == "enforcement_status" {
		var esr EnforcementStatusReport
		if err := json.Unmarshal(req.Payload, &esr); err == nil {
			device.EnforcementSummary = req.Payload
			device.LastPolicyVersion = esr.PolicyVersion
			now := time.Now()
			device.LastSeenAt = &now
			_ = s.devices.Update(ctx, device)
		}
	}

	return nil
}

// ── Policy Version Acknowledgment ───────────────────────────────

func (s *DevicePolicyService) AckPolicyVersion(ctx context.Context, device *domain.DeviceRegistration, version int) error {
	device.LastPolicyVersion = version
	now := time.Now()
	device.LastSeenAt = &now
	return s.devices.Update(ctx, device)
}

// ── GetPolicyVersion (for efficient polling) ────────────────────

func (s *DevicePolicyService) GetPolicyVersion(ctx context.Context, childID uuid.UUID) (int, error) {
	policies, err := s.policies.ListByChild(ctx, childID)
	if err != nil {
		return 0, err
	}
	for _, p := range policies {
		if p.Status == domain.PolicyActive {
			return p.Version, nil
		}
	}
	return 0, ErrPolicyNotFound
}

// ── Helpers ─────────────────────────────────────────────────────

func (s *DevicePolicyService) checkMembership(ctx context.Context, familyID, userID uuid.UUID) error {
	member, err := s.members.GetRole(ctx, familyID, userID)
	if err != nil || member == nil {
		return ErrNotFamilyMember
	}
	return nil
}

func (s *DevicePolicyService) checkParentRole(ctx context.Context, familyID, userID uuid.UUID) error {
	member, err := s.members.GetRole(ctx, familyID, userID)
	if err != nil || member == nil {
		return ErrNotFamilyMember
	}
	if member.Role != domain.RoleOwner && member.Role != domain.RoleParent {
		return ErrInsufficientRole
	}
	return nil
}

// Config value helpers
func stringVal(m map[string]any, key string) string {
	if v, ok := m[key].(string); ok {
		return v
	}
	return ""
}

func boolVal(m map[string]any, key string) bool {
	if v, ok := m[key].(bool); ok {
		return v
	}
	return false
}

func intVal(m map[string]any, key string) int {
	if v, ok := m[key].(float64); ok {
		return int(v)
	}
	return 0
}

func floatVal(m map[string]any, key string) float64 {
	if v, ok := m[key].(float64); ok {
		return v
	}
	return 0
}
