package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port           string
	DatabaseURL    string
	ClerkSecretKey string
	EncryptionKey  string

	NextDNSAPIKey  string
	NextDNSProfile string

	CleanBrowsingAPIKey string

	AndroidServiceAccount string

	MicrosoftClientID     string
	MicrosoftClientSecret string

	RateLimitRPS int
	LogLevel     string

	// CORS
	CORSOrigins string

	// Auto-migration on startup
	AutoMigrate bool

	// Sandbox / MCP Playground
	SandboxMode    bool
	AnthropicAPIKey string
}

func Load() *Config {
	return &Config{
		Port:          getEnv("PORT", "8080"),
		DatabaseURL:    getEnv("DATABASE_URL", "postgres://guardiangate:guardiangate_dev@localhost:5432/guardiangate?sslmode=disable"),
		ClerkSecretKey: getEnv("CLERK_SECRET_KEY", ""),
		EncryptionKey:  getEnv("ENCRYPTION_KEY", "0123456789abcdef0123456789abcdef"),

		NextDNSAPIKey:  getEnv("NEXTDNS_API_KEY", ""),
		NextDNSProfile: getEnv("NEXTDNS_PROFILE", ""),

		CleanBrowsingAPIKey: getEnv("CLEANBROWSING_API_KEY", ""),

		AndroidServiceAccount: getEnv("ANDROID_SERVICE_ACCOUNT", ""),

		MicrosoftClientID:     getEnv("MICROSOFT_CLIENT_ID", ""),
		MicrosoftClientSecret: getEnv("MICROSOFT_CLIENT_SECRET", ""),

		RateLimitRPS: getInt("RATE_LIMIT_RPS", 100),
		LogLevel:     getEnv("LOG_LEVEL", "info"),

		CORSOrigins: getEnv("CORS_ORIGINS", "http://localhost:3000"),

		AutoMigrate:    getBool("AUTO_MIGRATE", false),

		SandboxMode:    getBool("SANDBOX_MODE", false),
		AnthropicAPIKey: getEnv("ANTHROPIC_API_KEY", ""),
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

func getBool(key string, fallback bool) bool {
	if v := os.Getenv(key); v != "" {
		return v == "true" || v == "1" || v == "yes"
	}
	return fallback
}

