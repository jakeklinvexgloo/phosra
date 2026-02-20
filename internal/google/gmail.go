package google

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
)

const gmailBase = "https://gmail.googleapis.com/gmail/v1/users/me"

// ListMessages returns a page of Gmail messages matching the given query.
func (c *Client) ListMessages(ctx context.Context, query string, maxResults int, pageToken string) (*GmailListResponse, error) {
	if maxResults <= 0 {
		maxResults = 20
	}

	params := url.Values{
		"maxResults": {fmt.Sprintf("%d", maxResults)},
	}
	if query != "" {
		params.Set("q", query)
	}
	if pageToken != "" {
		params.Set("pageToken", pageToken)
	}

	resp, err := c.doAuthenticatedRequest(ctx, http.MethodGet, gmailBase+"/messages?"+params.Encode(), nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gmail list messages: HTTP %d", resp.StatusCode)
	}

	var listResp struct {
		Messages      []struct{ ID, ThreadID string } `json:"messages"`
		NextPageToken string                          `json:"nextPageToken"`
		ResultSizeEstimate int                        `json:"resultSizeEstimate"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&listResp); err != nil {
		return nil, err
	}

	// Fetch metadata for each message (batch-style, one by one for simplicity)
	result := &GmailListResponse{
		NextPageToken: listResp.NextPageToken,
		TotalEstimate: listResp.ResultSizeEstimate,
	}

	for _, m := range listResp.Messages {
		msg, err := c.getMessageMetadata(ctx, m.ID)
		if err != nil {
			continue // skip individual failures
		}
		result.Messages = append(result.Messages, *msg)
	}

	return result, nil
}

// GetMessage returns a full Gmail message including body.
func (c *Client) GetMessage(ctx context.Context, messageID string) (*GmailMessage, error) {
	resp, err := c.doAuthenticatedRequest(ctx, http.MethodGet, gmailBase+"/messages/"+messageID+"?format=full", nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gmail get message: HTTP %d", resp.StatusCode)
	}

	var raw gmailRawMessage
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, err
	}

	return parseFullMessage(&raw), nil
}

// GetThread returns all messages in a Gmail thread.
func (c *Client) GetThread(ctx context.Context, threadID string) ([]GmailMessage, error) {
	resp, err := c.doAuthenticatedRequest(ctx, http.MethodGet, gmailBase+"/threads/"+threadID+"?format=full", nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gmail get thread: HTTP %d", resp.StatusCode)
	}

	var threadResp struct {
		Messages []gmailRawMessage `json:"messages"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&threadResp); err != nil {
		return nil, err
	}

	var messages []GmailMessage
	for _, raw := range threadResp.Messages {
		messages = append(messages, *parseFullMessage(&raw))
	}
	return messages, nil
}

// SendMessage sends an email via Gmail.
func (c *Client) SendMessage(ctx context.Context, to, subject, body string, replyToMessageID string) (*GmailSendResponse, error) {
	// Build RFC 2822 message
	var msg strings.Builder
	msg.WriteString(fmt.Sprintf("To: %s\r\n", to))
	msg.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	msg.WriteString("Content-Type: text/html; charset=UTF-8\r\n")

	if replyToMessageID != "" {
		// Fetch the original message to get Message-ID header for threading
		origMsg, err := c.GetMessage(ctx, replyToMessageID)
		if err == nil && origMsg.ThreadID != "" {
			msg.WriteString(fmt.Sprintf("In-Reply-To: %s\r\n", replyToMessageID))
			msg.WriteString(fmt.Sprintf("References: %s\r\n", replyToMessageID))
		}
	}

	msg.WriteString("\r\n")
	msg.WriteString(body)

	// Base64url encode the message
	encoded := base64.URLEncoding.EncodeToString([]byte(msg.String()))

	payload := struct {
		Raw      string `json:"raw"`
		ThreadID string `json:"threadId,omitempty"`
	}{
		Raw: encoded,
	}

	payloadBytes, _ := json.Marshal(payload)

	resp, err := c.doAuthenticatedRequest(ctx, http.MethodPost, gmailBase+"/messages/send", payloadBytes)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gmail send message: HTTP %d", resp.StatusCode)
	}

	var sendResp struct {
		ID       string `json:"id"`
		ThreadID string `json:"threadId"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&sendResp); err != nil {
		return nil, err
	}

	return &GmailSendResponse{
		ID:       sendResp.ID,
		ThreadID: sendResp.ThreadID,
	}, nil
}

// SearchMessages is an alias for ListMessages with a search query.
func (c *Client) SearchMessages(ctx context.Context, query string, maxResults int) (*GmailListResponse, error) {
	return c.ListMessages(ctx, query, maxResults, "")
}

// ── Internal helpers ────────────────────────────────────────────

// getMessageMetadata fetches a single message with metadata format (no body).
func (c *Client) getMessageMetadata(ctx context.Context, messageID string) (*GmailMessage, error) {
	resp, err := c.doAuthenticatedRequest(ctx, http.MethodGet, gmailBase+"/messages/"+messageID+"?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date", nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gmail get message metadata: HTTP %d", resp.StatusCode)
	}

	var raw gmailRawMessage
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, err
	}

	return parseMetadataMessage(&raw), nil
}

// gmailRawMessage is the raw Gmail API response for a message.
type gmailRawMessage struct {
	ID       string `json:"id"`
	ThreadID string `json:"threadId"`
	LabelIDs []string `json:"labelIds"`
	Snippet  string `json:"snippet"`
	Payload  struct {
		Headers []struct {
			Name  string `json:"name"`
			Value string `json:"value"`
		} `json:"headers"`
		MimeType string `json:"mimeType"`
		Body     struct {
			Data string `json:"data"`
			Size int    `json:"size"`
		} `json:"body"`
		Parts []struct {
			MimeType string `json:"mimeType"`
			Body     struct {
				Data string `json:"data"`
				Size int    `json:"size"`
			} `json:"body"`
			Parts []struct {
				MimeType string `json:"mimeType"`
				Body     struct {
					Data string `json:"data"`
				} `json:"body"`
			} `json:"parts"`
		} `json:"parts"`
	} `json:"payload"`
	InternalDate string `json:"internalDate"`
}

func getHeader(raw *gmailRawMessage, name string) string {
	for _, h := range raw.Payload.Headers {
		if strings.EqualFold(h.Name, name) {
			return h.Value
		}
	}
	return ""
}

func parseMetadataMessage(raw *gmailRawMessage) *GmailMessage {
	from := getHeader(raw, "From")
	to := strings.Split(getHeader(raw, "To"), ",")
	for i := range to {
		to[i] = strings.TrimSpace(to[i])
	}

	return &GmailMessage{
		ID:       raw.ID,
		ThreadID: raw.ThreadID,
		From:     from,
		To:       to,
		Subject:  getHeader(raw, "Subject"),
		Snippet:  raw.Snippet,
		Date:     getHeader(raw, "Date"),
		LabelIDs: raw.LabelIDs,
	}
}

func parseFullMessage(raw *gmailRawMessage) *GmailMessage {
	msg := parseMetadataMessage(raw)

	// Extract body from payload
	bodyHTML, bodyText := extractBody(raw)
	msg.BodyHTML = bodyHTML
	msg.BodyText = bodyText

	// Check for attachments
	for _, part := range raw.Payload.Parts {
		if part.MimeType != "" && !strings.HasPrefix(part.MimeType, "text/") && !strings.HasPrefix(part.MimeType, "multipart/") {
			msg.HasAttachments = true
			break
		}
	}

	return msg
}

func extractBody(raw *gmailRawMessage) (html, text string) {
	// Simple single-part message
	if raw.Payload.Body.Data != "" {
		decoded := decodeBase64URL(raw.Payload.Body.Data)
		if strings.Contains(raw.Payload.MimeType, "html") {
			return decoded, ""
		}
		return "", decoded
	}

	// Multipart message
	for _, part := range raw.Payload.Parts {
		if part.MimeType == "text/html" && part.Body.Data != "" {
			html = decodeBase64URL(part.Body.Data)
		}
		if part.MimeType == "text/plain" && part.Body.Data != "" {
			text = decodeBase64URL(part.Body.Data)
		}
		// Nested multipart (e.g. multipart/alternative inside multipart/mixed)
		for _, sub := range part.Parts {
			if sub.MimeType == "text/html" && sub.Body.Data != "" {
				html = decodeBase64URL(sub.Body.Data)
			}
			if sub.MimeType == "text/plain" && sub.Body.Data != "" {
				text = decodeBase64URL(sub.Body.Data)
			}
		}
	}

	return html, text
}

func decodeBase64URL(s string) string {
	// Gmail uses base64url encoding (no padding)
	s = strings.ReplaceAll(s, "-", "+")
	s = strings.ReplaceAll(s, "_", "/")
	// Add padding
	switch len(s) % 4 {
	case 2:
		s += "=="
	case 3:
		s += "="
	}
	decoded, err := base64.StdEncoding.DecodeString(s)
	if err != nil {
		return ""
	}
	return string(decoded)
}
