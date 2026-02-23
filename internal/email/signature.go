package email

import "strings"

// SignatureParams holds all fields for the branded email signature.
type SignatureParams struct {
	Name     string
	Title    string
	Email    string
	Phone    string
	LinkedIn string
}

// WrapWithSignature converts a plain-text email body into a full HTML
// document with a dark-mode premium Phosra signature block appended.
// Dark navy (#0D1B2A) background with brand green (#00D47E) accents —
// matching the Phosra website hero aesthetic.
func WrapWithSignature(body string, p SignatureParams) string {
	escaped := escapeHTML(body)
	escaped = strings.ReplaceAll(escaped, "\n", "<br>")

	var b strings.Builder
	b.WriteString(`<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222;">`)
	b.WriteString(`<div>`)
	b.WriteString(escaped)
	b.WriteString(`</div>`)

	// ── Spacer before signature ──────────────────────────────────
	b.WriteString(`<br><br>`)

	// ── Outer container ──────────────────────────────────────────
	b.WriteString(`<table cellpadding="0" cellspacing="0" border="0" width="480" style="font-family:Arial,Helvetica,sans-serif;max-width:480px;">`)
	b.WriteString(`<tr>`)
	b.WriteString(`<td bgcolor="#0D1B2A" style="background-color:#0D1B2A;border-radius:10px;padding:0;overflow:hidden;">`)

	// ── Green accent bar (top edge) ──────────────────────────────
	b.WriteString(`<table cellpadding="0" cellspacing="0" border="0" width="100%">`)
	b.WriteString(`<tr>`)
	b.WriteString(`<td bgcolor="#00D47E" style="background-color:#00D47E;height:3px;line-height:3px;font-size:1px;" height="3">&nbsp;</td>`)
	b.WriteString(`</tr>`)
	b.WriteString(`</table>`)

	// ── Logo header zone ─────────────────────────────────────────
	b.WriteString(`<table cellpadding="0" cellspacing="0" border="0" width="100%">`)
	b.WriteString(`<tr>`)
	b.WriteString(`<td bgcolor="#0F2035" style="background-color:#0F2035;padding:22px 28px 18px 28px;">`)
	b.WriteString(`<img src="https://phosra.com/logo-white.svg" width="130" alt="Phosra" style="display:block;border:0;" />`)
	b.WriteString(`</td>`)
	b.WriteString(`</tr>`)
	b.WriteString(`</table>`)

	// ── Person info section ──────────────────────────────────────
	b.WriteString(`<table cellpadding="0" cellspacing="0" border="0" width="100%">`)
	b.WriteString(`<tr>`)
	b.WriteString(`<td style="padding:20px 28px 6px 28px;">`)

	// Name
	b.WriteString(`<div style="font-size:17px;font-weight:700;color:#FFFFFF;letter-spacing:-0.01em;line-height:1.2;">`)
	b.WriteString(escapeHTML(p.Name))
	b.WriteString(`</div>`)

	// Title + Company
	if p.Title != "" {
		b.WriteString(`<div style="margin-top:4px;font-size:13px;color:#8B9BB4;line-height:1.3;">`)
		b.WriteString(escapeHTML(p.Title))
		b.WriteString(` `)
		b.WriteString(`<span style="color:#2A4A6B;">|</span>`)
		b.WriteString(` `)
		b.WriteString(`<span style="color:#00D47E;font-weight:600;">Phosra</span>`)
		b.WriteString(`</div>`)
	}

	b.WriteString(`</td>`)
	b.WriteString(`</tr>`)
	b.WriteString(`</table>`)

	// ── Separator ────────────────────────────────────────────────
	b.WriteString(`<table cellpadding="0" cellspacing="0" border="0" width="100%">`)
	b.WriteString(`<tr>`)
	b.WriteString(`<td style="padding:0 28px;">`)
	b.WriteString(`<table cellpadding="0" cellspacing="0" border="0" width="100%">`)
	b.WriteString(`<tr><td style="border-top:1px solid #1C3148;line-height:1px;font-size:1px;padding-top:0;" height="1">&nbsp;</td></tr>`)
	b.WriteString(`</table>`)
	b.WriteString(`</td>`)
	b.WriteString(`</tr>`)
	b.WriteString(`</table>`)

	// ── Contact details ──────────────────────────────────────────
	b.WriteString(`<table cellpadding="0" cellspacing="0" border="0" width="100%">`)
	b.WriteString(`<tr>`)
	b.WriteString(`<td style="padding:14px 28px 0 28px;">`)

	// Email row
	if p.Email != "" {
		b.WriteString(`<table cellpadding="0" cellspacing="0" border="0">`)
		b.WriteString(`<tr>`)
		b.WriteString(`<td style="vertical-align:middle;padding-right:10px;font-size:8px;color:#00D47E;line-height:1;">&#9679;</td>`)
		b.WriteString(`<td style="font-size:13px;line-height:1;">`)
		b.WriteString(`<a href="mailto:`)
		b.WriteString(escapeHTML(p.Email))
		b.WriteString(`" style="color:#C8D6E5;text-decoration:none;">`)
		b.WriteString(escapeHTML(p.Email))
		b.WriteString(`</a>`)
		b.WriteString(`</td>`)
		b.WriteString(`</tr>`)
		b.WriteString(`</table>`)
	}

	// Phone row
	if p.Phone != "" {
		b.WriteString(`<table cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">`)
		b.WriteString(`<tr>`)
		b.WriteString(`<td style="vertical-align:middle;padding-right:10px;font-size:8px;color:#00D47E;line-height:1;">&#9679;</td>`)
		b.WriteString(`<td style="font-size:13px;line-height:1;">`)
		b.WriteString(`<a href="tel:`)
		b.WriteString(escapeHTML(p.Phone))
		b.WriteString(`" style="color:#C8D6E5;text-decoration:none;">`)
		b.WriteString(escapeHTML(p.Phone))
		b.WriteString(`</a>`)
		b.WriteString(`</td>`)
		b.WriteString(`</tr>`)
		b.WriteString(`</table>`)
	}

	b.WriteString(`</td>`)
	b.WriteString(`</tr>`)
	b.WriteString(`</table>`)

	// ── Action buttons ───────────────────────────────────────────
	b.WriteString(`<table cellpadding="0" cellspacing="0" border="0" width="100%">`)
	b.WriteString(`<tr>`)
	b.WriteString(`<td style="padding:16px 28px 0 28px;">`)

	b.WriteString(`<table cellpadding="0" cellspacing="0" border="0">`)
	b.WriteString(`<tr>`)

	// Primary CTA: phosra.com — filled green button
	b.WriteString(`<td>`)
	b.WriteString(`<a href="https://phosra.com" style="display:inline-block;padding:6px 16px;font-size:11px;font-weight:700;color:#0D1B2A;text-decoration:none;border-radius:4px;" bgcolor="#00D47E">`)
	b.WriteString(`phosra.com</a>`)
	b.WriteString(`</td>`)

	// Spacer
	b.WriteString(`<td style="width:8px;" width="8">&nbsp;</td>`)

	// Secondary: LinkedIn — ghost/outline button
	if p.LinkedIn != "" {
		linkedInURL := p.LinkedIn
		if !strings.HasPrefix(linkedInURL, "http") {
			linkedInURL = "https://" + linkedInURL
		}
		b.WriteString(`<td>`)
		b.WriteString(`<a href="`)
		b.WriteString(escapeHTML(linkedInURL))
		b.WriteString(`" style="display:inline-block;padding:6px 16px;font-size:11px;font-weight:600;color:#00D47E;text-decoration:none;border:1px solid #1C3148;border-radius:4px;">LinkedIn</a>`)
		b.WriteString(`</td>`)
	}

	b.WriteString(`</tr>`)
	b.WriteString(`</table>`)

	b.WriteString(`</td>`)
	b.WriteString(`</tr>`)
	b.WriteString(`</table>`)

	// ── Tagline footer ───────────────────────────────────────────
	b.WriteString(`<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:18px;">`)
	b.WriteString(`<tr>`)
	b.WriteString(`<td bgcolor="#091422" style="background-color:#091422;padding:12px 28px;border-radius:0 0 10px 10px;">`)

	b.WriteString(`<table cellpadding="0" cellspacing="0" border="0" width="100%">`)
	b.WriteString(`<tr>`)
	b.WriteString(`<td style="vertical-align:middle;">`)
	b.WriteString(`<div style="font-size:11px;font-style:italic;color:#00D47E;letter-spacing:0.03em;line-height:1;">`)
	b.WriteString(`Define once, protect everywhere.`)
	b.WriteString(`</div>`)
	b.WriteString(`</td>`)
	b.WriteString(`<td style="vertical-align:middle;text-align:right;width:24px;" width="24">`)
	b.WriteString(`<img src="https://phosra.com/mark.svg" width="18" height="18" alt="" style="display:block;border:0;opacity:0.4;" />`)
	b.WriteString(`</td>`)
	b.WriteString(`</tr>`)
	b.WriteString(`</table>`)

	b.WriteString(`</td>`)
	b.WriteString(`</tr>`)
	b.WriteString(`</table>`)

	b.WriteString(`</td>`) // end dark container td
	b.WriteString(`</tr>`)
	b.WriteString(`</table>`) // end outer table

	// ── Confidentiality notice ───────────────────────────────────
	b.WriteString(`<div style="margin-top:14px;font-size:10px;color:#999;line-height:1.5;max-width:480px;">`)
	b.WriteString(`<strong>CONFIDENTIALITY NOTICE:</strong> This email and any attachments are for the exclusive `)
	b.WriteString(`and confidential use of the intended recipient. If you are not the intended recipient, please `)
	b.WriteString(`do not read, distribute, or take action based on this message. Please notify the sender and `)
	b.WriteString(`delete this email immediately. Phosra, Inc. &middot; `)
	b.WriteString(`<a href="https://phosra.com/privacy" style="color:#999;text-decoration:underline;">Privacy Policy</a>`)
	b.WriteString(`</div>`)

	b.WriteString(`</body></html>`)
	return b.String()
}

func escapeHTML(s string) string {
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	return s
}
