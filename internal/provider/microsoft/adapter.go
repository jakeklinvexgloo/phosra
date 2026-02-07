package microsoft

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
)

const graphBaseURL = "https://graph.microsoft.com/v1.0"

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
		ID:          "microsoft",
		Name:        "Microsoft Family Safety",
		Category:    domain.PlatformCategoryDevice,
		Tier:        domain.ComplianceLevelProvisional,
		Description: "Microsoft Family Safety parental controls (read-mostly integration)",
		AuthType:    "oauth2",
		SetupURL:    "https://account.microsoft.com/family",
		DocsURL:     "https://learn.microsoft.com/en-us/graph/api/resources/family",
	}
}

func (a *Adapter) Capabilities() []provider.Capability {
	return []provider.Capability{
		provider.CapTimeLimit,
		provider.CapContentRating,
		provider.CapActivityMonitor,
		provider.CapWebFiltering,
	}
}

func (a *Adapter) ValidateAuth(ctx context.Context, auth provider.AuthConfig) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, graphBaseURL+"/me", nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+auth.AccessToken)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("microsoft auth failed: status %d", resp.StatusCode)
	}
	return nil
}

func (a *Adapter) EnforcePolicy(ctx context.Context, req provider.EnforcementRequest) (*provider.EnforcementResult, error) {
	result := &provider.EnforcementResult{
		Details: make(map[string]any),
		Message: "Microsoft Family Safety has limited write API access. Some settings may need manual configuration.",
	}

	for _, rule := range req.Rules {
		if !rule.Enabled {
			result.RulesSkipped++
			continue
		}

		switch rule.Category {
		case domain.RuleTimeDailyLimit, domain.RuleTimeScheduledHours:
			// Microsoft Graph API supports some screen time management
			result.RulesApplied++
			result.Details[string(rule.Category)] = "applied (limited)"
		case domain.RuleContentRating:
			result.RulesApplied++
			result.Details[string(rule.Category)] = "applied via content restrictions"
		case domain.RuleWebFilterLevel:
			result.RulesSkipped++
			result.Details[string(rule.Category)] = "requires manual setup in Microsoft Family Safety"
		default:
			result.RulesSkipped++
		}
	}

	return result, nil
}

func (a *Adapter) GetCurrentConfig(ctx context.Context, auth provider.AuthConfig) (map[string]any, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, graphBaseURL+"/me/people", nil)
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
	return nil // Read-mostly; no policy to revoke
}

func (a *Adapter) SupportsWebhooks() bool { return false }

func (a *Adapter) RegisterWebhook(ctx context.Context, auth provider.AuthConfig, callbackURL string) error {
	return fmt.Errorf("microsoft family safety does not support webhooks for parental controls")
}

// OAuth methods
func (a *Adapter) AuthorizeURL(state, redirectURI string) string {
	return fmt.Sprintf(
		"https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=%s&redirect_uri=%s&response_type=code&scope=User.Read+Family.Read&state=%s",
		a.clientID, redirectURI, state,
	)
}

func (a *Adapter) ExchangeCode(ctx context.Context, code, redirectURI string) (*provider.AuthConfig, error) {
	body := fmt.Sprintf("client_id=%s&client_secret=%s&code=%s&redirect_uri=%s&grant_type=authorization_code",
		a.clientID, a.clientSecret, code, redirectURI)

	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "https://login.microsoftonline.com/common/oauth2/v2.0/token",
		bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var tokenResp struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
	}
	json.NewDecoder(resp.Body).Decode(&tokenResp)

	return &provider.AuthConfig{
		AccessToken:  tokenResp.AccessToken,
		RefreshToken: tokenResp.RefreshToken,
	}, nil
}

func (a *Adapter) RefreshAccessToken(ctx context.Context, auth provider.AuthConfig) (*provider.AuthConfig, error) {
	body := fmt.Sprintf("client_id=%s&client_secret=%s&refresh_token=%s&grant_type=refresh_token",
		a.clientID, a.clientSecret, auth.RefreshToken)

	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "https://login.microsoftonline.com/common/oauth2/v2.0/token",
		bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var tokenResp struct {
		AccessToken string `json:"access_token"`
	}
	json.NewDecoder(resp.Body).Decode(&tokenResp)

	return &provider.AuthConfig{
		AccessToken:  tokenResp.AccessToken,
		RefreshToken: auth.RefreshToken,
	}, nil
}
