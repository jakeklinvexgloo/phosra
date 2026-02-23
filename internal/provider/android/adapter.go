package android

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

const baseURL = "https://androidmanagement.googleapis.com/v1"

type Adapter struct {
	httpClient   *http.Client
	clientID     string
	clientSecret string
}

func New(clientID, clientSecret string) *Adapter {
	return &Adapter{
		httpClient:   &http.Client{Timeout: 30 * time.Second},
		clientID:     clientID,
		clientSecret: clientSecret,
	}
}

func (a *Adapter) Info() provider.PlatformInfo {
	return provider.PlatformInfo{
		ID:          "android",
		Name:        "Android Device",
		Category:    domain.PlatformCategoryDevice,
		Tier:        domain.ComplianceLevelProvisional,
		Description: "On-device enforcement via Phosra Android app using DevicePolicyManager, UsageStatsManager, VpnService, AccessibilityService, and NotificationListenerService",
		AuthType:    "device_sync",
		DocsURL:     "https://developer.android.com/reference/android/app/admin/DevicePolicyManager",
	}
}

func (a *Adapter) Capabilities() []provider.Capability {
	return []provider.Capability{
		provider.CapTimeLimit,
		provider.CapScheduledHours,
		provider.CapAppControl,
		provider.CapContentRating,
		provider.CapLocationTracking,
		provider.CapActivityMonitor,
	}
}

func (a *Adapter) ValidateAuth(ctx context.Context, auth provider.AuthConfig) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, baseURL+"/enterprises", nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+auth.AccessToken)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("android management api error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized {
		return fmt.Errorf("android auth expired or invalid")
	}
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("android api error: status %d", resp.StatusCode)
	}
	return nil
}

func (a *Adapter) EnforcePolicy(ctx context.Context, req provider.EnforcementRequest) (*provider.EnforcementResult, error) {
	result := &provider.EnforcementResult{
		Details: make(map[string]any),
	}

	// Build Android Management policy from rules
	androidPolicy := buildAndroidPolicy(req.Rules)

	enterprise := req.AuthConfig.ExtraParams["enterprise_id"]
	if enterprise == "" {
		return nil, fmt.Errorf("enterprise_id required in extra_params")
	}

	policyName := fmt.Sprintf("phosra-%s", req.ChildName)
	url := fmt.Sprintf("%s/enterprises/%s/policies/%s", baseURL, enterprise, policyName)

	body, _ := json.Marshal(androidPolicy)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPatch, url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Authorization", "Bearer "+req.AuthConfig.AccessToken)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := a.httpClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("android api error %d: %s", resp.StatusCode, string(respBody))
	}

	result.RulesApplied = androidPolicy.appliedCount
	result.RulesSkipped = androidPolicy.skippedCount

	return result, nil
}

type androidPolicyConfig struct {
	MaximumTimeToLock       *int             `json:"maximumTimeToLock,omitempty"`
	PlayStoreMode           string           `json:"playStoreMode,omitempty"`
	ScreenCaptureDisabled   bool             `json:"screenCaptureDisabled,omitempty"`
	FunDisabled             bool             `json:"funDisabled,omitempty"`
	StatusReportingSettings map[string]any   `json:"statusReportingSettings,omitempty"`
	ApplicationsPolicy      []map[string]any `json:"applications,omitempty"`
	appliedCount            int              `json:"-"`
	skippedCount            int              `json:"-"`
}

func buildAndroidPolicy(rules []domain.PolicyRule) *androidPolicyConfig {
	policy := &androidPolicyConfig{
		PlayStoreMode: "WHITELIST",
		StatusReportingSettings: map[string]any{
			"applicationReportsEnabled": true,
			"deviceSettingsEnabled":     true,
			"networkInfoEnabled":        true,
		},
	}

	for _, rule := range rules {
		if !rule.Enabled {
			policy.skippedCount++
			continue
		}

		switch rule.Category {
		case domain.RuleTimeDailyLimit, domain.RuleTimeScheduledHours:
			policy.appliedCount++
		case domain.RuleContentRating:
			policy.appliedCount++
		case domain.RuleMonitoringActivity:
			policy.appliedCount++
		case domain.RulePrivacyLocation:
			policy.appliedCount++
		default:
			policy.skippedCount++
		}
	}

	return policy
}

func (a *Adapter) GetCurrentConfig(ctx context.Context, auth provider.AuthConfig) (map[string]any, error) {
	enterprise := auth.ExtraParams["enterprise_id"]
	if enterprise == "" {
		return nil, fmt.Errorf("enterprise_id required")
	}

	url := fmt.Sprintf("%s/enterprises/%s/policies", baseURL, enterprise)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+auth.AccessToken)

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
	enterprise := auth.ExtraParams["enterprise_id"]
	if enterprise == "" {
		return nil
	}
	url := fmt.Sprintf("%s/enterprises/%s/policies/phosra-default", baseURL, enterprise)
	req, _ := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	req.Header.Set("Authorization", "Bearer "+auth.AccessToken)
	resp, err := a.httpClient.Do(req)
	if err != nil {
		return err
	}
	resp.Body.Close()
	return nil
}

func (a *Adapter) SupportsWebhooks() bool { return true }

func (a *Adapter) RegisterWebhook(ctx context.Context, auth provider.AuthConfig, callbackURL string) error {
	// Android Management API supports pub/sub notifications
	return nil // Would configure pub/sub topic
}

// OAuth methods
func (a *Adapter) AuthorizeURL(state, redirectURI string) string {
	return fmt.Sprintf(
		"https://accounts.google.com/o/oauth2/v2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=https://www.googleapis.com/auth/androidmanagement&state=%s&access_type=offline",
		a.clientID, redirectURI, state,
	)
}

func (a *Adapter) ExchangeCode(ctx context.Context, code, redirectURI string) (*provider.AuthConfig, error) {
	body := map[string]string{
		"code":          code,
		"client_id":     a.clientID,
		"client_secret": a.clientSecret,
		"redirect_uri":  redirectURI,
		"grant_type":    "authorization_code",
	}
	jsonBody, _ := json.Marshal(body)

	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "https://oauth2.googleapis.com/token", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var tokenResp struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, err
	}

	return &provider.AuthConfig{
		AccessToken:  tokenResp.AccessToken,
		RefreshToken: tokenResp.RefreshToken,
	}, nil
}

func (a *Adapter) RefreshAccessToken(ctx context.Context, auth provider.AuthConfig) (*provider.AuthConfig, error) {
	body := map[string]string{
		"refresh_token": auth.RefreshToken,
		"client_id":     a.clientID,
		"client_secret": a.clientSecret,
		"grant_type":    "refresh_token",
	}
	jsonBody, _ := json.Marshal(body)

	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "https://oauth2.googleapis.com/token", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var tokenResp struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, err
	}

	return &provider.AuthConfig{
		AccessToken:  tokenResp.AccessToken,
		RefreshToken: auth.RefreshToken,
	}, nil
}
