package google

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

const calendarBase = "https://www.googleapis.com/calendar/v3"

// ListEvents returns upcoming Google Calendar events.
func (c *Client) ListEvents(ctx context.Context, timeMin, timeMax time.Time, maxResults int, pageToken string) (*CalendarListResponse, error) {
	if maxResults <= 0 {
		maxResults = 50
	}

	params := url.Values{
		"maxResults":   {fmt.Sprintf("%d", maxResults)},
		"singleEvents": {"true"},
		"orderBy":      {"startTime"},
		"timeMin":      {timeMin.Format(time.RFC3339)},
	}
	if !timeMax.IsZero() {
		params.Set("timeMax", timeMax.Format(time.RFC3339))
	}
	if pageToken != "" {
		params.Set("pageToken", pageToken)
	}

	resp, err := c.doAuthenticatedRequest(ctx, http.MethodGet, calendarBase+"/calendars/primary/events?"+params.Encode(), nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("calendar list events: HTTP %d", resp.StatusCode)
	}

	var raw struct {
		Items         []calendarRawEvent `json:"items"`
		NextPageToken string             `json:"nextPageToken"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, err
	}

	result := &CalendarListResponse{
		NextPageToken: raw.NextPageToken,
	}
	for _, item := range raw.Items {
		result.Events = append(result.Events, parseCalendarEvent(&item))
	}

	return result, nil
}

// CreateEvent creates a new Google Calendar event.
func (c *Client) CreateEvent(ctx context.Context, event CalendarEvent) (*CalendarEvent, error) {
	payload := calendarCreatePayload{
		Summary:     event.Summary,
		Description: event.Description,
		Location:    event.Location,
		Start: calendarDateTime{
			DateTime: event.Start.Format(time.RFC3339),
		},
		End: calendarDateTime{
			DateTime: event.End.Format(time.RFC3339),
		},
	}

	for _, email := range event.Attendees {
		payload.Attendees = append(payload.Attendees, struct {
			Email string `json:"email"`
		}{Email: email})
	}

	body, _ := json.Marshal(payload)

	resp, err := c.doAuthenticatedRequest(ctx, http.MethodPost, calendarBase+"/calendars/primary/events?sendUpdates=all", body)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("calendar create event: HTTP %d", resp.StatusCode)
	}

	var raw calendarRawEvent
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, err
	}

	created := parseCalendarEvent(&raw)
	return &created, nil
}

// DeleteEvent deletes a Google Calendar event by ID.
func (c *Client) DeleteEvent(ctx context.Context, eventID string) error {
	resp, err := c.doAuthenticatedRequest(ctx, http.MethodDelete, calendarBase+"/calendars/primary/events/"+eventID, nil)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("calendar delete event: HTTP %d", resp.StatusCode)
	}
	return nil
}

// ── Internal helpers ────────────────────────────────────────────

type calendarRawEvent struct {
	ID          string `json:"id"`
	Summary     string `json:"summary"`
	Description string `json:"description"`
	Location    string `json:"location"`
	HtmlLink    string `json:"htmlLink"`
	Status      string `json:"status"`
	Start       struct {
		DateTime string `json:"dateTime"`
		Date     string `json:"date"`
	} `json:"start"`
	End struct {
		DateTime string `json:"dateTime"`
		Date     string `json:"date"`
	} `json:"end"`
	Attendees []struct {
		Email string `json:"email"`
	} `json:"attendees"`
}

type calendarDateTime struct {
	DateTime string `json:"dateTime"`
}

type calendarCreatePayload struct {
	Summary     string           `json:"summary"`
	Description string           `json:"description,omitempty"`
	Location    string           `json:"location,omitempty"`
	Start       calendarDateTime `json:"start"`
	End         calendarDateTime `json:"end"`
	Attendees   []struct {
		Email string `json:"email"`
	} `json:"attendees,omitempty"`
}

func parseCalendarEvent(raw *calendarRawEvent) CalendarEvent {
	ev := CalendarEvent{
		ID:          raw.ID,
		Summary:     raw.Summary,
		Description: raw.Description,
		Location:    raw.Location,
		HtmlLink:    raw.HtmlLink,
		Status:      raw.Status,
	}

	// Parse start time
	if raw.Start.DateTime != "" {
		if t, err := time.Parse(time.RFC3339, raw.Start.DateTime); err == nil {
			ev.Start = t
		}
	} else if raw.Start.Date != "" {
		if t, err := time.Parse("2006-01-02", raw.Start.Date); err == nil {
			ev.Start = t
		}
	}

	// Parse end time
	if raw.End.DateTime != "" {
		if t, err := time.Parse(time.RFC3339, raw.End.DateTime); err == nil {
			ev.End = t
		}
	} else if raw.End.Date != "" {
		if t, err := time.Parse("2006-01-02", raw.End.Date); err == nil {
			ev.End = t
		}
	}

	for _, a := range raw.Attendees {
		ev.Attendees = append(ev.Attendees, a.Email)
	}

	return ev
}
