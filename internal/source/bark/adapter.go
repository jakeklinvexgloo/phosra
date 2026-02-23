package bark

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

// TODO: verify Bark API endpoint
const baseURL = "https://api.bark.us/v1"

// Adapter implements source.SourceAdapter for Bark.
type Adapter struct {
	httpClient *http.Client
}

// NewAdapter creates a new Bark source adapter.
func NewAdapter() *Adapter {
	return &Adapter{
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
}

func (a *Adapter) Info() source.SourceInfo {
	return source.SourceInfo{
		Slug:        "bark",
		DisplayName: "Bark",
		APITier:     "managed",
		AuthType:    "api_key",
		Website:     "https://www.bark.us",
		Description: "AI-powered monitoring with content scanning, web filtering, screen time, and location tracking across 30+ social media platforms",
	}
}

func (a *Adapter) Capabilities() []source.SourceCapability {
	return []source.SourceCapability{
		{Category: domain.RuleMonitoringActivity, SupportLevel: "full", ReadWrite: "pull_only", Notes: "AI-powered activity monitoring across 30+ platforms"},
		{Category: domain.RuleMonitoringAlerts, SupportLevel: "full", ReadWrite: "bidirectional", Notes: "Smart alerts for cyberbullying, depression, predators"},
		{Category: domain.RuleWebFilterLevel, SupportLevel: "full", ReadWrite: "bidirectional", Notes: "Web filtering with category controls"},
		{Category: domain.RuleWebCategoryBlock, SupportLevel: "full", ReadWrite: "push_only", Notes: "Category-based web blocking"},
		{Category: domain.RuleWebSafeSearch, SupportLevel: "full", ReadWrite: "push_only", Notes: "Safe search enforcement"},
		{Category: domain.RuleTimeScheduledHours, SupportLevel: "full", ReadWrite: "bidirectional", Notes: "Screen time scheduling"},
		{Category: domain.RuleTimeDailyLimit, SupportLevel: "full", ReadWrite: "bidirectional", Notes: "Daily screen time limits"},
		{Category: domain.RuleSocialChatControl, SupportLevel: "full", ReadWrite: "pull_only", Notes: "Chat and messaging monitoring"},
		{Category: domain.RuleSocialMediaMinAge, SupportLevel: "full", ReadWrite: "push_only", Notes: "Social media age-gating"},
		{Category: domain.RuleDMRestriction, SupportLevel: "full", ReadWrite: "push_only", Notes: "Direct message restriction"},
		{Category: domain.RuleContentRating, SupportLevel: "full", ReadWrite: "push_only", Notes: "Content rating enforcement"},
		{Category: domain.RuleNotificationCurfew, SupportLevel: "full", ReadWrite: "push_only", Notes: "Notification curfew during set hours"},
		{Category: domain.RulePrivacyLocation, SupportLevel: "full", ReadWrite: "pull_only", Notes: "Location tracking and check-ins"},
	}
}

func (a *Adapter) ValidateCredentials(ctx context.Context, auth map[string]interface{}) error {
	apiKey, ok := auth["api_key"].(string)
	if !ok || apiKey == "" {
		return fmt.Errorf("bark: api_key is required")
	}

	// TODO: verify Bark API endpoint
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, baseURL+"/account", nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("bark api error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bark auth failed: status %d", resp.StatusCode)
	}
	return nil
}

func (a *Adapter) SyncRules(ctx context.Context, req source.SyncRequest) (*source.SyncResult, error) {
	apiKey, ok := req.AuthConfig["api_key"].(string)
	if !ok || apiKey == "" {
		return nil, fmt.Errorf("bark: api_key is required in auth_config")
	}

	childID, _ := req.AuthConfig["child_id"].(string)
	if childID == "" {
		return nil, fmt.Errorf("bark: child_id is required in auth_config")
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

		endpoint, body, err := a.mapRuleToBark(childID, rule)
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

	result.Message = fmt.Sprintf("Bark sync: %d pushed, %d skipped, %d failed",
		result.RulesPushed, result.RulesSkipped, result.RulesFailed)
	return result, nil
}

func (a *Adapter) PushRule(ctx context.Context, auth map[string]interface{}, category domain.RuleCategory, value interface{}) (*source.SyncRuleResult, error) {
	apiKey, ok := auth["api_key"].(string)
	if !ok || apiKey == "" {
		return nil, fmt.Errorf("bark: api_key is required")
	}

	childID, _ := auth["child_id"].(string)
	if childID == "" {
		return nil, fmt.Errorf("bark: child_id is required")
	}

	configBytes, err := json.Marshal(value)
	if err != nil {
		return nil, fmt.Errorf("bark: failed to marshal value: %w", err)
	}

	rule := domain.PolicyRule{
		Category: category,
		Enabled:  true,
		Config:   configBytes,
	}

	endpoint, body, err := a.mapRuleToBark(childID, rule)
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
		return nil, fmt.Errorf("bark: api_key is required")
	}

	childID, _ := auth["child_id"].(string)
	if childID == "" {
		return nil, fmt.Errorf("bark: child_id is required")
	}

	// TODO: verify Bark API endpoint
	url := fmt.Sprintf("%s/children/%s/rules", baseURL, childID)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("bark api error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("bark error %d: %s", resp.StatusCode, string(body))
	}

	var apiRules map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&apiRules); err != nil {
		return nil, fmt.Errorf("bark: failed to decode response: %w", err)
	}

	pulled := a.mapBarkToRules(apiRules)
	return &source.PullResult{
		Rules:   pulled,
		Message: fmt.Sprintf("Pulled %d rules from Bark child %s", len(pulled), childID),
	}, nil
}

func (a *Adapter) GetGuidedSteps(_ context.Context, category string) ([]source.GuidedStep, error) {
	return nil, fmt.Errorf("bark is a managed source; use SyncRules or PushRule instead")
}

func (a *Adapter) SupportsInboundWebhooks() bool { return true }

func (a *Adapter) RegisterInboundWebhook(ctx context.Context, auth map[string]interface{}, callbackURL string) error {
	apiKey, ok := auth["api_key"].(string)
	if !ok || apiKey == "" {
		return fmt.Errorf("bark: api_key is required")
	}

	// TODO: verify Bark API endpoint
	body := map[string]interface{}{
		"callback_url": callbackURL,
		"events":       []string{"alert", "rule_change", "screen_time_update", "location_update"},
	}

	_, err := a.pushToAPI(ctx, apiKey, baseURL+"/webhooks", body)
	return err
}

// mapRuleToBark translates a Phosra PolicyRule into a Bark API endpoint and request body.
func (a *Adapter) mapRuleToBark(childID string, rule domain.PolicyRule) (string, map[string]interface{}, error) {
	childBase := fmt.Sprintf("%s/children/%s", baseURL, childID)

	var config map[string]interface{}
	if rule.Config != nil {
		if err := json.Unmarshal(rule.Config, &config); err != nil {
			config = make(map[string]interface{})
		}
	}

	switch rule.Category {
	case domain.RuleWebFilterLevel:
		// TODO: verify Bark API endpoint
		level := "moderate"
		if l, ok := config["level"].(string); ok {
			level = l
		}
		return childBase + "/web-filtering", map[string]interface{}{
			"filter_level": mapFilterLevel(level),
			"enabled":      true,
		}, nil

	case domain.RuleWebCategoryBlock:
		// TODO: verify Bark API endpoint
		categories := config["categories"]
		return childBase + "/web-filtering/categories", map[string]interface{}{
			"blocked_categories": categories,
		}, nil

	case domain.RuleWebSafeSearch:
		// TODO: verify Bark API endpoint
		return childBase + "/web-filtering/safesearch", map[string]interface{}{
			"enabled": true,
		}, nil

	case domain.RuleTimeScheduledHours:
		// TODO: verify Bark API endpoint
		schedule := config["schedule"]
		return childBase + "/screen-time/schedule", map[string]interface{}{
			"schedule": schedule,
			"enabled":  true,
		}, nil

	case domain.RuleTimeDailyLimit:
		// TODO: verify Bark API endpoint
		minutes := 120
		if m, ok := config["daily_minutes"].(float64); ok {
			minutes = int(m)
		}
		return childBase + "/screen-time/daily-limit", map[string]interface{}{
			"daily_limit_minutes": minutes,
			"enabled":             true,
		}, nil

	case domain.RuleMonitoringAlerts:
		// TODO: verify Bark API endpoint
		return childBase + "/monitoring/alerts", map[string]interface{}{
			"enabled":    true,
			"categories": []string{"cyberbullying", "depression", "suicidal_ideation", "predators", "explicit_content", "violence"},
		}, nil

	case domain.RuleSocialMediaMinAge:
		// TODO: verify Bark API endpoint
		return childBase + "/social-media", map[string]interface{}{
			"enabled":   true,
			"platforms": []string{"instagram", "tiktok", "snapchat", "facebook", "twitter", "discord"},
			"action":    "block",
		}, nil

	case domain.RuleDMRestriction:
		// TODO: verify Bark API endpoint
		mode := "contacts_only"
		if m, ok := config["mode"].(string); ok {
			mode = m
		}
		return childBase + "/messaging/restrictions", map[string]interface{}{
			"mode":    mode,
			"enabled": true,
		}, nil

	case domain.RuleContentRating:
		// TODO: verify Bark API endpoint
		return childBase + "/content-restrictions", map[string]interface{}{
			"ratings": config["max_ratings"],
			"enabled": true,
		}, nil

	case domain.RuleNotificationCurfew:
		// TODO: verify Bark API endpoint
		start, _ := config["start"].(string)
		end, _ := config["end"].(string)
		if start == "" {
			start = "21:00"
		}
		if end == "" {
			end = "07:00"
		}
		return childBase + "/screen-time/notification-curfew", map[string]interface{}{
			"enabled":    true,
			"start_time": start,
			"end_time":   end,
		}, nil

	case domain.RuleSocialChatControl:
		// TODO: verify Bark API endpoint
		return childBase + "/monitoring/chat", map[string]interface{}{
			"enabled":   true,
			"platforms": []string{"sms", "imessage", "whatsapp", "messenger", "discord", "snapchat"},
		}, nil

	default:
		return "", nil, fmt.Errorf("bark: unsupported rule category %q", rule.Category)
	}
}

// mapFilterLevel converts Phosra filter levels to Bark equivalents.
func mapFilterLevel(level string) string {
	// TODO: verify Bark API endpoint — confirm filter level values
	switch level {
	case "strict":
		return "strict"
	case "moderate":
		return "moderate"
	case "light":
		return "light"
	default:
		return "moderate"
	}
}

// mapBarkToRules converts a Bark API response into Phosra PulledRules.
func (a *Adapter) mapBarkToRules(apiRules map[string]interface{}) []source.PulledRule {
	var rules []source.PulledRule

	if webFilter, ok := apiRules["web_filtering"].(map[string]interface{}); ok {
		enabled, _ := webFilter["enabled"].(bool)
		rules = append(rules, source.PulledRule{
			Category: domain.RuleWebFilterLevel,
			Enabled:  enabled,
			Value:    webFilter,
		})
	}

	if screenTime, ok := apiRules["screen_time"].(map[string]interface{}); ok {
		if schedule, ok := screenTime["schedule"].(map[string]interface{}); ok {
			enabled, _ := schedule["enabled"].(bool)
			rules = append(rules, source.PulledRule{
				Category: domain.RuleTimeScheduledHours,
				Enabled:  enabled,
				Value:    schedule,
			})
		}
		if dailyLimit, ok := screenTime["daily_limit"].(map[string]interface{}); ok {
			enabled, _ := dailyLimit["enabled"].(bool)
			rules = append(rules, source.PulledRule{
				Category: domain.RuleTimeDailyLimit,
				Enabled:  enabled,
				Value:    dailyLimit,
			})
		}
	}

	if monitoring, ok := apiRules["monitoring"].(map[string]interface{}); ok {
		if alerts, ok := monitoring["alerts"].(map[string]interface{}); ok {
			enabled, _ := alerts["enabled"].(bool)
			rules = append(rules, source.PulledRule{
				Category: domain.RuleMonitoringAlerts,
				Enabled:  enabled,
				Value:    alerts,
			})
		}
	}

	if social, ok := apiRules["social_media"].(map[string]interface{}); ok {
		enabled, _ := social["enabled"].(bool)
		rules = append(rules, source.PulledRule{
			Category: domain.RuleSocialMediaMinAge,
			Enabled:  enabled,
			Value:    social,
		})
	}

	return rules
}

// pushToAPI sends a JSON request to the Bark API and returns the parsed response.
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
		return nil, fmt.Errorf("bark api error: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("bark: failed to read response: %w", err)
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("bark error %d: %s", resp.StatusCode, string(respBody))
	}

	var result map[string]interface{}
	if len(respBody) > 0 {
		if err := json.Unmarshal(respBody, &result); err != nil {
			result = map[string]interface{}{"raw": string(respBody)}
		}
	}
	return result, nil
}
