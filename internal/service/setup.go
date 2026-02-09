package service

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/handler/middleware"
	"github.com/guardiangate/api/internal/repository"
)

// Strictness levels for quick setup.
type Strictness string

const (
	StrictnessRecommended Strictness = "recommended"
	StrictnessStrict      Strictness = "strict"
	StrictnessRelaxed     Strictness = "relaxed"
)

type QuickSetupRequest struct {
	FamilyID   *uuid.UUID `json:"family_id,omitempty"`
	FamilyName string     `json:"family_name,omitempty"`
	ChildName  string     `json:"child_name"`
	BirthDate  string     `json:"birth_date"`
	Strictness Strictness `json:"strictness"`
}

type RuleSummary struct {
	ScreenTimeMinutes int    `json:"screen_time_minutes"`
	BedtimeHour       int    `json:"bedtime_hour"`
	WebFilterLevel    string `json:"web_filter_level"`
	ContentRating     string `json:"content_rating"`
	TotalRulesEnabled int    `json:"total_rules_enabled"`
}

type ConnectedPlatformSummary struct {
	PlatformID string `json:"platform_id"`
	Name       string `json:"name"`
	Status     string `json:"status"`
}

type QuickSetupResponse struct {
	Family             *domain.Family             `json:"family"`
	Child              *domain.Child              `json:"child"`
	Policy             *domain.ChildPolicy        `json:"policy"`
	Rules              []domain.PolicyRule         `json:"rules"`
	AgeGroup           string                     `json:"age_group"`
	MaxRatings         map[string]string           `json:"max_ratings"`
	RuleSummary        RuleSummary                `json:"rule_summary"`
	ConnectedPlatforms []ConnectedPlatformSummary `json:"connected_platforms,omitempty"`
}

type QuickSetupService struct {
	families        repository.FamilyRepository
	members         repository.FamilyMemberRepository
	children        repository.ChildRepository
	policies        repository.PolicyRepository
	rules           repository.PolicyRuleRepository
	ratings         repository.RatingRepository
	complianceLinks repository.ComplianceLinkRepository
	policySvc       *PolicyService
}

func NewQuickSetupService(
	families repository.FamilyRepository,
	members repository.FamilyMemberRepository,
	children repository.ChildRepository,
	policies repository.PolicyRepository,
	rules repository.PolicyRuleRepository,
	ratings repository.RatingRepository,
	policySvc *PolicyService,
	complianceLinks ...repository.ComplianceLinkRepository,
) *QuickSetupService {
	svc := &QuickSetupService{
		families:  families,
		members:   members,
		children:  children,
		policies:  policies,
		rules:     rules,
		ratings:   ratings,
		policySvc: policySvc,
	}
	if len(complianceLinks) > 0 {
		svc.complianceLinks = complianceLinks[0]
	}
	return svc
}

func (s *QuickSetupService) QuickSetup(ctx context.Context, userID uuid.UUID, req QuickSetupRequest) (*QuickSetupResponse, error) {
	birthDate, err := time.Parse("2006-01-02", req.BirthDate)
	if err != nil {
		return nil, fmt.Errorf("invalid birth_date format, use YYYY-MM-DD")
	}

	if req.Strictness == "" {
		req.Strictness = StrictnessRecommended
	}

	// Step 1: Create or retrieve family
	var family *domain.Family
	if req.FamilyID != nil {
		family, err = s.families.GetByID(ctx, *req.FamilyID)
		if err != nil || family == nil {
			return nil, ErrFamilyNotFound
		}
		member, err := s.members.GetRole(ctx, family.ID, userID)
		if err != nil || member == nil {
			return nil, ErrNotFamilyMember
		}
		if member.Role != domain.RoleOwner && member.Role != domain.RoleParent {
			return nil, ErrInsufficientRole
		}
	} else {
		familyName := req.FamilyName
		if familyName == "" {
			familyName = req.ChildName + "'s Family"
		}
		family = &domain.Family{
			ID:        uuid.New(),
			Name:      familyName,
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
			return nil, fmt.Errorf("add owner member: %w", err)
		}
	}

	// Step 2: Create child
	child := &domain.Child{
		ID:        uuid.New(),
		FamilyID:  family.ID,
		Name:      req.ChildName,
		BirthDate: birthDate,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := s.children.Create(ctx, child); err != nil {
		return nil, fmt.Errorf("create child: %w", err)
	}

	// Step 3: Create policy
	policy := &domain.ChildPolicy{
		ID:        uuid.New(),
		ChildID:   child.ID,
		Name:      req.ChildName + "'s Protection Policy",
		Status:    domain.PolicyDraft,
		Priority:  0,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := s.policies.Create(ctx, policy); err != nil {
		return nil, fmt.Errorf("create policy: %w", err)
	}

	// Step 4: Generate age-based rules using the policy service
	generatedRules, err := s.policySvc.GenerateFromAge(ctx, userID, policy.ID)
	if err != nil {
		return nil, fmt.Errorf("generate age rules: %w", err)
	}

	// Apply strictness adjustments
	generatedRules = s.applyStrictness(generatedRules, req.Strictness)
	if err := s.rules.BulkUpsert(ctx, policy.ID, generatedRules); err != nil {
		return nil, fmt.Errorf("apply strictness: %w", err)
	}

	// Step 5: Activate policy
	policy.Status = domain.PolicyActive
	policy.UpdatedAt = time.Now()
	if err := s.policies.Update(ctx, policy); err != nil {
		return nil, fmt.Errorf("activate policy: %w", err)
	}

	// Step 6: Build response
	finalRules, _ := s.rules.ListByPolicy(ctx, policy.ID)

	age := child.Age()
	ageGroup := computeAgeGroup(age)
	maxRatings := extractMaxRatings(finalRules)
	summary := buildRuleSummary(finalRules)

	resp := &QuickSetupResponse{
		Family:      family,
		Child:       child,
		Policy:      policy,
		Rules:       finalRules,
		AgeGroup:    ageGroup,
		MaxRatings:  maxRatings,
		RuleSummary: summary,
	}

	// Step 7 (sandbox only): Auto-connect popular platforms so enforcement
	// has targets to fan out to, making the demo compelling out of the box.
	if middleware.IsSandbox(ctx) && s.complianceLinks != nil {
		resp.ConnectedPlatforms = s.autoConnectDemoPlatforms(ctx, family.ID)
	}

	return resp, nil
}

// sandboxPlatforms defines the platforms auto-connected in sandbox mode.
var sandboxPlatforms = []struct {
	ID   string
	Name string
}{
	{"netflix", "Netflix"},
	{"youtube", "YouTube / YouTube Kids"},
	{"disney_plus", "Disney+"},
	{"nextdns", "NextDNS"},
	{"android", "Android / Family Link"},
	{"xbox", "Xbox"},
}

func (s *QuickSetupService) autoConnectDemoPlatforms(ctx context.Context, familyID uuid.UUID) []ConnectedPlatformSummary {
	var connected []ConnectedPlatformSummary
	now := time.Now()

	for _, p := range sandboxPlatforms {
		// Skip if already connected
		existing, _ := s.complianceLinks.GetByFamilyAndPlatform(ctx, familyID, p.ID)
		if existing != nil {
			connected = append(connected, ConnectedPlatformSummary{
				PlatformID: p.ID,
				Name:       p.Name,
				Status:     existing.Status,
			})
			continue
		}

		link := &domain.ComplianceLink{
			ID:         uuid.New(),
			FamilyID:   familyID,
			PlatformID: p.ID,
			Status:     "connected",
			VerifiedAt: now,
		}
		if err := s.complianceLinks.Create(ctx, link); err != nil {
			continue
		}
		connected = append(connected, ConnectedPlatformSummary{
			PlatformID: p.ID,
			Name:       p.Name,
			Status:     "connected",
		})
	}
	return connected
}

func (s *QuickSetupService) applyStrictness(rules []domain.PolicyRule, strictness Strictness) []domain.PolicyRule {
	if strictness == StrictnessRecommended {
		return rules
	}

	for i, rule := range rules {
		switch strictness {
		case StrictnessStrict:
			switch rule.Category {
			case domain.RuleTimeDailyLimit:
				minutes := extractIntFromConfig(rule.Config, "daily_minutes")
				rules[i].Config = jsonBytes(map[string]any{"daily_minutes": int(float64(minutes) * 0.7)})
			case domain.RuleUsageTimerNotification:
				interval := extractIntFromConfig(rule.Config, "interval_minutes")
				if interval > 15 {
					rules[i].Config = jsonBytes(map[string]any{"interval_minutes": interval - 15})
				}
			}
		case StrictnessRelaxed:
			switch rule.Category {
			case domain.RuleTimeDailyLimit:
				minutes := extractIntFromConfig(rule.Config, "daily_minutes")
				rules[i].Config = jsonBytes(map[string]any{"daily_minutes": int(float64(minutes) * 1.3)})
			case domain.RuleUsageTimerNotification:
				interval := extractIntFromConfig(rule.Config, "interval_minutes")
				rules[i].Config = jsonBytes(map[string]any{"interval_minutes": interval + 15})
			}
		}
	}
	return rules
}

func extractIntFromConfig(config []byte, key string) int {
	var m map[string]any
	if err := json.Unmarshal(config, &m); err != nil {
		return 0
	}
	if v, ok := m[key].(float64); ok {
		return int(v)
	}
	return 0
}

func computeAgeGroup(age int) string {
	switch {
	case age <= 6:
		return "toddler"
	case age <= 9:
		return "child"
	case age <= 12:
		return "preteen"
	case age <= 16:
		return "teen"
	default:
		return "young_adult"
	}
}

func extractMaxRatings(rules []domain.PolicyRule) map[string]string {
	for _, r := range rules {
		if r.Category == domain.RuleContentRating {
			var m map[string]any
			if err := json.Unmarshal(r.Config, &m); err == nil {
				if ratings, ok := m["max_ratings"].(map[string]any); ok {
					result := make(map[string]string)
					for k, v := range ratings {
						if s, ok := v.(string); ok {
							result[k] = s
						}
					}
					return result
				}
			}
		}
	}
	return nil
}

func buildRuleSummary(rules []domain.PolicyRule) RuleSummary {
	summary := RuleSummary{}
	for _, r := range rules {
		if r.Enabled {
			summary.TotalRulesEnabled++
		}
		switch r.Category {
		case domain.RuleTimeDailyLimit:
			summary.ScreenTimeMinutes = extractIntFromConfig(r.Config, "daily_minutes")
		case domain.RuleTimeScheduledHours:
			var m map[string]any
			if err := json.Unmarshal(r.Config, &m); err == nil {
				if sched, ok := m["schedule"].(map[string]any); ok {
					if weekday, ok := sched["weekday"].(map[string]any); ok {
						if end, ok := weekday["end"].(string); ok && len(end) >= 2 {
							hour := 0
							fmt.Sscanf(end, "%d", &hour)
							summary.BedtimeHour = hour
						}
					}
				}
			}
		case domain.RuleWebFilterLevel:
			var m map[string]any
			if err := json.Unmarshal(r.Config, &m); err == nil {
				if level, ok := m["level"].(string); ok {
					summary.WebFilterLevel = level
				}
			}
		case domain.RuleContentRating:
			var m map[string]any
			if err := json.Unmarshal(r.Config, &m); err == nil {
				if ratings, ok := m["max_ratings"].(map[string]any); ok {
					if mpaa, ok := ratings["mpaa"].(string); ok {
						summary.ContentRating = mpaa
					}
				}
			}
		}
	}
	return summary
}
