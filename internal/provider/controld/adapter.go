package controld

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
)

const baseURL = "https://api.controld.com"

// phosraCategoryToFilter maps Phosra content categories to Control D native filter slugs.
var phosraCategoryToFilter = map[string]string{
	"porn":            "adult_content",
	"adult":           "adult_content",
	"gambling":        "gambling",
	"dating":          "dating",
	"drugs":           "drugs",
	"social-networks": "social",
	"social":          "social",
	"piracy":          "torrents",
	"torrents":        "torrents",
	"malware":         "malware",
	"phishing":        "phishing",
	"crypto":          "crypto",
	"ads":             "ads_trackers",
	"clickbait":       "clickbait",
	"vpn":             "vpn_dns",
	"new_domains":     "new_domains",
}

// filterLevelMap maps Phosra strictness levels to Control D filter slugs.
var filterLevelMap = map[string][]string{
	"strict":   {"adult_content", "gambling", "dating", "drugs", "social", "torrents", "malware", "phishing", "vpn_dns", "new_domains"},
	"moderate": {"adult_content", "gambling", "dating", "malware", "phishing"},
	"light":    {"adult_content", "malware"},
}

// Service slug groups for rule categories that map to Control D service-level blocking.
var socialServices = []string{"snapchat", "discord", "whatsapp", "telegram", "signal", "kik", "facebook_messenger"}
var feedServices = []string{"tiktok", "instagram", "youtube", "reddit", "twitter", "facebook"}
var addictiveServices = []string{"tiktok", "snapchat", "instagram", "youtube", "reddit"}
var dmServices = []string{"whatsapp", "telegram", "discord", "snapchat", "facebook_messenger", "signal"}

// All 15 native filter slugs, used by RevokePolicy.
var allFilters = []string{
	"ads_trackers", "adult_content", "clickbait", "crypto", "dating",
	"drugs", "gambling", "government", "iot_telemetry", "malware",
	"new_domains", "phishing", "social", "torrents", "vpn_dns",
}

// Adapter implements the provider.Adapter interface for Control D.
type Adapter struct {
	httpClient *http.Client
}

// New creates a Control D adapter.
func New() *Adapter {
	return &Adapter{
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
}

func (a *Adapter) Info() provider.PlatformInfo {
	return provider.PlatformInfo{
		ID:          "controld",
		Name:        "Control D",
		Category:    domain.PlatformCategoryDNS,
		Tier:        domain.ComplianceLevelCompliant,
		Description: "Advanced DNS filtering with service-level app blocking, anti-circumvention, and 15 content categories",
		AuthType:    "api_key",
		SetupURL:    "https://controld.com/dashboard",
		DocsURL:     "https://docs.controld.com/reference",
	}
}

func (a *Adapter) Capabilities() []provider.Capability {
	return []provider.Capability{
		provider.CapWebFiltering,
		provider.CapSafeSearch,
		provider.CapCustomBlocklist,
		provider.CapCustomAllowlist,
		provider.CapAppControl,
		provider.CapSocialControl,
		provider.CapPrivacyControl,
		provider.CapActivityMonitor,
	}
}

func (a *Adapter) ValidateAuth(ctx context.Context, auth provider.AuthConfig) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, baseURL+"/profiles", nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+auth.APIKey)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("controld api error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden {
		return fmt.Errorf("controld auth failed: invalid API token")
	}
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("controld auth check failed: status %d", resp.StatusCode)
	}
	return nil
}

func (a *Adapter) EnforcePolicy(ctx context.Context, req provider.EnforcementRequest) (*provider.EnforcementResult, error) {
	result := &provider.EnforcementResult{
		Details: make(map[string]any),
	}

	profileID := req.AuthConfig.ExtraParams["profile_id"]
	if profileID == "" {
		return nil, fmt.Errorf("controld profile_id required in extra_params")
	}

	// Track which filters we've already enabled to avoid duplicate API calls.
	enabledFilters := make(map[string]bool)

	for _, rule := range req.Rules {
		if !rule.Enabled {
			result.RulesSkipped++
			continue
		}

		var err error
		switch rule.Category {
		// Web filtering (same categories as NextDNS)
		case domain.RuleWebSafeSearch:
			err = a.setSafeSearch(ctx, req.AuthConfig, profileID, rule)
		case domain.RuleWebFilterLevel:
			err = a.setFilterLevel(ctx, req.AuthConfig, profileID, rule, enabledFilters)
		case domain.RuleWebCategoryBlock:
			err = a.setCategoryBlocking(ctx, req.AuthConfig, profileID, rule, enabledFilters)
		case domain.RuleWebCustomBlocklist:
			err = a.setCustomBlocklist(ctx, req.AuthConfig, profileID, rule)
		case domain.RuleWebCustomAllowlist:
			err = a.setCustomAllowlist(ctx, req.AuthConfig, profileID, rule)

		// Service-level blocking (Control D unique)
		case domain.RuleSocialContacts:
			err = a.blockServices(ctx, req.AuthConfig, profileID, rule, socialServices)
		case domain.RuleAlgoFeedControl:
			err = a.blockServices(ctx, req.AuthConfig, profileID, rule, feedServices)
		case domain.RuleAddictiveDesignControl:
			err = a.blockServices(ctx, req.AuthConfig, profileID, rule, addictiveServices)
		case domain.RuleDMRestriction:
			err = a.blockServices(ctx, req.AuthConfig, profileID, rule, dmServices)

		// Privacy via filter toggles
		case domain.RulePrivacyDataSharing, domain.RuleTargetedAdBlock:
			err = a.enableFilterOnce(ctx, req.AuthConfig, profileID, "ads_trackers", enabledFilters)
		case domain.RulePrivacyProfileVisibility:
			err = a.enableFilterOnce(ctx, req.AuthConfig, profileID, "iot_telemetry", enabledFilters)

		// Monitoring (read-only, always "applied")
		case domain.RuleMonitoringActivity:
			result.RulesApplied++
			result.Details[string(rule.Category)] = "analytics available via Control D dashboard"
			continue

		default:
			result.RulesSkipped++
			continue
		}

		if err != nil {
			result.RulesFailed++
			result.Details[string(rule.Category)] = map[string]string{"error": err.Error()}
		} else {
			result.RulesApplied++
			result.Details[string(rule.Category)] = "applied"
		}
	}

	return result, nil
}

// setSafeSearch enables/disables safe search and restricted YouTube mode.
func (a *Adapter) setSafeSearch(ctx context.Context, auth provider.AuthConfig, profileID string, rule domain.PolicyRule) error {
	var config struct {
		Enabled bool `json:"enabled"`
	}
	if err := json.Unmarshal(rule.Config, &config); err != nil {
		return err
	}

	status := "0"
	if config.Enabled {
		status = "1"
	}

	path := fmt.Sprintf("/profiles/%s/options/safe_search", profileID)
	if err := a.formPut(ctx, auth, path, url.Values{"status": {status}}); err != nil {
		return err
	}

	// Also toggle restricted YouTube mode to match safe search state.
	ytPath := fmt.Sprintf("/profiles/%s/options/restricted_youtube", profileID)
	_ = a.formPut(ctx, auth, ytPath, url.Values{"status": {status}})

	return nil
}

// setFilterLevel enables a set of native filters based on strictness level.
func (a *Adapter) setFilterLevel(ctx context.Context, auth provider.AuthConfig, profileID string, rule domain.PolicyRule, enabled map[string]bool) error {
	var config struct {
		Level string `json:"level"`
	}
	if err := json.Unmarshal(rule.Config, &config); err != nil {
		return err
	}

	filters, ok := filterLevelMap[config.Level]
	if !ok {
		filters = filterLevelMap["moderate"]
	}

	for _, filter := range filters {
		if err := a.enableFilterOnce(ctx, auth, profileID, filter, enabled); err != nil {
			return fmt.Errorf("filter %s: %w", filter, err)
		}
	}
	return nil
}

// setCategoryBlocking enables individual content category filters.
func (a *Adapter) setCategoryBlocking(ctx context.Context, auth provider.AuthConfig, profileID string, rule domain.PolicyRule, enabled map[string]bool) error {
	var config struct {
		Categories []string `json:"categories"`
	}
	if err := json.Unmarshal(rule.Config, &config); err != nil {
		return err
	}

	for _, cat := range config.Categories {
		filter, ok := phosraCategoryToFilter[cat]
		if !ok {
			continue
		}
		if err := a.enableFilterOnce(ctx, auth, profileID, filter, enabled); err != nil {
			return fmt.Errorf("category %s: %w", cat, err)
		}
	}
	return nil
}

// setCustomBlocklist creates custom domain block rules (do=0).
func (a *Adapter) setCustomBlocklist(ctx context.Context, auth provider.AuthConfig, profileID string, rule domain.PolicyRule) error {
	var config struct {
		Domains []string `json:"domains"`
	}
	if err := json.Unmarshal(rule.Config, &config); err != nil {
		return err
	}
	if len(config.Domains) == 0 {
		return nil
	}
	return a.setCustomRules(ctx, auth, profileID, config.Domains, "0")
}

// setCustomAllowlist creates custom domain bypass rules (do=1).
func (a *Adapter) setCustomAllowlist(ctx context.Context, auth provider.AuthConfig, profileID string, rule domain.PolicyRule) error {
	var config struct {
		Domains []string `json:"domains"`
	}
	if err := json.Unmarshal(rule.Config, &config); err != nil {
		return err
	}
	if len(config.Domains) == 0 {
		return nil
	}
	return a.setCustomRules(ctx, auth, profileID, config.Domains, "1")
}

// setCustomRules creates custom domain rules with the given action (0=block, 1=bypass).
func (a *Adapter) setCustomRules(ctx context.Context, auth provider.AuthConfig, profileID string, domains []string, action string) error {
	path := fmt.Sprintf("/profiles/%s/rules", profileID)
	data := url.Values{"do": {action}}
	for _, d := range domains {
		data.Add("hostnames[]", d)
	}
	return a.formPost(ctx, auth, path, data)
}

// blockServices blocks a set of services by slug.
func (a *Adapter) blockServices(ctx context.Context, auth provider.AuthConfig, profileID string, rule domain.PolicyRule, defaultServices []string) error {
	var config struct {
		Services []string `json:"services"`
	}
	// If config specifies services, use those; otherwise use defaults.
	if err := json.Unmarshal(rule.Config, &config); err != nil || len(config.Services) == 0 {
		config.Services = defaultServices
	}

	for _, svc := range config.Services {
		path := fmt.Sprintf("/profiles/%s/services/%s", profileID, svc)
		if err := a.formPut(ctx, auth, path, url.Values{"status": {"1"}}); err != nil {
			return fmt.Errorf("service %s: %w", svc, err)
		}
	}
	return nil
}

// enableFilterOnce enables a native filter, skipping if already enabled in this enforcement run.
func (a *Adapter) enableFilterOnce(ctx context.Context, auth provider.AuthConfig, profileID, filter string, enabled map[string]bool) error {
	if enabled[filter] {
		return nil
	}
	path := fmt.Sprintf("/profiles/%s/filters/%s", profileID, filter)
	if err := a.formPut(ctx, auth, path, url.Values{"status": {"1"}}); err != nil {
		return err
	}
	enabled[filter] = true
	return nil
}

func (a *Adapter) GetCurrentConfig(ctx context.Context, auth provider.AuthConfig) (map[string]any, error) {
	profileID := auth.ExtraParams["profile_id"]
	if profileID == "" {
		return nil, fmt.Errorf("controld profile_id required")
	}

	profile, err := a.apiGet(ctx, auth, fmt.Sprintf("/profiles/%s", profileID))
	if err != nil {
		return nil, err
	}

	filters, _ := a.apiGet(ctx, auth, fmt.Sprintf("/profiles/%s/filters", profileID))
	profile["filters"] = filters

	return profile, nil
}

func (a *Adapter) RevokePolicy(ctx context.Context, auth provider.AuthConfig) error {
	profileID := auth.ExtraParams["profile_id"]
	if profileID == "" {
		return nil
	}

	// Disable all 15 native filters.
	for _, filter := range allFilters {
		path := fmt.Sprintf("/profiles/%s/filters/%s", profileID, filter)
		_ = a.formPut(ctx, auth, path, url.Values{"status": {"0"}})
	}

	// Disable safe search and restricted YouTube.
	_ = a.formPut(ctx, auth, fmt.Sprintf("/profiles/%s/options/safe_search", profileID), url.Values{"status": {"0"}})
	_ = a.formPut(ctx, auth, fmt.Sprintf("/profiles/%s/options/restricted_youtube", profileID), url.Values{"status": {"0"}})

	return nil
}

func (a *Adapter) SupportsWebhooks() bool { return false }

func (a *Adapter) RegisterWebhook(ctx context.Context, auth provider.AuthConfig, callbackURL string) error {
	return fmt.Errorf("controld does not support webhooks")
}

// --- HTTP helpers ---

// controlDResponse wraps the standard Control D API response format.
type controlDResponse struct {
	Body    json.RawMessage `json:"body"`
	Success bool            `json:"success"`
	Message string          `json:"message"`
}

// formPut sends a PUT request with form-urlencoded body.
func (a *Adapter) formPut(ctx context.Context, auth provider.AuthConfig, path string, data url.Values) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, baseURL+path, strings.NewReader(data.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+auth.APIKey)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("controld api error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("controld error %d: %s", resp.StatusCode, string(respBody))
	}

	var apiResp controlDResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
		return nil // Non-JSON 2xx is fine
	}
	if !apiResp.Success {
		return fmt.Errorf("controld api: %s", apiResp.Message)
	}
	return nil
}

// formPost sends a POST request with form-urlencoded body.
func (a *Adapter) formPost(ctx context.Context, auth provider.AuthConfig, path string, data url.Values) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, baseURL+path, strings.NewReader(data.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+auth.APIKey)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("controld api error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("controld error %d: %s", resp.StatusCode, string(respBody))
	}
	return nil
}

// apiGet sends a GET request and returns the parsed body object.
func (a *Adapter) apiGet(ctx context.Context, auth provider.AuthConfig, path string) (map[string]any, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, baseURL+path, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+auth.APIKey)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("controld api error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("controld error %d: %s", resp.StatusCode, string(respBody))
	}

	var apiResp struct {
		Body    map[string]any `json:"body"`
		Success bool           `json:"success"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
		return nil, fmt.Errorf("controld response parse error: %w", err)
	}
	return apiResp.Body, nil
}
