package qustodio

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/source"
)

// TODO: verify Qustodio API endpoint
const baseURL = "https://api.qustodio.com/v1"

// Adapter implements source.SourceAdapter for Qustodio.
type Adapter struct {
	httpClient *http.Client
}

// NewAdapter creates a new Qustodio source adapter.
func NewAdapter() *Adapter {
	return &Adapter{
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
}

func (a *Adapter) Info() source.SourceInfo {
	return source.SourceInfo{
		Slug:        "qustodio",
		DisplayName: "Qustodio",
		APITier:     "managed",
		AuthType:    "api_key",
		Website:     "https://www.qustodio.com",
		Description: "Comprehensive cross-platform parental control with web filtering, screen time management, app controls, and activity reports",
	}
}

func (a *Adapter) Capabilities() []source.SourceCapability {
	return []source.SourceCapability{
		{Category: domain.RuleTimeDailyLimit, SupportLevel: "full", ReadWrite: "bidirectional", Notes: "Daily screen time limits per device"},
		{Category: domain.RuleTimeScheduledHours, SupportLevel: "full", ReadWrite: "bidirectional", Notes: "Scheduled access hours"},
		{Category: domain.RuleTimePerAppLimit, SupportLevel: "full", ReadWrite: "push_only", Notes: "Per-app time limits"},
		{Category: domain.RuleTimeDowntime, SupportLevel: "full", ReadWrite: "push_only", Notes: "Device downtime / lock"},
		{Category: domain.RuleWebFilterLevel, SupportLevel: "full", ReadWrite: "bidirectional", Notes: "Web filtering with 30+ content categories"},
		{Category: domain.RuleWebCategoryBlock, SupportLevel: "full", ReadWrite: "bidirectional", Notes: "Block specific web categories"},
		{Category: domain.RuleWebSafeSearch, SupportLevel: "full", ReadWrite: "push_only", Notes: "Enforce safe search on major search engines"},
		{Category: domain.RuleMonitoringActivity, SupportLevel: "full", ReadWrite: "pull_only", Notes: "Detailed activity reports"},
		{Category: domain.RuleMonitoringAlerts, SupportLevel: "full", ReadWrite: "push_only", Notes: "Real-time alert configuration"},
		{Category: domain.RuleContentRating, SupportLevel: "full", ReadWrite: "push_only", Notes: "Content rating enforcement"},
		{Category: domain.RulePurchaseApproval, SupportLevel: "partial", ReadWrite: "push_only", Notes: "Purchase approval via app blocking"},
		{Category: domain.RuleSocialMediaMinAge, SupportLevel: "full", ReadWrite: "push_only", Notes: "Social media monitoring and blocking"},
	}
}

func (a *Adapter) ValidateCredentials(ctx context.Context, auth map[string]interface{}) error {
	apiKey, ok := auth["api_key"].(string)
	if !ok || apiKey == "" {
		return fmt.Errorf("qustodio: api_key is required")
	}

	// TODO: verify Qustodio API endpoint
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, baseURL+"/account/profile", nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("qustodio api error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("qustodio auth failed: status %d", resp.StatusCode)
	}
	return nil
}

func (a *Adapter) SyncRules(ctx context.Context, req source.SyncRequest) (*source.SyncResult, error) {
	apiKey, ok := req.AuthConfig["api_key"].(string)
	if !ok || apiKey == "" {
		return nil, fmt.Errorf("qustodio: api_key is required in auth_config")
	}

	profileID, _ := req.AuthConfig["profile_id"].(string)
	if profileID == "" {
		return nil, fmt.Errorf("qustodio: profile_id is required in auth_config")
	}

	result := &source.SyncResult{}

	for _, rule := range req.Rules {
		if !rule.Enabled {
			result.RulesSkipped++
			result.Results = append(result.Results, source.SyncRuleResult{
				Category: rule.Category,
				Status:   "skipped",
			})
			continue
		}

		endpoint, body, err := a.mapRuleToQustodio(profileID, rule)
		if err != nil {
			result.RulesSkipped++
			result.Results = append(result.Results, source.SyncRuleResult{
				Category:     rule.Category,
				Status:       "unsupported",
				ErrorMessage: err.Error(),
			})
			continue
		}

		resp, pushErr := a.pushToAPI(ctx, apiKey, endpoint, body)
		if pushErr != nil {
			result.RulesFailed++
			result.Results = append(result.Results, source.SyncRuleResult{
				Category:     rule.Category,
				Status:       "failed",
				ErrorMessage: pushErr.Error(),
			})
			continue
		}

		result.RulesPushed++
		result.Results = append(result.Results, source.SyncRuleResult{
			Category:       rule.Category,
			Status:         "pushed",
			SourceValue:    body,
			SourceResponse: resp,
		})
	}

	result.Message = fmt.Sprintf("Qustodio sync: %d pushed, %d skipped, %d failed",
		result.RulesPushed, result.RulesSkipped, result.RulesFailed)
	return result, nil
}

func (a *Adapter) PushRule(ctx context.Context, auth map[string]interface{}, category domain.RuleCategory, value interface{}) (*source.SyncRuleResult, error) {
	apiKey, ok := auth["api_key"].(string)
	if !ok || apiKey == "" {
		return nil, fmt.Errorf("qustodio: api_key is required")
	}

	profileID, _ := auth["profile_id"].(string)
	if profileID == "" {
		return nil, fmt.Errorf("qustodio: profile_id is required")
	}

	// Build a synthetic PolicyRule from the category and value
	configBytes, err := json.Marshal(value)
	if err != nil {
		return nil, fmt.Errorf("qustodio: failed to marshal value: %w", err)
	}

	rule := domain.PolicyRule{
		Category: category,
		Enabled:  true,
		Config:   configBytes,
	}

	endpoint, body, err := a.mapRuleToQustodio(profileID, rule)
	if err != nil {
		return &source.SyncRuleResult{
			Category:     category,
			Status:       "unsupported",
			ErrorMessage: err.Error(),
		}, nil
	}

	resp, pushErr := a.pushToAPI(ctx, apiKey, endpoint, body)
	if pushErr != nil {
		return &source.SyncRuleResult{
			Category:     category,
			Status:       "failed",
			ErrorMessage: pushErr.Error(),
		}, nil
	}

	return &source.SyncRuleResult{
		Category:       category,
		Status:         "pushed",
		SourceValue:    body,
		SourceResponse: resp,
	}, nil
}

func (a *Adapter) PullCurrentState(ctx context.Context, auth map[string]interface{}) (*source.PullResult, error) {
	apiKey, ok := auth["api_key"].(string)
	if !ok || apiKey == "" {
		return nil, fmt.Errorf("qustodio: api_key is required")
	}

	profileID, _ := auth["profile_id"].(string)
	if profileID == "" {
		return nil, fmt.Errorf("qustodio: profile_id is required")
	}

	// TODO: verify Qustodio API endpoint
	url := fmt.Sprintf("%s/profiles/%s/rules", baseURL, profileID)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("qustodio api error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("qustodio error %d: %s", resp.StatusCode, string(body))
	}

	var apiRules map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&apiRules); err != nil {
		return nil, fmt.Errorf("qustodio: failed to decode response: %w", err)
	}

	pulled := a.mapQustodioToRules(apiRules)
	return &source.PullResult{
		Rules:   pulled,
		Message: fmt.Sprintf("Pulled %d rules from Qustodio profile %s", len(pulled), profileID),
	}, nil
}

func (a *Adapter) GetGuidedSteps(_ context.Context, category string) ([]source.GuidedStep, error) {
	return nil, fmt.Errorf("qustodio is a managed source; use SyncRules or PushRule instead")
}

func (a *Adapter) SupportsInboundWebhooks() bool { return true }

func (a *Adapter) RegisterInboundWebhook(ctx context.Context, auth map[string]interface{}, callbackURL string) error {
	apiKey, ok := auth["api_key"].(string)
	if !ok || apiKey == "" {
		return fmt.Errorf("qustodio: api_key is required")
	}

	// TODO: verify Qustodio API endpoint
	body := map[string]interface{}{
		"callback_url": callbackURL,
		"events":       []string{"rule_changed", "alert_triggered", "activity_report"},
	}

	_, err := a.pushToAPI(ctx, apiKey, baseURL+"/webhooks", body)
	return err
}

// mapRuleToQustodio translates a Phosra PolicyRule into a Qustodio API endpoint and request body.
func (a *Adapter) mapRuleToQustodio(profileID string, rule domain.PolicyRule) (string, map[string]interface{}, error) {
	profileBase := fmt.Sprintf("%s/profiles/%s", baseURL, profileID)

	var config map[string]interface{}
	if rule.Config != nil {
		if err := json.Unmarshal(rule.Config, &config); err != nil {
			config = make(map[string]interface{})
		}
	}

	switch rule.Category {
	case domain.RuleTimeDailyLimit:
		// TODO: verify Qustodio API endpoint
		minutes := 120 // default 2 hours
		if m, ok := config["daily_minutes"].(float64); ok {
			minutes = int(m)
		}
		return profileBase + "/time-limits", map[string]interface{}{
			"daily_limit_minutes": minutes,
			"enabled":             true,
		}, nil

	case domain.RuleTimeScheduledHours:
		// TODO: verify Qustodio API endpoint
		schedule := config["schedule"]
		return profileBase + "/time-schedule", map[string]interface{}{
			"schedule": schedule,
			"enabled":  true,
		}, nil

	case domain.RuleTimePerAppLimit:
		// TODO: verify Qustodio API endpoint
		return profileBase + "/app-limits", map[string]interface{}{
			"limits":  config,
			"enabled": true,
		}, nil

	case domain.RuleTimeDowntime:
		// TODO: verify Qustodio API endpoint
		return profileBase + "/device-lock", map[string]interface{}{
			"locked": true,
		}, nil

	case domain.RuleWebFilterLevel:
		// TODO: verify Qustodio API endpoint
		level := "moderate"
		if l, ok := config["level"].(string); ok {
			level = l
		}
		return profileBase + "/web-filtering", map[string]interface{}{
			"filter_level": mapFilterLevel(level),
			"enabled":      true,
		}, nil

	case domain.RuleWebCategoryBlock:
		// TODO: verify Qustodio API endpoint
		categories := config["categories"]
		return profileBase + "/web-filtering/categories", map[string]interface{}{
			"blocked_categories": categories,
		}, nil

	case domain.RuleWebSafeSearch:
		// TODO: verify Qustodio API endpoint
		return profileBase + "/web-filtering/safesearch", map[string]interface{}{
			"enabled": true,
		}, nil

	case domain.RuleMonitoringAlerts:
		// TODO: verify Qustodio API endpoint
		return profileBase + "/alerts", map[string]interface{}{
			"enabled": true,
			"types":   []string{"web", "app", "search", "social"},
		}, nil

	case domain.RuleContentRating:
		// TODO: verify Qustodio API endpoint
		return profileBase + "/content-restrictions", map[string]interface{}{
			"ratings": config["max_ratings"],
			"enabled": true,
		}, nil

	case domain.RuleSocialMediaMinAge:
		// TODO: verify Qustodio API endpoint
		return profileBase + "/social-monitoring", map[string]interface{}{
			"enabled":  true,
			"networks": []string{"facebook", "instagram", "tiktok", "snapchat", "twitter"},
		}, nil

	default:
		return "", nil, fmt.Errorf("qustodio: unsupported rule category %q", rule.Category)
	}
}

// mapFilterLevel converts Phosra filter levels to Qustodio equivalents.
func mapFilterLevel(level string) string {
	// TODO: verify Qustodio API endpoint — confirm filter level values
	switch level {
	case "strict":
		return "high"
	case "moderate":
		return "medium"
	case "light":
		return "low"
	default:
		return "medium"
	}
}

// mapQustodioToRules converts a Qustodio API response into Phosra PulledRules.
func (a *Adapter) mapQustodioToRules(apiRules map[string]interface{}) []source.PulledRule {
	var rules []source.PulledRule

	if timeLimit, ok := apiRules["time_limits"].(map[string]interface{}); ok {
		enabled, _ := timeLimit["enabled"].(bool)
		rules = append(rules, source.PulledRule{
			Category: domain.RuleTimeDailyLimit,
			Enabled:  enabled,
			Value:    timeLimit,
		})
	}

	if webFilter, ok := apiRules["web_filtering"].(map[string]interface{}); ok {
		enabled, _ := webFilter["enabled"].(bool)
		rules = append(rules, source.PulledRule{
			Category: domain.RuleWebFilterLevel,
			Enabled:  enabled,
			Value:    webFilter,
		})
	}

	if safeSearch, ok := apiRules["safesearch"].(map[string]interface{}); ok {
		enabled, _ := safeSearch["enabled"].(bool)
		rules = append(rules, source.PulledRule{
			Category: domain.RuleWebSafeSearch,
			Enabled:  enabled,
			Value:    safeSearch,
		})
	}

	if schedule, ok := apiRules["time_schedule"].(map[string]interface{}); ok {
		enabled, _ := schedule["enabled"].(bool)
		rules = append(rules, source.PulledRule{
			Category: domain.RuleTimeScheduledHours,
			Enabled:  enabled,
			Value:    schedule,
		})
	}

	if alerts, ok := apiRules["alerts"].(map[string]interface{}); ok {
		enabled, _ := alerts["enabled"].(bool)
		rules = append(rules, source.PulledRule{
			Category: domain.RuleMonitoringAlerts,
			Enabled:  enabled,
			Value:    alerts,
		})
	}

	return rules
}

// pushToAPI sends a JSON request to the Qustodio API and returns the parsed response.
func (a *Adapter) pushToAPI(ctx context.Context, apiKey, url string, body map[string]interface{}) (map[string]interface{}, error) {
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, bytes.NewReader(jsonBody))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("qustodio api error: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("qustodio: failed to read response: %w", err)
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("qustodio error %d: %s", resp.StatusCode, string(respBody))
	}

	var result map[string]interface{}
	if len(respBody) > 0 {
		if err := json.Unmarshal(respBody, &result); err != nil {
			// Non-JSON response is acceptable for some endpoints
			result = map[string]interface{}{"raw": string(respBody)}
		}
	}
	return result, nil
}
