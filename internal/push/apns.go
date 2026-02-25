package push

import (
	"bytes"
	"context"
	"crypto/ecdsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"github.com/guardiangate/api/internal/repository"
)

const (
	apnsSandboxHost    = "https://api.sandbox.push.apple.com"
	apnsProductionHost = "https://api.push.apple.com"
	tokenTTL           = 50 * time.Minute // Apple tokens are valid for 60 min; refresh early
)

// APNsService sends silent push notifications to registered Apple devices.
type APNsService struct {
	devices    repository.DeviceRegistrationRepository
	teamID     string
	keyID      string
	authKey    *ecdsa.PrivateKey
	bundleID   string
	host       string
	client     *http.Client

	mu         sync.RWMutex
	token      string
	tokenExpAt time.Time
}

// APNsConfig holds the configuration needed to connect to Apple's push service.
type APNsConfig struct {
	TeamID        string
	KeyID         string
	AuthKeyPath   string // local dev: path to .p8 file
	AuthKeyBase64 string // production: base64-encoded .p8 file contents
	BundleID      string
	Production    bool
}

// NewAPNsService creates an APNs service from config.
// Returns nil if config is incomplete (allows no-op when APNs is not configured).
// Accepts the .p8 key via either AuthKeyBase64 (preferred, for cloud deploys)
// or AuthKeyPath (local dev). Base64 takes precedence if both are set.
func NewAPNsService(cfg APNsConfig, devices repository.DeviceRegistrationRepository) (*APNsService, error) {
	if cfg.TeamID == "" || cfg.KeyID == "" || cfg.BundleID == "" {
		return nil, nil // not configured — caller checks for nil
	}
	if cfg.AuthKeyBase64 == "" && cfg.AuthKeyPath == "" {
		return nil, nil // no key provided
	}

	var keyData []byte
	var err error
	if cfg.AuthKeyBase64 != "" {
		keyData, err = base64.StdEncoding.DecodeString(cfg.AuthKeyBase64)
		if err != nil {
			return nil, fmt.Errorf("decode APNs auth key from base64: %w", err)
		}
	} else {
		keyData, err = os.ReadFile(cfg.AuthKeyPath)
		if err != nil {
			return nil, fmt.Errorf("read APNs auth key: %w", err)
		}
	}

	key, err := parseP8Key(keyData)
	if err != nil {
		return nil, fmt.Errorf("parse APNs auth key: %w", err)
	}

	host := apnsSandboxHost
	if cfg.Production {
		host = apnsProductionHost
	}

	return &APNsService{
		devices:  devices,
		teamID:   cfg.TeamID,
		keyID:    cfg.KeyID,
		authKey:  key,
		bundleID: cfg.BundleID,
		host:     host,
		client:   &http.Client{Timeout: 10 * time.Second},
	}, nil
}

// NotifyPolicyUpdate sends a silent push to all active devices for the given child.
// It is fire-and-forget: errors are logged but not propagated.
func (s *APNsService) NotifyPolicyUpdate(ctx context.Context, childID uuid.UUID, version int) {
	if s == nil {
		return
	}

	devices, err := s.devices.ListByChild(ctx, childID)
	if err != nil {
		log.Warn().Err(err).Str("child_id", childID.String()).Msg("apns: failed to list devices")
		return
	}

	payload := map[string]any{
		"aps": map[string]any{
			"content-available": 1,
		},
		"phosra": map[string]any{
			"event":   "policy.updated",
			"version": version,
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		log.Error().Err(err).Msg("apns: failed to marshal payload")
		return
	}

	token, err := s.getToken()
	if err != nil {
		log.Error().Err(err).Msg("apns: failed to generate JWT")
		return
	}

	for _, dev := range devices {
		if dev.APNsToken == nil || dev.Status != "active" {
			continue
		}
		go s.send(ctx, *dev.APNsToken, body, token)
	}
}

func (s *APNsService) send(ctx context.Context, deviceToken string, body []byte, authToken string) {
	url := fmt.Sprintf("%s/3/device/%s", s.host, deviceToken)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		log.Warn().Err(err).Msg("apns: create request failed")
		return
	}

	req.Header.Set("Authorization", "bearer "+authToken)
	req.Header.Set("apns-topic", s.bundleID)
	req.Header.Set("apns-push-type", "background")
	req.Header.Set("apns-priority", "5") // silent push must be priority 5

	resp, err := s.client.Do(req)
	if err != nil {
		log.Warn().Err(err).Str("device_token", deviceToken[:8]+"...").Msg("apns: send failed")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Warn().
			Int("status", resp.StatusCode).
			Str("device_token", deviceToken[:8]+"...").
			Msg("apns: non-200 response")
	}
}

// getToken returns a cached JWT or generates a fresh one.
func (s *APNsService) getToken() (string, error) {
	s.mu.RLock()
	if s.token != "" && time.Now().Before(s.tokenExpAt) {
		t := s.token
		s.mu.RUnlock()
		return t, nil
	}
	s.mu.RUnlock()

	s.mu.Lock()
	defer s.mu.Unlock()

	// Double-check after acquiring write lock
	if s.token != "" && time.Now().Before(s.tokenExpAt) {
		return s.token, nil
	}

	now := time.Now()
	claims := jwt.MapClaims{
		"iss": s.teamID,
		"iat": now.Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodES256, claims)
	token.Header["kid"] = s.keyID

	signed, err := token.SignedString(s.authKey)
	if err != nil {
		return "", fmt.Errorf("sign APNs token: %w", err)
	}

	s.token = signed
	s.tokenExpAt = now.Add(tokenTTL)
	return s.token, nil
}

// parseP8Key parses an Apple .p8 private key file.
func parseP8Key(data []byte) (*ecdsa.PrivateKey, error) {
	block, _ := pem.Decode(data)
	if block == nil {
		return nil, fmt.Errorf("no PEM block found in p8 key")
	}

	key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("parse PKCS8 key: %w", err)
	}

	ecKey, ok := key.(*ecdsa.PrivateKey)
	if !ok {
		return nil, fmt.Errorf("key is not ECDSA")
	}

	return ecKey, nil
}
