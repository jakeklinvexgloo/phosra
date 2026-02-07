package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port          string
	DatabaseURL   string
	JWTSecret     string
	EncryptionKey string

	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration

	NextDNSAPIKey string
	NextDNSProfile string

	CleanBrowsingAPIKey string

	AndroidServiceAccount string

	MicrosoftClientID     string
	MicrosoftClientSecret string

	RateLimitRPS int
	LogLevel     string
}

func Load() *Config {
	return &Config{
		Port:          getEnv("PORT", "8080"),
		DatabaseURL:   getEnv("DATABASE_URL", "postgres://guardiangate:guardiangate_dev@localhost:5432/guardiangate?sslmode=disable"),
		JWTSecret:     getEnv("JWT_SECRET", "dev-secret-change-in-production"),
		EncryptionKey: getEnv("ENCRYPTION_KEY", "0123456789abcdef0123456789abcdef"),

		AccessTokenTTL:  getDuration("ACCESS_TOKEN_TTL", 15*time.Minute),
		RefreshTokenTTL: getDuration("REFRESH_TOKEN_TTL", 7*24*time.Hour),

		NextDNSAPIKey:  getEnv("NEXTDNS_API_KEY", ""),
		NextDNSProfile: getEnv("NEXTDNS_PROFILE", ""),

		CleanBrowsingAPIKey: getEnv("CLEANBROWSING_API_KEY", ""),

		AndroidServiceAccount: getEnv("ANDROID_SERVICE_ACCOUNT", ""),

		MicrosoftClientID:     getEnv("MICROSOFT_CLIENT_ID", ""),
		MicrosoftClientSecret: getEnv("MICROSOFT_CLIENT_SECRET", ""),

		RateLimitRPS: getInt("RATE_LIMIT_RPS", 100),
		LogLevel:     getEnv("LOG_LEVEL", "info"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}

func getDuration(key string, fallback time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return fallback
}
