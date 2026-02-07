package cleanbrowsing

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

const baseURL = "https://my.cleanbrowsing.org/api/v1"

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
		ID:          "cleanbrowsing",
		Name:        "CleanBrowsing",
		Category:    domain.PlatformCategoryDNS,
		Tier:        domain.ComplianceLevelCompliant,
		Description: "DNS-based content filtering service",
		AuthType:    "api_key",
		SetupURL:    "https://my.cleanbrowsing.org",
		DocsURL:     "https://cleanbrowsing.org/help/docs/api/",
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
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, baseURL+"/status", nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+auth.APIKey)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("cleanbrowsing api error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("cleanbrowsing auth failed: status %d", resp.StatusCode)
	}
	return nil
}

func (a *Adapter) EnforcePolicy(ctx context.Context, req provider.EnforcementRequest) (*provider.EnforcementResult, error) {
	result := &provider.EnforcementResult{
		Details: make(map[string]any),
	}

	for _, rule := range req.Rules {
		if !rule.Enabled {
			result.RulesSkipped++
			continue
		}

		var err error
		switch rule.Category {
		case domain.RuleWebSafeSearch:
			err = a.setSafeSearch(ctx, req.AuthConfig, rule)
		case domain.RuleWebFilterLevel:
			err = a.setFilterLevel(ctx, req.AuthConfig, rule)
		case domain.RuleWebCustomBlocklist:
			err = a.setBlocklist(ctx, req.AuthConfig, rule)
		case domain.RuleWebCustomAllowlist:
			err = a.setAllowlist(ctx, req.AuthConfig, rule)
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

func (a *Adapter) setSafeSearch(ctx context.Context, auth provider.AuthConfig, rule domain.PolicyRule) error {
	var config struct {
		Enabled bool `json:"enabled"`
	}
	if err := json.Unmarshal(rule.Config, &config); err != nil {
		return err
	}
	return a.apiPost(ctx, auth, "/settings/safesearch", map[string]any{"enabled": config.Enabled})
}

func (a *Adapter) setFilterLevel(ctx context.Context, auth provider.AuthConfig, rule domain.PolicyRule) error {
	var config struct {
		Level string `json:"level"`
	}
	if err := json.Unmarshal(rule.Config, &config); err != nil {
		return err
	}
	// Map to CleanBrowsing filter types
	filterMap := map[string]string{
		"strict":   "family",
		"moderate": "adult",
		"light":    "security",
	}
	filterType := filterMap[config.Level]
	if filterType == "" {
		filterType = "adult"
	}
	return a.apiPost(ctx, auth, "/settings/filter", map[string]any{"type": filterType})
}

func (a *Adapter) setBlocklist(ctx context.Context, auth provider.AuthConfig, rule domain.PolicyRule) error {
	var config struct {
		Domains []string `json:"domains"`
	}
	if err := json.Unmarshal(rule.Config, &config); err != nil {
		return err
	}
	return a.apiPost(ctx, auth, "/blocklist", map[string]any{"domains": config.Domains})
}

func (a *Adapter) setAllowlist(ctx context.Context, auth provider.AuthConfig, rule domain.PolicyRule) error {
	var config struct {
		Domains []string `json:"domains"`
	}
	if err := json.Unmarshal(rule.Config, &config); err != nil {
		return err
	}
	return a.apiPost(ctx, auth, "/allowlist", map[string]any{"domains": config.Domains})
}

func (a *Adapter) apiPost(ctx context.Context, auth provider.AuthConfig, path string, body any) error {
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, baseURL+path, bytes.NewReader(jsonBody))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+auth.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("cleanbrowsing error %d: %s", resp.StatusCode, string(respBody))
	}
	return nil
}

func (a *Adapter) GetCurrentConfig(ctx context.Context, auth provider.AuthConfig) (map[string]any, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, baseURL+"/settings", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+auth.APIKey)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result map[string]any
	json.NewDecoder(resp.Body).Decode(&result)
	return result, nil
}

func (a *Adapter) RevokePolicy(ctx context.Context, auth provider.AuthConfig) error {
	return a.apiPost(ctx, auth, "/settings/reset", map[string]any{})
}

func (a *Adapter) SupportsWebhooks() bool { return false }

func (a *Adapter) RegisterWebhook(ctx context.Context, auth provider.AuthConfig, callbackURL string) error {
	return fmt.Errorf("cleanbrowsing does not support webhooks")
}
