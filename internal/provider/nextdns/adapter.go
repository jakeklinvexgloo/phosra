package nextdns

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
)

const baseURL = "https://api.nextdns.io"

type Adapter struct {
	httpClient *http.Client
}

func New() *Adapter {
	return &Adapter{
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
}

func (a *Adapter) Info() provider.PlatformInfo {
	return provider.PlatformInfo{
		ID:          "nextdns",
		Name:        "NextDNS",
		Category:    domain.PlatformCategoryDNS,
		Tier:        domain.ComplianceLevelCompliant,
		Description: "DNS-level content filtering and parental controls",
		AuthType:    "api_key",
		SetupURL:    "https://my.nextdns.io",
		DocsURL:     "https://nextdns.github.io/api/",
	}
}

func (a *Adapter) Capabilities() []provider.Capability {
	return []provider.Capability{
		provider.CapWebFiltering,
		provider.CapSafeSearch,
		provider.CapCustomBlocklist,
		provider.CapCustomAllowlist,
	}
}

func (a *Adapter) ValidateAuth(ctx context.Context, auth provider.AuthConfig) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, baseURL+"/profiles", nil)
	if err != nil {
		return err
	}
	req.Header.Set("X-Api-Key", auth.APIKey)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("nextdns api error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("nextdns auth failed: status %d", resp.StatusCode)
	}
	return nil
}

func (a *Adapter) EnforcePolicy(ctx context.Context, req provider.EnforcementRequest) (*provider.EnforcementResult, error) {
	result := &provider.EnforcementResult{
		Details: make(map[string]any),
	}

	profileID := req.AuthConfig.ExtraParams["profile_id"]
	if profileID == "" {
		return nil, fmt.Errorf("nextdns profile_id required in extra_params")
	}

	for _, rule := range req.Rules {
		if !rule.Enabled {
			result.RulesSkipped++
			continue
		}

		var err error
		switch rule.Category {
		case domain.RuleWebSafeSearch:
			err = a.setSafeSearch(ctx, req.AuthConfig, profileID, rule)
		case domain.RuleWebFilterLevel:
			err = a.setFilterLevel(ctx, req.AuthConfig, profileID, rule)
		case domain.RuleWebCustomBlocklist:
			err = a.setCustomBlocklist(ctx, req.AuthConfig, profileID, rule)
		case domain.RuleWebCustomAllowlist:
			err = a.setCustomAllowlist(ctx, req.AuthConfig, profileID, rule)
		case domain.RuleWebCategoryBlock:
			err = a.setCategoryBlocking(ctx, req.AuthConfig, profileID, rule)
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

func (a *Adapter) setSafeSearch(ctx context.Context, auth provider.AuthConfig, profileID string, rule domain.PolicyRule) error {
	var config struct {
		Enabled bool `json:"enabled"`
	}
	if err := json.Unmarshal(rule.Config, &config); err != nil {
		return err
	}

	body := map[string]any{"safeSearch": config.Enabled}
	return a.patchProfile(ctx, auth, profileID, "/parentalControl", body)
}

func (a *Adapter) setFilterLevel(ctx context.Context, auth provider.AuthConfig, profileID string, rule domain.PolicyRule) error {
	var config struct {
		Level string `json:"level"`
	}
	if err := json.Unmarshal(rule.Config, &config); err != nil {
		return err
	}

	// Map our filter levels to NextDNS categories
	var categories []string
	switch config.Level {
	case "strict":
		categories = []string{"porn", "gambling", "dating", "piracy", "malware", "social-networks", "gaming"}
	case "moderate":
		categories = []string{"porn", "gambling", "dating", "piracy", "malware"}
	case "light":
		categories = []string{"porn", "malware"}
	}

	body := map[string]any{"blockedCategories": categories}
	return a.patchProfile(ctx, auth, profileID, "/parentalControl", body)
}

func (a *Adapter) setCustomBlocklist(ctx context.Context, auth provider.AuthConfig, profileID string, rule domain.PolicyRule) error {
	var config struct {
		Domains []string `json:"domains"`
	}
	if err := json.Unmarshal(rule.Config, &config); err != nil {
		return err
	}

	body := map[string]any{"denylist": config.Domains}
	return a.patchProfile(ctx, auth, profileID, "/denylist", body)
}

func (a *Adapter) setCustomAllowlist(ctx context.Context, auth provider.AuthConfig, profileID string, rule domain.PolicyRule) error {
	var config struct {
		Domains []string `json:"domains"`
	}
	if err := json.Unmarshal(rule.Config, &config); err != nil {
		return err
	}

	body := map[string]any{"allowlist": config.Domains}
	return a.patchProfile(ctx, auth, profileID, "/allowlist", body)
}

func (a *Adapter) setCategoryBlocking(ctx context.Context, auth provider.AuthConfig, profileID string, rule domain.PolicyRule) error {
	var config struct {
		Categories []string `json:"categories"`
	}
	if err := json.Unmarshal(rule.Config, &config); err != nil {
		return err
	}

	body := map[string]any{"blockedCategories": config.Categories}
	return a.patchProfile(ctx, auth, profileID, "/parentalControl", body)
}

func (a *Adapter) patchProfile(ctx context.Context, auth provider.AuthConfig, profileID, path string, body any) error {
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("%s/profiles/%s%s", baseURL, profileID, path)
	req, err := http.NewRequestWithContext(ctx, http.MethodPatch, url, bytes.NewReader(jsonBody))
	if err != nil {
		return err
	}
	req.Header.Set("X-Api-Key", auth.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("nextdns api error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("nextdns error %d: %s", resp.StatusCode, string(respBody))
	}
	return nil
}

func (a *Adapter) GetCurrentConfig(ctx context.Context, auth provider.AuthConfig) (map[string]any, error) {
	profileID := auth.ExtraParams["profile_id"]
	if profileID == "" {
		return nil, fmt.Errorf("nextdns profile_id required")
	}

	url := fmt.Sprintf("%s/profiles/%s", baseURL, profileID)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("X-Api-Key", auth.APIKey)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	return result, nil
}

func (a *Adapter) RevokePolicy(ctx context.Context, auth provider.AuthConfig) error {
	// Reset NextDNS profile to defaults
	profileID := auth.ExtraParams["profile_id"]
	if profileID == "" {
		return nil
	}
	body := map[string]any{
		"safeSearch":        false,
		"blockedCategories": []string{},
	}
	return a.patchProfile(ctx, auth, profileID, "/parentalControl", body)
}

func (a *Adapter) SupportsWebhooks() bool { return false }

func (a *Adapter) RegisterWebhook(ctx context.Context, auth provider.AuthConfig, callbackURL string) error {
	return fmt.Errorf("nextdns does not support webhooks")
}
