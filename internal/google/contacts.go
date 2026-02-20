package google

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

const peopleBase = "https://people.googleapis.com/v1"

// ListContacts returns a page of Google Contacts via the People API.
func (c *Client) ListContacts(ctx context.Context, pageSize int, pageToken string) (*ContactListResponse, error) {
	if pageSize <= 0 {
		pageSize = 100
	}

	params := url.Values{
		"pageSize":    {fmt.Sprintf("%d", pageSize)},
		"personFields": {"names,emailAddresses,phoneNumbers,organizations"},
		"sortOrder":   {"LAST_MODIFIED_DESCENDING"},
	}
	if pageToken != "" {
		params.Set("pageToken", pageToken)
	}

	resp, err := c.doAuthenticatedRequest(ctx, http.MethodGet, peopleBase+"/people/me/connections?"+params.Encode(), nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("people list contacts: HTTP %d", resp.StatusCode)
	}

	var raw struct {
		Connections   []peopleRawPerson `json:"connections"`
		NextPageToken string            `json:"nextPageToken"`
		TotalPeople   int               `json:"totalPeople"`
		TotalItems    int               `json:"totalItems"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, err
	}

	result := &ContactListResponse{
		NextPageToken: raw.NextPageToken,
		TotalPeople:   raw.TotalPeople,
	}
	if raw.TotalPeople == 0 {
		result.TotalPeople = raw.TotalItems
	}

	for _, p := range raw.Connections {
		result.Contacts = append(result.Contacts, parsePerson(&p))
	}

	return result, nil
}

// SearchContacts searches Google Contacts by query string.
func (c *Client) SearchContacts(ctx context.Context, query string, pageSize int) ([]GoogleContact, error) {
	if pageSize <= 0 {
		pageSize = 30
	}

	params := url.Values{
		"query":       {query},
		"pageSize":    {fmt.Sprintf("%d", pageSize)},
		"readMask":    {"names,emailAddresses,phoneNumbers,organizations"},
	}

	resp, err := c.doAuthenticatedRequest(ctx, http.MethodGet, peopleBase+"/people:searchContacts?"+params.Encode(), nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("people search contacts: HTTP %d", resp.StatusCode)
	}

	var raw struct {
		Results []struct {
			Person peopleRawPerson `json:"person"`
		} `json:"results"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, err
	}

	var contacts []GoogleContact
	for _, r := range raw.Results {
		contacts = append(contacts, parsePerson(&r.Person))
	}

	return contacts, nil
}

// ── Internal helpers ────────────────────────────────────────────

type peopleRawPerson struct {
	ResourceName  string `json:"resourceName"`
	Names         []struct {
		DisplayName string `json:"displayName"`
	} `json:"names"`
	EmailAddresses []struct {
		Value string `json:"value"`
	} `json:"emailAddresses"`
	PhoneNumbers []struct {
		Value string `json:"value"`
	} `json:"phoneNumbers"`
	Organizations []struct {
		Name  string `json:"name"`
		Title string `json:"title"`
	} `json:"organizations"`
}

func parsePerson(p *peopleRawPerson) GoogleContact {
	c := GoogleContact{
		ResourceName: p.ResourceName,
	}
	if len(p.Names) > 0 {
		c.Name = p.Names[0].DisplayName
	}
	if len(p.EmailAddresses) > 0 {
		c.Email = p.EmailAddresses[0].Value
	}
	if len(p.PhoneNumbers) > 0 {
		c.Phone = p.PhoneNumbers[0].Value
	}
	if len(p.Organizations) > 0 {
		c.Org = p.Organizations[0].Name
		c.Title = p.Organizations[0].Title
	}
	return c
}
