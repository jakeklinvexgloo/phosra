package android

// AndroidCategoryMap maps a Phosra abstract category to Android-specific identifiers.
type AndroidCategoryMap struct {
	PlayStoreCategory string   `json:"play_store_category,omitempty"`
	PackageNames      []string `json:"package_names"`
	WebDomains        []string `json:"web_domains,omitempty"`
}

// CategoryFrameworkMapping tells the Android app which Android framework + API class
// to use when enforcing a given Phosra rule category.
type CategoryFrameworkMapping struct {
	Framework string `json:"framework"`            // "DevicePolicyManager", "UsageStatsManager", "VpnService", "AccessibilityService", etc.
	APIClass  string `json:"api_class"`            // e.g. "DevicePolicyManager.setPackagesSuspended", "UsageStatsManager.queryUsageStats"
	MinSDK    int    `json:"min_sdk"`              // minimum Android SDK version, e.g. 26 (Android 8.0)
	Notes     string `json:"notes,omitempty"`      // implementation hints
}

// AndroidPlatformMappings contains Phosra -> Android identifier translations.
type AndroidPlatformMappings struct {
	AgeRatings         map[string]string                    `json:"age_ratings"`
	AppCategories      map[string]AndroidCategoryMap        `json:"app_categories"`
	SystemApps         map[string]string                    `json:"system_apps"`
	AlwaysAllowed      []string                             `json:"always_allowed"`
	CategoryFrameworks map[string]CategoryFrameworkMapping   `json:"category_frameworks"`
}

// GetPlatformMappings returns the static mapping table for the Android platform.
func GetPlatformMappings() *AndroidPlatformMappings {
	return &AndroidPlatformMappings{
		AgeRatings: map[string]string{
			"G":     "RATING_3",
			"PG":    "RATING_7",
			"PG-13": "RATING_12",
			"R":     "RATING_16",
			"NC-17": "RATING_18",
			"TV-Y":  "RATING_3",
			"TV-Y7": "RATING_7",
			"TV-G":  "RATING_3",
			"TV-PG": "RATING_7",
			"TV-14": "RATING_12",
			"TV-MA": "RATING_18",
			"E":     "RATING_3",
			"E10+":  "RATING_7",
			"T":     "RATING_12",
			"M":     "RATING_16",
			"AO":    "RATING_18",
		},
		AppCategories: map[string]AndroidCategoryMap{
			"social-media": {
				PlayStoreCategory: "SOCIAL",
				PackageNames: []string{
					"com.instagram.android",
					"com.twitter.android",
					"com.snapchat.android",
					"com.zhiliaoapp.musically",
					"com.facebook.katana",
				},
			},
			"dating": {
				PackageNames: []string{
					"com.tinder",
					"com.bumble.app",
					"com.coffeemeetsbagel",
				},
			},
			"gambling": {
				PackageNames: []string{
					"com.draftkings.sportsbook",
					"com.fanduel.android.self",
				},
				WebDomains: []string{
					"draftkings.com",
					"fanduel.com",
					"betmgm.com",
				},
			},
			"messaging": {
				PackageNames: []string{
					"com.whatsapp",
					"org.telegram.messenger",
					"com.facebook.orca",
					"com.discord",
				},
			},
			"video-streaming": {
				PackageNames: []string{
					"com.google.android.youtube",
					"com.netflix.mediaclient",
					"com.disney.disneyplus",
					"com.amazon.avod.thirdpartyclient",
				},
			},
			"gaming": {
				PlayStoreCategory: "GAME",
				PackageNames:      []string{},
			},
		},
		SystemApps: map[string]string{
			"phone":    "com.google.android.dialer",
			"messages": "com.google.android.apps.messaging",
			"maps":     "com.google.android.apps.maps",
			"camera":   "com.google.android.GoogleCamera",
			"settings": "com.android.settings",
			"photos":   "com.google.android.apps.photos",
			"clock":    "com.google.android.deskclock",
			"find_my":  "com.google.android.apps.adm",
			"contacts": "com.google.android.contacts",
			"calendar": "com.google.android.calendar",
		},
		AlwaysAllowed: []string{
			"com.google.android.dialer",
			"com.google.android.apps.messaging",
			"com.google.android.apps.maps",
			"com.google.android.apps.adm",
			"com.android.settings",
		},
		CategoryFrameworks: map[string]CategoryFrameworkMapping{
			// --- Content ---
			"content_rating":           {Framework: "PackageManager", APIClass: "setApplicationRestrictions", MinSDK: 26, Notes: "Filter by Play Store content rating via managed configuration"},
			"content_block_title":      {Framework: "DevicePolicyManager", APIClass: "setPackagesSuspended", MinSDK: 28, Notes: "Suspend specific packages by name"},
			"content_allow_title":      {Framework: "DevicePolicyManager", APIClass: "setPackagesSuspended", MinSDK: 28, Notes: "Invert to allowlist — suspend all except allowed packages"},
			"content_allowlist_mode":   {Framework: "DevicePolicyManager", APIClass: "setUserRestriction", MinSDK: 26, Notes: "Set DISALLOW_INSTALL_APPS + allowlist specific packages"},
			"content_descriptor_block": {Framework: "none", APIClass: "", MinSDK: 0, Notes: "Content descriptor filtering handled server-side by Phosra"},

			// --- Time ---
			"time_daily_limit":     {Framework: "UsageStatsManager", APIClass: "queryUsageStats", MinSDK: 26, Notes: "Query cumulative usage via UsageStatsManager; enforce limit with AlarmManager.setExact to trigger lock"},
			"time_scheduled_hours": {Framework: "AlarmManager", APIClass: "setExact", MinSDK: 26, Notes: "Schedule start/end alarms for allowed usage windows"},
			"time_per_app_limit":   {Framework: "UsageStatsManager", APIClass: "queryUsageStats", MinSDK: 26, Notes: "Per-package usage tracking; suspend package when limit reached"},
			"time_downtime":        {Framework: "DevicePolicyManager", APIClass: "setLockTaskMode", MinSDK: 26, Notes: "Lock device to a single allowed app (or launcher) outside allowed hours via AlarmManager scheduling"},

			// --- Purchases ---
			"purchase_approval":    {Framework: "DevicePolicyManager", APIClass: "addUserRestriction", MinSDK: 26, Notes: "Set DISALLOW_INSTALL_APPS user restriction to require parental approval"},
			"purchase_spending_cap": {Framework: "none", APIClass: "", MinSDK: 0, Notes: "No Android API — spending cap tracked server-side by Phosra"},
			"purchase_block_iap":   {Framework: "DevicePolicyManager", APIClass: "addUserRestriction", MinSDK: 26, Notes: "Set DISALLOW_INSTALL_APPS to prevent app installs; IAP blocking requires app-level enforcement"},

			// --- Social ---
			"social_contacts":    {Framework: "ContentResolver", APIClass: "ContactsContract", MinSDK: 26, Notes: "Manage contact restrictions via ContactsContract content provider"},
			"social_chat_control": {Framework: "AccessibilityService", APIClass: "onAccessibilityEvent", MinSDK: 26, Notes: "Monitor messaging app activity via accessibility events; block or alert on flagged interactions"},
			"social_multiplayer": {Framework: "DevicePolicyManager", APIClass: "setApplicationRestrictions", MinSDK: 26, Notes: "Apply managed configuration to restrict multiplayer features in games"},

			// --- Web ---
			"web_safesearch":       {Framework: "VpnService", APIClass: "DNS override", MinSDK: 26, Notes: "Local VPN intercepts DNS; force SafeSearch IPs for Google/Bing/YouTube"},
			"web_category_block":   {Framework: "VpnService", APIClass: "DNS filtering", MinSDK: 26, Notes: "Local VPN filters DNS by category using blocklist database"},
			"web_custom_allowlist": {Framework: "VpnService", APIClass: "DNS allowlist", MinSDK: 26, Notes: "Local VPN permits only allowlisted domains"},
			"web_custom_blocklist": {Framework: "VpnService", APIClass: "DNS blocklist", MinSDK: 26, Notes: "Local VPN blocks specific domains via DNS sinkhole"},
			"web_filter_level":     {Framework: "VpnService", APIClass: "DNS filter level", MinSDK: 26, Notes: "Map filter level to DNS blocklist strictness: strict=allowlist-only, moderate=category block, off=passthrough"},

			// --- Privacy ---
			"privacy_location":           {Framework: "ContentResolver", APIClass: "Settings.Secure", MinSDK: 26, Notes: "Toggle location mode via Settings.Secure.LOCATION_MODE with DevicePolicyManager"},
			"privacy_profile_visibility": {Framework: "none", APIClass: "", MinSDK: 0, Notes: "App-level concern — no Android framework controls profile visibility"},
			"privacy_data_sharing":       {Framework: "DevicePolicyManager", APIClass: "setApplicationRestrictions", MinSDK: 26, Notes: "Apply managed app config to restrict data sharing features"},
			"privacy_account_creation":   {Framework: "DevicePolicyManager", APIClass: "addUserRestriction", MinSDK: 26, Notes: "Set DISALLOW_MODIFY_ACCOUNTS user restriction to prevent new account creation"},

			// --- Monitoring ---
			"monitoring_activity": {Framework: "UsageStatsManager", APIClass: "queryUsageStats", MinSDK: 26, Notes: "Aggregate app usage data via UsageStatsManager for parent dashboard"},
			"monitoring_alerts":   {Framework: "NotificationListenerService", APIClass: "onNotificationPosted", MinSDK: 26, Notes: "Monitor child device notifications; forward flagged alerts to parent app"},

			// --- Engagement / Addictive design ---
			"algo_feed_control":        {Framework: "AccessibilityService", APIClass: "onAccessibilityEvent", MinSDK: 26, Notes: "Detect algorithmic feed scrolling in social apps; overlay usage warning or block"},
			"addictive_design_control": {Framework: "AccessibilityService", APIClass: "onAccessibilityEvent", MinSDK: 26, Notes: "Detect infinite scroll, autoplay patterns; overlay intervention UI"},

			// --- Notifications ---
			"notification_curfew":      {Framework: "NotificationListenerService", APIClass: "cancelNotification", MinSDK: 26, Notes: "Intercept and cancel notifications during curfew hours via NotificationListenerService"},
			"usage_timer_notification": {Framework: "AlarmManager", APIClass: "setExact", MinSDK: 26, Notes: "Schedule alarm at usage threshold; fire NotificationManager.notify to alert child/parent"},

			// --- Advertising & Data ---
			"targeted_ad_block": {Framework: "VpnService", APIClass: "DNS ad blocking", MinSDK: 26, Notes: "Local VPN blocks known ad/tracker domains via DNS sinkhole"},
			"dm_restriction":    {Framework: "AccessibilityService", APIClass: "onAccessibilityEvent", MinSDK: 26, Notes: "Monitor DM activity in messaging apps; block or alert on restricted interactions"},
			"age_gate":          {Framework: "none", APIClass: "", MinSDK: 0, Notes: "Age verification enforced server-side by Phosra; no Android API"},
			"data_deletion_request": {Framework: "none", APIClass: "", MinSDK: 0, Notes: "Data deletion handled server-side; submit via Phosra app support flow"},
			"geolocation_opt_in":    {Framework: "ContentResolver", APIClass: "Settings.Secure", MinSDK: 26, Notes: "Toggle per-app location permission via AppOpsManager or Settings.Secure"},

			// --- Specialized compliance ---
			"csam_reporting":            {Framework: "none", APIClass: "", MinSDK: 0, Notes: "CSAM detection/reporting handled server-side; Google SafeSearch integration via VPN"},
			"library_filter_compliance": {Framework: "VpnService", APIClass: "DNS filtering", MinSDK: 26, Notes: "Web content filtering via local VPN satisfies CIPA-style requirements"},
			"ai_minor_interaction":      {Framework: "AccessibilityService", APIClass: "onAccessibilityEvent", MinSDK: 26, Notes: "Monitor and restrict AI app interactions via accessibility service"},
			"social_media_min_age":      {Framework: "DevicePolicyManager", APIClass: "setPackagesSuspended", MinSDK: 28, Notes: "Suspend social media packages for underage children"},
			"image_rights_minor":        {Framework: "none", APIClass: "", MinSDK: 0, Notes: "Image rights enforcement is app-level — no Android framework controls this"},

			// --- Parental / legislative (newest) ---
			"parental_consent_gate":       {Framework: "none", APIClass: "", MinSDK: 0, Notes: "Parental consent gate handled via Phosra app UI flow; no Android framework needed"},
			"parental_event_notification": {Framework: "NotificationManager", APIClass: "notify", MinSDK: 26, Notes: "Push notification to parent device when flagged events are detected"},
			"screen_time_report":          {Framework: "UsageStatsManager", APIClass: "queryUsageStats", MinSDK: 26, Notes: "Aggregate usage data into reports for parent dashboard"},
			"commercial_data_ban":         {Framework: "none", APIClass: "", MinSDK: 0, Notes: "Commercial data ban enforced server-side by Phosra; no Android API"},
			"algorithmic_audit":           {Framework: "none", APIClass: "", MinSDK: 0, Notes: "Algorithmic transparency requirement — no Android enforcement API"},
		},
	}
}
