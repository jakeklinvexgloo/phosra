package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/repository"
	"github.com/lestrrat-go/jwx/v2/jwa"
	"github.com/lestrrat-go/jwx/v2/jwt"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailTaken         = errors.New("email already registered")
	ErrInvalidToken       = errors.New("invalid or expired token")
	ErrUserNotFound       = errors.New("user not found")
)

type AuthService struct {
	users         repository.UserRepository
	refreshTokens repository.RefreshTokenRepository
	jwtSecret     []byte
	accessTTL     time.Duration
	refreshTTL    time.Duration
}

type TokenPair struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
}

func NewAuthService(
	users repository.UserRepository,
	refreshTokens repository.RefreshTokenRepository,
	jwtSecret string,
	accessTTL, refreshTTL time.Duration,
) *AuthService {
	return &AuthService{
		users:         users,
		refreshTokens: refreshTokens,
		jwtSecret:     []byte(jwtSecret),
		accessTTL:     accessTTL,
		refreshTTL:    refreshTTL,
	}
}

func (s *AuthService) Register(ctx context.Context, email, password, name string) (*domain.User, *TokenPair, error) {
	existing, _ := s.users.GetByEmail(ctx, email)
	if existing != nil {
		return nil, nil, ErrEmailTaken
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, nil, fmt.Errorf("hash password: %w", err)
	}

	user := &domain.User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: string(hash),
		Name:         name,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := s.users.Create(ctx, user); err != nil {
		return nil, nil, fmt.Errorf("create user: %w", err)
	}

	tokens, err := s.generateTokens(ctx, user)
	if err != nil {
		return nil, nil, err
	}

	return user, tokens, nil
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*domain.User, *TokenPair, error) {
	user, err := s.users.GetByEmail(ctx, email)
	if err != nil || user == nil {
		return nil, nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, nil, ErrInvalidCredentials
	}

	tokens, err := s.generateTokens(ctx, user)
	if err != nil {
		return nil, nil, err
	}

	return user, tokens, nil
}

func (s *AuthService) RefreshAccessToken(ctx context.Context, refreshToken string) (*TokenPair, error) {
	hash := hashToken(refreshToken)

	stored, err := s.refreshTokens.GetByHash(ctx, hash)
	if err != nil || stored == nil || stored.Revoked || stored.ExpiresAt.Before(time.Now()) {
		return nil, ErrInvalidToken
	}

	// Revoke old token
	_ = s.refreshTokens.Revoke(ctx, stored.ID)

	user, err := s.users.GetByID(ctx, stored.UserID)
	if err != nil || user == nil {
		return nil, ErrUserNotFound
	}

	return s.generateTokens(ctx, user)
}

func (s *AuthService) Logout(ctx context.Context, userID uuid.UUID) error {
	return s.refreshTokens.RevokeByUserID(ctx, userID)
}

func (s *AuthService) GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	return s.users.GetByID(ctx, id)
}

func (s *AuthService) generateTokens(ctx context.Context, user *domain.User) (*TokenPair, error) {
	now := time.Now()
	expiresAt := now.Add(s.accessTTL)

	tok, err := jwt.NewBuilder().
		Subject(user.ID.String()).
		IssuedAt(now).
		Expiration(expiresAt).
		Claim("email", user.Email).
		Claim("name", user.Name).
		Build()
	if err != nil {
		return nil, fmt.Errorf("build jwt: %w", err)
	}

	signed, err := jwt.Sign(tok, jwt.WithKey(jwa.HS256, s.jwtSecret))
	if err != nil {
		return nil, fmt.Errorf("sign jwt: %w", err)
	}

	// Generate refresh token
	rawRefresh := make([]byte, 32)
	if _, err := rand.Read(rawRefresh); err != nil {
		return nil, fmt.Errorf("generate refresh token: %w", err)
	}
	refreshStr := hex.EncodeToString(rawRefresh)

	rt := &domain.RefreshToken{
		ID:        uuid.New(),
		UserID:    user.ID,
		TokenHash: hashToken(refreshStr),
		ExpiresAt: now.Add(s.refreshTTL),
		CreatedAt: now,
	}
	if err := s.refreshTokens.Create(ctx, rt); err != nil {
		return nil, fmt.Errorf("store refresh token: %w", err)
	}

	return &TokenPair{
		AccessToken:  string(signed),
		RefreshToken: refreshStr,
		ExpiresAt:    expiresAt,
	}, nil
}

func hashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
}
