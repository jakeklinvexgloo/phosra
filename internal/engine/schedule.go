package engine

import (
	"encoding/json"
	"time"
)

// Schedule represents allowed usage times.
type Schedule struct {
	Weekday TimeRange `json:"weekday"`
	Weekend TimeRange `json:"weekend"`
}

// TimeRange defines a start and end time.
type TimeRange struct {
	Start string `json:"start"` // HH:MM format
	End   string `json:"end"`   // HH:MM format
}

// IsAllowed checks if the given time falls within the schedule.
func (s *Schedule) IsAllowed(t time.Time) bool {
	var tr TimeRange
	if t.Weekday() == time.Saturday || t.Weekday() == time.Sunday {
		tr = s.Weekend
	} else {
		tr = s.Weekday
	}

	startH, startM := parseTime(tr.Start)
	endH, endM := parseTime(tr.End)

	currentMinutes := t.Hour()*60 + t.Minute()
	startMinutes := startH*60 + startM
	endMinutes := endH*60 + endM

	return currentMinutes >= startMinutes && currentMinutes <= endMinutes
}

func parseTime(s string) (int, int) {
	t, err := time.Parse("15:04", s)
	if err != nil {
		return 0, 0
	}
	return t.Hour(), t.Minute()
}

// ParseScheduleConfig extracts a Schedule from a rule's JSONB config.
func ParseScheduleConfig(config json.RawMessage) (*Schedule, error) {
	var wrapper struct {
		Schedule Schedule `json:"schedule"`
	}
	if err := json.Unmarshal(config, &wrapper); err != nil {
		return nil, err
	}
	return &wrapper.Schedule, nil
}
