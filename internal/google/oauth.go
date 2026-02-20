package google

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/rs/zerolog/log"

	"github.com/guardiangate/api/pkg/crypto"
)

// TokenStore is the interface for persisting Google OAuth tokens.
type TokenStore interface {
	GetTokens(ctx context.Context, accountKey string) (*GoogleTokens, error)
	UpsertTokens(ctx context.Context, tokens *GoogleTokens) error
	DeleteTokens(ctx context.Context, accountKey string) error
}

// ErrGoogleDisconnected signals that the refresh token has been revoked.
var ErrGoogleDisconnected = errors.New("google account disconnected: refresh token revoked")

const (
	googleAuthURL  = "https://accounts.google.com/o/oauth2/v2/auth"
	googleTokenURL = "https://oauth2.googleapis.com/token"
)

// Client wraps Google API interactions with auto-refreshing tokens.
type Client struct {
	clientID     string
	clientSecret string
	redirectURI  string
	encryptKey   string
	accountKey   string
	tokenStore   TokenStore
	httpClient   *http.Client
}

// NewClient creates a new Google API client for the given account key.
func NewClient(clientID, clientSecret, redirectURI, encryptKey, accountKey string, store TokenStore) *Client {
	return &Client{
		clientID:     clientID,
		clientSecret: clientSecret,
		redirectURI:  redirectURI,
		encryptKey:   encryptKey,
		accountKey:   accountKey,
		tokenStore:   store,
		httpClient:   &http.Client{Timeout: 30 * time.Second},
	}
}

// Scopes returns the OAuth scopes we request.
func Scopes() []string {
	return []string{
		"https://www.googleapis.com/auth/gmail.readonly",
		"https://www.googleapis.com/auth/gmail.send",
		"https://www.googleapis.com/auth/gmail.compose",
		"https://www.googleapis.com/auth/contacts.readonly",
		"https://www.googleapis.com/auth/calendar",
		"https://www.googleapis.com/auth/calendar.events",
		"https://www.googleapis.com/auth/userinfo.email",
	}
}

// AuthorizeURL returns the Google OAuth consent URL.
func (c *Client) AuthorizeURL(state string) string {
	params := url.Values{
		"client_id":     {c.clientID},
		"redirect_uri":  {c.redirectURI},
		"response_type": {"code"},
		"scope":         {strings.Join(Scopes(), " ")},
		"access_type":   {"offline"},
		"prompt":        {"consent"},
		"state":         {state},
	}
	return googleAuthURL + "?" + params.Encode()
}

// ExchangeCode exchanges an authorization code for access/refresh tokens.
func (c *Client) ExchangeCode(ctx context.Context, code string) (*GoogleTokens, error) {
	body := url.Values{
		"client_id":     {c.clientID},
		"client_secret": {c.clientSecret},
		"code":          {code},
		"redirect_uri":  {c.redirectURI},
		"grant_type":    {"authorization_code"},
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, googleTokenURL, bytes.NewBufferString(body.Encode()))
	if err != nil {
		return nil, fmt.Errorf("create token request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("token exchange: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp struct {
			Error       string `json:"error"`
			Description string `json:"error_description"`
		}
		json.NewDecoder(resp.Body).Decode(&errResp)
		return nil, fmt.Errorf("token exchange failed (%d): %s - %s", resp.StatusCode, errResp.Error, errResp.Description)
	}

	var tokenResp struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		ExpiresIn    int    `json:"expires_in"`
		IDToken      string `json:"id_token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, fmt.Errorf("decode token response: %w", err)
	}

	if tokenResp.RefreshToken == "" {
		return nil, fmt.Errorf("no refresh token returned — did you use prompt=consent?")
	}

	// Get user email from userinfo
	email, err := c.getUserEmail(ctx, tokenResp.AccessToken)
	if err != nil {
		log.Warn().Err(err).Msg("failed to get Google user email, using placeholder")
		email = "unknown@gmail.com"
	}

	// Encrypt tokens
	accessEnc, err := crypto.Encrypt(tokenResp.AccessToken, c.encryptKey)
	if err != nil {
		return nil, fmt.Errorf("encrypt access token: %w", err)
	}
	refreshEnc, err := crypto.Encrypt(tokenResp.RefreshToken, c.encryptKey)
	if err != nil {
		return nil, fmt.Errorf("encrypt refresh token: %w", err)
	}

	now := time.Now()
	tokens := &GoogleTokens{
		AccountKey:            c.accountKey,
		GoogleEmail:           email,
		AccessTokenEncrypted:  accessEnc,
		RefreshTokenEncrypted: refreshEnc,
		TokenExpiry:           now.Add(time.Duration(tokenResp.ExpiresIn) * time.Second),
		Scopes:                Scopes(),
		CreatedAt:             now,
		UpdatedAt:             now,
	}

	if err := c.tokenStore.UpsertTokens(ctx, tokens); err != nil {
		return nil, fmt.Errorf("save tokens: %w", err)
	}

	return tokens, nil
}

// IsConnected checks whether a Google account is linked.
func (c *Client) IsConnected(ctx context.Context) (bool, string, error) {
	tokens, err := c.tokenStore.GetTokens(ctx, c.accountKey)
	if err != nil {
		return false, "", err
	}
	if tokens == nil {
		return false, "", nil
	}
	return true, tokens.GoogleEmail, nil
}

// Disconnect removes stored Google tokens.
func (c *Client) Disconnect(ctx context.Context) error {
	return c.tokenStore.DeleteTokens(ctx, c.accountKey)
}

// GetAccessToken returns a valid access token, refreshing if necessary.
func (c *Client) GetAccessToken(ctx context.Context) (string, error) {
	tokens, err := c.tokenStore.GetTokens(ctx, c.accountKey)
	if err != nil {
		return "", fmt.Errorf("get tokens: %w", err)
	}
	if tokens == nil {
		return "", ErrGoogleDisconnected
	}

	// Decrypt access token
	accessToken, err := crypto.Decrypt(tokens.AccessTokenEncrypted, c.encryptKey)
	if err != nil {
		return "", fmt.Errorf("decrypt access token: %w", err)
	}

	// If token expires within 5 minutes, refresh it
	if time.Until(tokens.TokenExpiry) < 5*time.Minute {
		refreshToken, err := crypto.Decrypt(tokens.RefreshTokenEncrypted, c.encryptKey)
		if err != nil {
			return "", fmt.Errorf("decrypt refresh token: %w", err)
		}

		newAccessToken, newExpiry, err := c.refreshAccessToken(ctx, refreshToken)
		if err != nil {
			if strings.Contains(err.Error(), "invalid_grant") {
				_ = c.tokenStore.DeleteTokens(ctx, c.accountKey)
				return "", ErrGoogleDisconnected
			}
			return "", fmt.Errorf("refresh token: %w", err)
		}

		// Encrypt and store new access token
		newAccessEnc, err := crypto.Encrypt(newAccessToken, c.encryptKey)
		if err != nil {
			return "", fmt.Errorf("encrypt new access token: %w", err)
		}

		tokens.AccessTokenEncrypted = newAccessEnc
		tokens.TokenExpiry = newExpiry
		tokens.UpdatedAt = time.Now()

		if err := c.tokenStore.UpsertTokens(ctx, tokens); err != nil {
			return "", fmt.Errorf("save refreshed tokens: %w", err)
		}

		return newAccessToken, nil
	}

	return accessToken, nil
}

// refreshAccessToken exchanges a refresh token for a new access token.
func (c *Client) refreshAccessToken(ctx context.Context, refreshToken string) (string, time.Time, error) {
	body := url.Values{
		"client_id":     {c.clientID},
		"client_secret": {c.clientSecret},
		"refresh_token": {refreshToken},
		"grant_type":    {"refresh_token"},
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, googleTokenURL, bytes.NewBufferString(body.Encode()))
	if err != nil {
		return "", time.Time{}, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", time.Time{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp struct {
			Error string `json:"error"`
		}
		json.NewDecoder(resp.Body).Decode(&errResp)
		return "", time.Time{}, fmt.Errorf("refresh failed (%d): %s", resp.StatusCode, errResp.Error)
	}

	var tokenResp struct {
		AccessToken string `json:"access_token"`
		ExpiresIn   int    `json:"expires_in"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return "", time.Time{}, err
	}

	expiry := time.Now().Add(time.Duration(tokenResp.ExpiresIn) * time.Second)
	return tokenResp.AccessToken, expiry, nil
}

// getUserEmail fetches the authenticated user's email from the userinfo endpoint.
func (c *Client) getUserEmail(ctx context.Context, accessToken string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://www.googleapis.com/oauth2/v2/userinfo", nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var info struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		return "", err
	}
	return info.Email, nil
}

// doAuthenticatedRequest makes an authenticated request to a Google API.
func (c *Client) doAuthenticatedRequest(ctx context.Context, method, url string, body []byte) (*http.Response, error) {
	token, err := c.GetAccessToken(ctx)
	if err != nil {
		return nil, err
	}

	var bodyReader *bytes.Buffer
	if body != nil {
		bodyReader = bytes.NewBuffer(body)
	}

	var req *http.Request
	if bodyReader != nil {
		req, err = http.NewRequestWithContext(ctx, method, url, bodyReader)
	} else {
		req, err = http.NewRequestWithContext(ctx, method, url, nil)
	}
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	return c.httpClient.Do(req)
}
