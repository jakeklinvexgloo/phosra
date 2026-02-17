package apple

// AppCategoryMap maps a Phosra abstract category to Apple-specific identifiers.
type AppCategoryMap struct {
	AppStoreCategory string   `json:"app_store_category,omitempty"`
	BundleIDs        []string `json:"bundle_ids"`
	WebDomains       []string `json:"web_domains,omitempty"`
}

// CategoryFrameworkMapping tells the iOS app which Apple framework + API class
// to use when enforcing a given Phosra rule category.
type CategoryFrameworkMapping struct {
	Framework string `json:"framework"`           // "ManagedSettings", "DeviceActivity", "FamilyControls", "none"
	APIClass  string `json:"api_class"`           // e.g. "ManagedSettingsStore.application", "DeviceActivitySchedule"
	MinOS     string `json:"min_os"`              // minimum iOS version, e.g. "16.0"
	Notes     string `json:"notes,omitempty"`     // implementation hints
}

// ApplePlatformMappings contains Phosra → Apple identifier translations.
type ApplePlatformMappings struct {
	AgeRatings         map[string]string                    `json:"age_ratings"`
	AppCategories      map[string]AppCategoryMap            `json:"app_categories"`
	SystemApps         map[string]string                    `json:"system_apps"`
	AlwaysAllowed      []string                             `json:"always_allowed"`
	CategoryFrameworks map[string]CategoryFrameworkMapping   `json:"category_frameworks"`
}

// GetPlatformMappings returns the static mapping table for the Apple platform.
func GetPlatformMappings() *ApplePlatformMappings {
	return &ApplePlatformMappings{
		AgeRatings: map[string]string{
			"G":     "4+",
			"PG":    "9+",
			"PG-13": "12+",
			"R":     "17+",
			"NC-17": "17+",
			"TV-Y":  "4+",
			"TV-Y7": "4+",
			"TV-G":  "4+",
			"TV-PG": "9+",
			"TV-14": "12+",
			"TV-MA": "17+",
			"E":     "4+",
			"E10+":  "9+",
			"T":     "12+",
			"M":     "17+",
			"AO":    "17+",
		},
		AppCategories: map[string]AppCategoryMap{
			"social-media": {
				AppStoreCategory: "SNS",
				BundleIDs: []string{
					"com.burbn.instagram",
					"com.atebits.Tweetie2",
					"com.toyopagroup.picaboo",
					"com.zhiliaoapp.musically",
					"com.facebook.Facebook",
				},
			},
			"dating": {
				BundleIDs: []string{
					"com.cardify.tinder",
					"com.bumble.app",
					"com.coffeemeetsbagel.app",
				},
			},
			"gambling": {
				BundleIDs: []string{
					"com.draftkings.sportsbook",
					"com.fanduel.sportsbook",
				},
				WebDomains: []string{
					"draftkings.com",
					"fanduel.com",
					"betmgm.com",
				},
			},
			"messaging": {
				BundleIDs: []string{
					"net.whatsapp.WhatsApp",
					"org.telegram.TelegramEnterprise",
					"com.facebook.Messenger",
					"com.discord",
				},
			},
			"video-streaming": {
				BundleIDs: []string{
					"com.google.ios.youtube",
					"com.netflix.Netflix",
					"com.disney.disneyplus",
					"com.amazon.aiv.AIVApp",
				},
			},
			"gaming": {
				AppStoreCategory: "Games",
				BundleIDs:        []string{},
			},
		},
		SystemApps: map[string]string{
			"phone":    "com.apple.mobilephone",
			"messages": "com.apple.MobileSMS",
			"facetime": "com.apple.facetime",
			"maps":     "com.apple.Maps",
			"camera":   "com.apple.camera",
			"health":   "com.apple.Health",
			"settings": "com.apple.Preferences",
			"wallet":   "com.apple.Passbook",
			"photos":   "com.apple.mobileslideshow",
			"clock":    "com.apple.mobiletimer",
			"find_my":  "com.apple.findmy",
		},
		AlwaysAllowed: []string{
			"com.apple.mobilephone",
			"com.apple.MobileSMS",
			"com.apple.Maps",
			"com.apple.Health",
			"com.apple.findmy",
		},
		CategoryFrameworks: map[string]CategoryFrameworkMapping{
			// --- Content ---
			"content_rating":          {Framework: "ManagedSettings", APIClass: "ManagedSettingsStore.application", MinOS: "16.0", Notes: "Filter by App Store age rating via ApplicationToken"},
			"content_block_title":     {Framework: "ManagedSettings", APIClass: "ManagedSettingsStore.application.blockedApplications", MinOS: "16.0"},
			"content_allow_title":     {Framework: "ManagedSettings", APIClass: "ManagedSettingsStore.application.denyAppInstallation", MinOS: "16.0", Notes: "Invert to allowlist with denyAppInstallation=true + exceptions"},
			"content_allowlist_mode":  {Framework: "ManagedSettings", APIClass: "ManagedSettingsStore.application.denyAppInstallation", MinOS: "16.0", Notes: "Set denyAppInstallation=true then allowlist specific tokens"},
			"content_descriptor_block": {Framework: "ManagedSettings", APIClass: "ManagedSettingsStore.application", MinOS: "16.0", Notes: "Use content rating descriptors to filter"},

			// --- Time ---
			"time_daily_limit":     {Framework: "DeviceActivity", APIClass: "DeviceActivitySchedule", MinOS: "16.0", Notes: "Create a schedule with cumulative usage threshold"},
			"time_scheduled_hours": {Framework: "DeviceActivity", APIClass: "DeviceActivitySchedule", MinOS: "16.0", Notes: "Schedule with start/end DateComponents for allowed hours"},
			"time_per_app_limit":   {Framework: "DeviceActivity", APIClass: "DeviceActivitySchedule", MinOS: "16.0", Notes: "Per-ApplicationToken usage schedule"},
			"time_downtime":        {Framework: "DeviceActivity", APIClass: "DeviceActivitySchedule", MinOS: "16.0", Notes: "Block all apps outside allowed schedule window"},

			// --- Purchases ---
			"purchase_approval":    {Framework: "ManagedSettings", APIClass: "ManagedSettingsStore.appStore.requirePasswordForPurchases", MinOS: "16.0"},
			"purchase_spending_cap": {Framework: "none", APIClass: "", MinOS: "", Notes: "No Apple API — track via StoreKit transaction observer"},
			"purchase_block_iap":   {Framework: "ManagedSettings", APIClass: "ManagedSettingsStore.appStore.denyInAppPurchases", MinOS: "16.0"},

			// --- Social ---
			"social_contacts":   {Framework: "FamilyControls", APIClass: "AuthorizationCenter", MinOS: "16.0", Notes: "Requires FamilyControls entitlement; manages contact-based restrictions"},
			"social_chat_control": {Framework: "none", APIClass: "", MinOS: "", Notes: "No direct Apple API — enforce via app-level ManagedSettings blocks on messaging apps"},
			"social_multiplayer": {Framework: "ManagedSettings", APIClass: "ManagedSettingsStore.gameCenter.denyMultiplayerGaming", MinOS: "16.0"},

			// --- Web ---
			"web_safesearch":       {Framework: "ManagedSettings", APIClass: "ManagedSettingsStore.webContent.autoFilter", MinOS: "16.0"},
			"web_category_block":   {Framework: "ManagedSettings", APIClass: "ManagedSettingsStore.webContent.blockedByFilter", MinOS: "16.0"},
			"web_custom_allowlist": {Framework: "ManagedSettings", APIClass: "ManagedSettingsStore.webContent.allowedDomains", MinOS: "16.0"},
			"web_custom_blocklist": {Framework: "ManagedSettings", APIClass: "ManagedSettingsStore.webContent.blockedDomains", MinOS: "16.0"},
			"web_filter_level":     {Framework: "ManagedSettings", APIClass: "ManagedSettingsStore.webContent", MinOS: "16.0", Notes: "Map level → autoFilter (strict/moderate) or allowedDomains-only (strict)"},

			// --- Privacy ---
			"privacy_location":            {Framework: "none", APIClass: "", MinOS: "", Notes: "Location Services controlled at OS level via Settings; use CLLocationManager delegation in-app"},
			"privacy_profile_visibility":  {Framework: "none", APIClass: "", MinOS: "", Notes: "App-level concern — no Apple framework controls profile visibility"},
			"privacy_data_sharing":        {Framework: "none", APIClass: "", MinOS: "", Notes: "Enforce via app-level logic; Apple's App Tracking Transparency covers ads only"},
			"privacy_account_creation":    {Framework: "none", APIClass: "", MinOS: "", Notes: "Gate in-app via FamilyControls authorization check"},

			// --- Monitoring ---
			"monitoring_activity": {Framework: "DeviceActivity", APIClass: "DeviceActivityReport", MinOS: "16.0", Notes: "SwiftUI extension — renders usage reports in the parent app"},
			"monitoring_alerts":   {Framework: "DeviceActivity", APIClass: "DeviceActivityMonitor", MinOS: "16.0", Notes: "DeviceActivityMonitor.events fires when thresholds are crossed"},

			// --- Engagement / Addictive design ---
			"algo_feed_control":         {Framework: "none", APIClass: "", MinOS: "", Notes: "Platform-level — no Apple API; enforce by blocking/limiting social apps"},
			"addictive_design_control":  {Framework: "none", APIClass: "", MinOS: "", Notes: "Platform-level — no Apple API; can block offending apps via ManagedSettings"},

			// --- Notifications ---
			"notification_curfew":         {Framework: "ManagedSettings", APIClass: "ManagedSettingsStore.notification", MinOS: "16.4", Notes: "Silence notifications from managed apps during curfew"},
			"usage_timer_notification":    {Framework: "DeviceActivity", APIClass: "DeviceActivityMonitor", MinOS: "16.0", Notes: "Fire local notification when usage interval reached"},

			// --- Legislation-driven ---
			"targeted_ad_block":      {Framework: "none", APIClass: "", MinOS: "", Notes: "App Tracking Transparency (ATT) is per-prompt; no blanket block API"},
			"dm_restriction":         {Framework: "none", APIClass: "", MinOS: "", Notes: "Block messaging apps via ManagedSettings as a proxy"},
			"age_gate":               {Framework: "none", APIClass: "", MinOS: "", Notes: "Enforce in-app; Apple doesn't expose age verification APIs"},
			"data_deletion_request":  {Framework: "none", APIClass: "", MinOS: "", Notes: "App-level responsibility; submit via in-app support flow"},
			"geolocation_opt_in":     {Framework: "none", APIClass: "", MinOS: "", Notes: "CLLocationManager authorization is per-app; no blanket toggle"},

			// --- Specialized compliance ---
			"csam_reporting":             {Framework: "none", APIClass: "", MinOS: "", Notes: "Apple handles CSAM detection server-side in iCloud Photos"},
			"library_filter_compliance":  {Framework: "ManagedSettings", APIClass: "ManagedSettingsStore.webContent", MinOS: "16.0", Notes: "Same as web content filtering — satisfies CIPA-style requirements"},
			"ai_minor_interaction":       {Framework: "none", APIClass: "", MinOS: "", Notes: "Platform-level — restrict AI apps via ManagedSettings blocks"},
			"social_media_min_age":       {Framework: "none", APIClass: "", MinOS: "", Notes: "Block social media BundleIDs via ManagedSettings for underage children"},
			"image_rights_minor":         {Framework: "none", APIClass: "", MinOS: "", Notes: "App-level enforcement — no Apple framework controls this"},

			// --- Parental / legislative (newest) ---
			"parental_consent_gate":        {Framework: "FamilyControls", APIClass: "AuthorizationCenter", MinOS: "16.0", Notes: "FamilyControls authorization acts as verifiable parental consent"},
			"parental_event_notification":  {Framework: "DeviceActivity", APIClass: "DeviceActivityMonitor", MinOS: "16.0", Notes: "Push parent notification when flagged events fire"},
			"screen_time_report":           {Framework: "DeviceActivity", APIClass: "DeviceActivityReport", MinOS: "16.0", Notes: "SwiftUI DeviceActivityReport extension generates usage summaries"},
			"commercial_data_ban":          {Framework: "none", APIClass: "", MinOS: "", Notes: "App/server-level policy — no Apple API"},
			"algorithmic_audit":            {Framework: "none", APIClass: "", MinOS: "", Notes: "Platform transparency requirement — no Apple enforcement API"},
		},
	}
}
