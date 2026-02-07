package ratings

import (
	"github.com/guardiangate/api/internal/domain"
)

// AgeGroup defines an age range with its corresponding ratings.
type AgeGroup struct {
	MinAge int
	MaxAge int
	Label  string
}

// DefaultAgeGroups defines the standard age groupings.
var DefaultAgeGroups = []AgeGroup{
	{MinAge: 0, MaxAge: 6, Label: "Young Child"},
	{MinAge: 7, MaxAge: 9, Label: "Child"},
	{MinAge: 10, MaxAge: 12, Label: "Pre-Teen"},
	{MinAge: 13, MaxAge: 16, Label: "Teen"},
	{MinAge: 17, MaxAge: 17, Label: "Older Teen"},
	{MinAge: 18, MaxAge: 99, Label: "Adult"},
}

// GetAgeGroup returns the age group for a given age.
func GetAgeGroup(age int) AgeGroup {
	for _, g := range DefaultAgeGroups {
		if age >= g.MinAge && age <= g.MaxAge {
			return g
		}
	}
	return DefaultAgeGroups[len(DefaultAgeGroups)-1]
}

// RatingMap maps system IDs to their max rating code for a given age.
type RatingMap map[string]string

// DefaultAgeRatingMap provides the standard age-to-rating mapping.
var DefaultAgeRatingMap = map[AgeGroup]RatingMap{
	{0, 6, "Young Child"}: {
		"mpaa": "G",
		"tvpg": "TV-Y",
		"esrb": "E",
		"pegi": "3",
		"csm":  "5+",
	},
	{7, 9, "Child"}: {
		"mpaa": "PG",
		"tvpg": "TV-Y7",
		"esrb": "E",
		"pegi": "7",
		"csm":  "7+",
	},
	{10, 12, "Pre-Teen"}: {
		"mpaa": "PG",
		"tvpg": "TV-PG",
		"esrb": "E10+",
		"pegi": "7",
		"csm":  "10+",
	},
	{13, 16, "Teen"}: {
		"mpaa": "PG-13",
		"tvpg": "TV-14",
		"esrb": "T",
		"pegi": "12",
		"csm":  "13+",
	},
	{17, 17, "Older Teen"}: {
		"mpaa": "R",
		"tvpg": "TV-MA",
		"esrb": "M",
		"pegi": "16",
		"csm":  "17+",
	},
	{18, 99, "Adult"}: {
		"mpaa": "NC-17",
		"tvpg": "TV-MA",
		"esrb": "AO",
		"pegi": "18",
		"csm":  "18+",
	},
}

// GetRatingsForAge returns the appropriate rating codes for each system given an age.
func GetRatingsForAge(age int) RatingMap {
	group := GetAgeGroup(age)
	for g, ratings := range DefaultAgeRatingMap {
		if g.MinAge == group.MinAge && g.MaxAge == group.MaxAge {
			return ratings
		}
	}
	return RatingMap{}
}

// IsAllowed checks if a given rating is allowed for the specified maximum rating
// within the same rating system.
func IsAllowed(contentRating domain.Rating, maxRating domain.Rating) bool {
	if contentRating.SystemID != maxRating.SystemID {
		return false
	}
	return contentRating.RestrictiveIdx <= maxRating.RestrictiveIdx
}

// CompareRestrictiveness compares two ratings (-1 = a less restrictive, 0 = equal, 1 = a more restrictive).
func CompareRestrictiveness(a, b domain.Rating) int {
	if a.RestrictiveIdx < b.RestrictiveIdx {
		return -1
	}
	if a.RestrictiveIdx > b.RestrictiveIdx {
		return 1
	}
	return 0
}
