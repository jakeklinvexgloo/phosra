package apple

// AppCategoryMap maps a Phosra abstract category to Apple-specific identifiers.
type AppCategoryMap struct {
	AppStoreCategory string   `json:"app_store_category,omitempty"`
	BundleIDs        []string `json:"bundle_ids"`
	WebDomains       []string `json:"web_domains,omitempty"`
}

// ApplePlatformMappings contains Phosra → Apple identifier translations.
type ApplePlatformMappings struct {
	AgeRatings    map[string]string          `json:"age_ratings"`
	AppCategories map[string]AppCategoryMap  `json:"app_categories"`
	SystemApps    map[string]string          `json:"system_apps"`
	AlwaysAllowed []string                   `json:"always_allowed"`
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
	}
}
