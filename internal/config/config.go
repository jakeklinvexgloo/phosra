package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port          string
	DatabaseURL   string
	EncryptionKey string

	NextDNSAPIKey  string
	NextDNSProfile string

	CleanBrowsingAPIKey string

	AndroidServiceAccount string

	MicrosoftClientID     string
	MicrosoftClientSecret string

	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURI  string

	GoogleOutreachRedirectURI string
	WorkerAPIKey              string

	RateLimitRPS int
	LogLevel     string

	// CORS
	CORSOrigins string

	// Auto-migration on startup
	AutoMigrate bool

	// APNs (Apple Push Notification service)
	APNsTeamID         string
	APNsKeyID          string
	APNsAuthKeyPath    string // local dev: path to .p8 file
	APNsAuthKeyBase64  string // production: base64-encoded .p8 contents
	APNsBundleID       string
	APNsProduction     bool

	// Stytch (auth)
	StytchProjectID string

	// Sandbox / MCP Playground
	SandboxMode    bool
	AnthropicAPIKey string

	// OpenAI (Pitch Coaching — Realtime API + GPT-4o feedback)
	OpenAIAPIKey string

	// AssemblyAI (Pitch Coaching — word-level transcription, Phase 2)
	AssemblyAIKey string

	// Hume AI (Pitch Coaching — vocal emotion analysis, Phase 3)
	HumeAIKey string
}

func Load() *Config {
	return &Config{
		Port:          getEnv("PORT", "8080"),
		DatabaseURL:   getEnv("DATABASE_URL", "postgres://guardiangate:guardiangate_dev@localhost:5432/guardiangate?sslmode=disable"),
		EncryptionKey: getEnv("ENCRYPTION_KEY", "0123456789abcdef0123456789abcdef"),

		NextDNSAPIKey:  getEnv("NEXTDNS_API_KEY", ""),
		NextDNSProfile: getEnv("NEXTDNS_PROFILE", ""),

		CleanBrowsingAPIKey: getEnv("CLEANBROWSING_API_KEY", ""),

		AndroidServiceAccount: getEnv("ANDROID_SERVICE_ACCOUNT", ""),

		MicrosoftClientID:     getEnv("MICROSOFT_CLIENT_ID", ""),
		MicrosoftClientSecret: getEnv("MICROSOFT_CLIENT_SECRET", ""),

		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURI:  getEnv("GOOGLE_REDIRECT_URI", "http://localhost:3000/dashboard/admin/gmail/callback"),

		GoogleOutreachRedirectURI: getEnv("GOOGLE_OUTREACH_REDIRECT_URI", "http://localhost:3000/dashboard/admin/outreach/gmail-callback"),
		WorkerAPIKey:              getEnv("WORKER_API_KEY", ""),

		RateLimitRPS: getInt("RATE_LIMIT_RPS", 100),
		LogLevel:     getEnv("LOG_LEVEL", "info"),

		CORSOrigins: getEnv("CORS_ORIGINS", "http://localhost:3000"),

		AutoMigrate:    getBool("AUTO_MIGRATE", false),

		APNsTeamID:        getEnv("APNS_TEAM_ID", ""),
		APNsKeyID:         getEnv("APNS_KEY_ID", ""),
		APNsAuthKeyPath:   getEnv("APNS_AUTH_KEY_PATH", ""),
		APNsAuthKeyBase64: getEnv("APNS_AUTH_KEY_BASE64", ""),
		APNsBundleID:      getEnv("APNS_BUNDLE_ID", ""),
		APNsProduction:    getBool("APNS_PRODUCTION", false),

		StytchProjectID: getEnv("STYTCH_PROJECT_ID", ""),

		SandboxMode:    getBool("SANDBOX_MODE", false),
		AnthropicAPIKey: getEnv("ANTHROPIC_API_KEY", ""),

		OpenAIAPIKey: getEnv("OPENAI_API_KEY", ""),

		AssemblyAIKey: getEnv("ASSEMBLYAI_API_KEY", ""),

		HumeAIKey: getEnv("HUME_API_KEY", ""),
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

