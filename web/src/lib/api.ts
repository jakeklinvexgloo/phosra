const DIRECT_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

class ApiClient {
  /** Direct backend URL (for server-side or explicit token usage) */
  private directBaseUrl: string
  /** Proxy URL (same-origin, cookies forwarded automatically) */
  private proxyBaseUrl: string

  constructor(backendUrl: string) {
    this.directBaseUrl = `${backendUrl}/api/v1`
    this.proxyBaseUrl = "/api/backend"
  }

  /**
   * Make an API request.
   *
   * When called from the browser without an explicit token, routes through
   * the Next.js proxy at /api/backend/* which reads the Stytch session JWT
   * from the HttpOnly cookie and forwards it to the Go backend.
   *
   * When an explicit token is provided (server-side calls), hits the
   * Go backend directly.
   */
  async fetch(path: string, options: RequestInit = {}, token?: string): Promise<any> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    }

    // Sandbox mode: send X-Sandbox-Session header instead of auth token (dev only)
    const isSandboxEnabled = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true"
    const sandboxSession = isSandboxEnabled && typeof window !== "undefined" ? localStorage.getItem("sandbox-session") : null

    let url: string
    if (sandboxSession) {
      // Sandbox: hit backend directly with sandbox header
      headers["X-Sandbox-Session"] = sandboxSession
      url = `${this.directBaseUrl}${path}`
    } else if (token) {
      // Explicit token: hit backend directly
      headers["Authorization"] = `Bearer ${token}`
      url = `${this.directBaseUrl}${path}`
    } else if (typeof window !== "undefined") {
      // Browser without explicit token: use proxy (cookie-based auth)
      url = `${this.proxyBaseUrl}${path}`
    } else {
      // Server-side without token: hit backend directly (will likely 401)
      url = `${this.directBaseUrl}${path}`
    }

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: typeof window !== "undefined" && !token ? "same-origin" : undefined,
    })

    if (res.status === 401) {
      throw new Error("Session expired")
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(body.message || body.error || res.statusText)
    }

    return res.status === 204 ? null : res.json()
  }

  // Families
  async listFamilies(token?: string) { return this.fetch("/families", {}, token) }
  async createFamily(name: string, token?: string) { return this.fetch("/families", { method: "POST", body: JSON.stringify({ name }) }, token) }
  async getFamily(id: string, token?: string) { return this.fetch(`/families/${id}`, {}, token) }
  async updateFamily(id: string, name: string, token?: string) { return this.fetch(`/families/${id}`, { method: "PUT", body: JSON.stringify({ name }) }, token) }
  async deleteFamily(id: string, token?: string) { return this.fetch(`/families/${id}`, { method: "DELETE" }, token) }
  async listMembers(familyId: string, token?: string) { return this.fetch(`/families/${familyId}/members`, {}, token) }
  async addMember(familyId: string, userId: string, role: string, token?: string) { return this.fetch(`/families/${familyId}/members`, { method: "POST", body: JSON.stringify({ user_id: userId, role }) }, token) }

  // Children
  async listChildren(familyId: string, token?: string) { return this.fetch(`/families/${familyId}/children`, {}, token) }
  async createChild(familyId: string, name: string, birthDate: string, token?: string) { return this.fetch(`/families/${familyId}/children`, { method: "POST", body: JSON.stringify({ name, birth_date: birthDate }) }, token) }
  async getChild(id: string, token?: string) { return this.fetch(`/children/${id}`, {}, token) }
  async updateChild(id: string, name: string, birthDate: string, token?: string) { return this.fetch(`/children/${id}`, { method: "PUT", body: JSON.stringify({ name, birth_date: birthDate }) }, token) }
  async deleteChild(id: string, token?: string) { return this.fetch(`/children/${id}`, { method: "DELETE" }, token) }
  async getAgeRatings(childId: string, token?: string) { return this.fetch(`/children/${childId}/age-ratings`, {}, token) }

  // Policies
  async listPolicies(childId: string, token?: string) { return this.fetch(`/children/${childId}/policies`, {}, token) }
  async createPolicy(childId: string, name: string, token?: string) { return this.fetch(`/children/${childId}/policies`, { method: "POST", body: JSON.stringify({ name }) }, token) }
  async getPolicy(id: string, token?: string) { return this.fetch(`/policies/${id}`, {}, token) }
  async updatePolicy(id: string, name: string, priority: number, token?: string) { return this.fetch(`/policies/${id}`, { method: "PUT", body: JSON.stringify({ name, priority }) }, token) }
  async deletePolicy(id: string, token?: string) { return this.fetch(`/policies/${id}`, { method: "DELETE" }, token) }
  async activatePolicy(id: string, token?: string) { return this.fetch(`/policies/${id}/activate`, { method: "POST" }, token) }
  async pausePolicy(id: string, token?: string) { return this.fetch(`/policies/${id}/pause`, { method: "POST" }, token) }
  async generateFromAge(policyId: string, token?: string) { return this.fetch(`/policies/${policyId}/generate-from-age`, { method: "POST" }, token) }

  // Rules
  async listRules(policyId: string, token?: string) { return this.fetch(`/policies/${policyId}/rules`, {}, token) }
  async createRule(policyId: string, category: string, enabled: boolean, config: any, token?: string) { return this.fetch(`/policies/${policyId}/rules`, { method: "POST", body: JSON.stringify({ category, enabled, config }) }, token) }
  async updateRule(ruleId: string, enabled: boolean, config: any, token?: string) { return this.fetch(`/rules/${ruleId}`, { method: "PUT", body: JSON.stringify({ enabled, config }) }, token) }
  async deleteRule(ruleId: string, token?: string) { return this.fetch(`/rules/${ruleId}`, { method: "DELETE" }, token) }
  async bulkUpsertRules(policyId: string, rules: any[], token?: string) { return this.fetch(`/policies/${policyId}/rules/bulk`, { method: "PUT", body: JSON.stringify({ rules }) }, token) }

  // Platforms
  async listPlatforms(token?: string) { return this.fetch("/platforms", {}, token) }
  async getPlatform(id: string, token?: string) { return this.fetch(`/platforms/${id}`, {}, token) }
  async listPlatformsByCategory(category: string, token?: string) { return this.fetch(`/platforms/by-category?category=${category}`, {}, token) }
  async listPlatformsByCapability(capability: string, token?: string) { return this.fetch(`/platforms/by-capability?capability=${capability}`, {}, token) }

  // Compliance
  async listComplianceLinks(familyId: string, token?: string) { return this.fetch(`/families/${familyId}/compliance`, {}, token) }
  async verifyCompliance(familyId: string, platformId: string, credentials: string, token?: string) { return this.fetch("/compliance", { method: "POST", body: JSON.stringify({ family_id: familyId, platform_id: platformId, credentials }) }, token) }
  async revokeCertification(linkId: string, token?: string) { return this.fetch(`/compliance/${linkId}`, { method: "DELETE" }, token) }
  async verifyLink(linkId: string, token?: string) { return this.fetch(`/compliance/${linkId}/verify`, { method: "POST" }, token) }

  // Enforcement
  async triggerChildEnforcement(childId: string, token?: string) { return this.fetch(`/children/${childId}/enforce`, { method: "POST" }, token) }
  async triggerLinkEnforcement(linkId: string, token?: string) { return this.fetch(`/compliance/${linkId}/enforce`, { method: "POST" }, token) }
  async getEnforcementJob(jobId: string, token?: string) { return this.fetch(`/enforcement/jobs/${jobId}`, {}, token) }
  async getEnforcementJobResults(jobId: string, token?: string) { return this.fetch(`/enforcement/jobs/${jobId}/results`, {}, token) }
  async listChildEnforcementJobs(childId: string, token?: string) { return this.fetch(`/children/${childId}/enforcement/jobs`, {}, token) }
  async retryEnforcementJob(jobId: string, token?: string) { return this.fetch(`/enforcement/jobs/${jobId}/retry`, { method: "POST" }, token) }

  // Ratings
  async getRatingSystems(token?: string) { return this.fetch("/ratings/systems", {}, token) }
  async getRatingsBySystem(systemId: string, token?: string) { return this.fetch(`/ratings/systems/${systemId}`, {}, token) }
  async getRatingsByAge(age: number, token?: string) { return this.fetch(`/ratings/by-age?age=${age}`, {}, token) }

  // Webhooks
  async listWebhooks(familyId: string, token?: string) { return this.fetch(`/families/${familyId}/webhooks`, {}, token) }
  async createWebhook(familyId: string, url: string, events: string[], token?: string) { return this.fetch("/webhooks", { method: "POST", body: JSON.stringify({ family_id: familyId, url, events }) }, token) }
  async deleteWebhook(id: string, token?: string) { return this.fetch(`/webhooks/${id}`, { method: "DELETE" }, token) }
  async testWebhook(id: string, token?: string) { return this.fetch(`/webhooks/${id}/test`, { method: "POST" }, token) }

  // Reports
  async familyOverview(familyId: string, token?: string) { return this.fetch(`/families/${familyId}/reports/overview`, {}, token) }

  // Quick Setup
  async quickSetup(req: { family_id?: string; family_name?: string; child_name: string; birth_date: string; strictness: string }, token?: string) {
    return this.fetch("/setup/quick", { method: "POST", body: JSON.stringify(req) }, token)
  }

  // UI Feedback (public, no auth needed)
  async submitFeedback(data: {
    page_route: string
    css_selector: string
    component_hint?: string
    comment: string
    reviewer_name?: string
    viewport_width?: number
    viewport_height?: number
    click_x?: number
    click_y?: number
  }) {
    const res = await window.fetch(`${this.directBaseUrl}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  // Auth / current user
  async getMe(token?: string) { return this.fetch("/auth/me", {}, token) }

  // Admin endpoints
  async getAdminStats(token?: string) { return this.fetch("/admin/stats", {}, token) }
  async listOutreach(token?: string, type?: string, status?: string) {
    const params = new URLSearchParams()
    if (type) params.set("type", type)
    if (status) params.set("status", status)
    const qs = params.toString() ? `?${params.toString()}` : ""
    return this.fetch(`/admin/outreach${qs}`, {}, token)
  }
  async getOutreachContact(id: string, token?: string) { return this.fetch(`/admin/outreach/${id}`, {}, token) }
  async updateOutreach(id: string, data: Record<string, unknown>, token?: string) {
    return this.fetch(`/admin/outreach/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token)
  }
  async createOutreachActivity(contactId: string, data: Record<string, unknown>, token?: string) {
    return this.fetch(`/admin/outreach/${contactId}/activity`, { method: "POST", body: JSON.stringify(data) }, token)
  }
  async listWorkers(token?: string) { return this.fetch("/admin/workers", {}, token) }
  async listWorkerRuns(workerId: string, token?: string) { return this.fetch(`/admin/workers/${workerId}/runs`, {}, token) }
  async triggerWorker(workerId: string, token?: string) {
    return this.fetch(`/admin/workers/${workerId}/trigger`, { method: "POST" }, token)
  }

  // ── News ────────────────────────────────────────────────────────
  async listNews(limit?: number, saved?: boolean, token?: string) {
    const params = new URLSearchParams()
    if (limit) params.set("limit", String(limit))
    if (saved) params.set("saved", "true")
    const qs = params.toString() ? `?${params.toString()}` : ""
    return this.fetch(`/admin/news${qs}`, {}, token)
  }
  async markNewsRead(id: string, token?: string) { return this.fetch(`/admin/news/${id}/read`, { method: "POST" }, token) }
  async toggleNewsSaved(id: string, token?: string) { return this.fetch(`/admin/news/${id}/save`, { method: "POST" }, token) }
  async deleteNewsItem(id: string, token?: string) { return this.fetch(`/admin/news/${id}`, { method: "DELETE" }, token) }

  // ── Compliance Alerts ──────────────────────────────────────────
  async listAlerts(token?: string) { return this.fetch("/admin/alerts", {}, token) }
  async updateAlertStatus(id: string, status: string, token?: string) {
    return this.fetch(`/admin/alerts/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, token)
  }

  // ── Google Workspace ──────────────────────────────────────────
  async getGoogleAuthURL(token?: string) { return this.fetch("/admin/google/auth-url", {}, token) }
  async submitGoogleCallback(code: string, token?: string) {
    return this.fetch("/admin/google/callback", { method: "POST", body: JSON.stringify({ code }) }, token)
  }
  async getGoogleStatus(token?: string) { return this.fetch("/admin/google/status", {}, token) }
  async disconnectGoogle(token?: string) { return this.fetch("/admin/google/disconnect", { method: "DELETE" }, token) }

  // Gmail
  async listGmailMessages(query?: string, pageToken?: string, maxResults?: number, token?: string) {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (pageToken) params.set("pageToken", pageToken)
    if (maxResults) params.set("maxResults", String(maxResults))
    const qs = params.toString() ? `?${params.toString()}` : ""
    return this.fetch(`/admin/gmail/messages${qs}`, {}, token)
  }
  async getGmailMessage(id: string, token?: string) { return this.fetch(`/admin/gmail/messages/${id}`, {}, token) }
  async getGmailThread(threadId: string, token?: string) { return this.fetch(`/admin/gmail/threads/${threadId}`, {}, token) }
  async sendGmailMessage(data: { to: string; subject: string; body: string; reply_to_message_id?: string; contact_id?: string }, token?: string) {
    return this.fetch("/admin/gmail/send", { method: "POST", body: JSON.stringify(data) }, token)
  }
  async searchGmail(query: string, maxResults?: number, token?: string) {
    const params = new URLSearchParams({ q: query })
    if (maxResults) params.set("maxResults", String(maxResults))
    return this.fetch(`/admin/gmail/search?${params.toString()}`, {}, token)
  }

  // Google Contacts
  async listGoogleContacts(pageToken?: string, pageSize?: number, token?: string) {
    const params = new URLSearchParams()
    if (pageToken) params.set("pageToken", pageToken)
    if (pageSize) params.set("pageSize", String(pageSize))
    const qs = params.toString() ? `?${params.toString()}` : ""
    return this.fetch(`/admin/google/contacts${qs}`, {}, token)
  }
  async searchGoogleContacts(query: string, token?: string) {
    return this.fetch(`/admin/google/contacts/search?q=${encodeURIComponent(query)}`, {}, token)
  }
  async syncContactsPreview(token?: string) { return this.fetch("/admin/google/contacts/sync/preview", {}, token) }
  async syncContacts(token?: string) { return this.fetch("/admin/google/contacts/sync", { method: "POST" }, token) }

  // Google Calendar
  async listCalendarEvents(timeMin?: string, timeMax?: string, maxResults?: number, token?: string) {
    const params = new URLSearchParams()
    if (timeMin) params.set("timeMin", timeMin)
    if (timeMax) params.set("timeMax", timeMax)
    if (maxResults) params.set("maxResults", String(maxResults))
    const qs = params.toString() ? `?${params.toString()}` : ""
    return this.fetch(`/admin/calendar/events${qs}`, {}, token)
  }
  async createCalendarEvent(data: { summary: string; description?: string; location?: string; start: string; end: string; attendees?: string[]; contact_id?: string }, token?: string) {
    return this.fetch("/admin/calendar/events", { method: "POST", body: JSON.stringify(data) }, token)
  }
  async deleteCalendarEvent(eventId: string, token?: string) {
    return this.fetch(`/admin/calendar/events/${eventId}`, { method: "DELETE" }, token)
  }

  // ── Pitch Coaching ──────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createPitchSession(persona: string, personaConfig?: Record<string, any>, token?: string) {
    return this.fetch("/admin/pitch/sessions", {
      method: "POST",
      body: JSON.stringify({ persona, persona_config: personaConfig || {} }),
    }, token)
  }
  async listPitchSessions(token?: string) { return this.fetch("/admin/pitch/sessions", {}, token) }
  async getPitchSession(id: string, token?: string) { return this.fetch(`/admin/pitch/sessions/${id}`, {}, token) }
  async deletePitchSession(id: string, token?: string) {
    return this.fetch(`/admin/pitch/sessions/${id}`, { method: "DELETE" }, token)
  }
  async endPitchSession(id: string, token?: string) {
    return this.fetch(`/admin/pitch/sessions/${id}/end`, { method: "POST" }, token)
  }

  /** Returns the WebSocket URL for the pitch session relay. */
  getPitchWSUrl(sessionId: string, token?: string): string {
    const base = this.directBaseUrl.replace(/^http/, "ws")
    const qs = token ? `?token=${encodeURIComponent(token)}` : ""
    return `${base}/admin/pitch/sessions/${sessionId}/ws${qs}`
  }

  /** Upload a recording blob for a pitch session. */
  async uploadPitchRecording(sessionId: string, blob: Blob, token?: string): Promise<{ path: string; size_bytes: number }> {
    const formData = new FormData()
    formData.append("recording", blob, "recording.webm")

    const headers: Record<string, string> = {}
    const isSandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true"
    const sandboxSess = isSandbox && typeof window !== "undefined" ? localStorage.getItem("sandbox-session") : null
    if (sandboxSess) {
      headers["X-Sandbox-Session"] = sandboxSess
    } else if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const res = await fetch(`${this.directBaseUrl}/admin/pitch/sessions/${sessionId}/recording`, {
      method: "POST",
      headers,
      body: formData,
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(body.message || body.error || res.statusText)
    }
    return res.json()
  }

  /** Get the URL for streaming a pitch session recording. */
  getPitchRecordingUrl(sessionId: string): string {
    return `${this.directBaseUrl}/admin/pitch/sessions/${sessionId}/recording`
  }

  // ── Outreach Autopilot ──────────────────────────────────────
  async getAutopilotConfig(token?: string) { return this.fetch("/admin/outreach/autopilot/config", {}, token) }
  async updateAutopilotConfig(data: Record<string, unknown>, token?: string) {
    return this.fetch("/admin/outreach/autopilot/config", { method: "PUT", body: JSON.stringify(data) }, token)
  }
  async toggleAutopilot(token?: string) { return this.fetch("/admin/outreach/autopilot/toggle", { method: "POST" }, token) }
  async getAutopilotStats(token?: string) { return this.fetch("/admin/outreach/autopilot/stats", {}, token) }

  // Sequences
  async listSequences(token?: string) { return this.fetch("/admin/outreach/sequences", {}, token) }
  async startSequence(contactId: string, token?: string) {
    return this.fetch(`/admin/outreach/${contactId}/sequence`, { method: "POST" }, token)
  }
  async pauseSequence(id: string, token?: string) {
    return this.fetch(`/admin/outreach/sequences/${id}/pause`, { method: "POST" }, token)
  }
  async resumeSequence(id: string, token?: string) {
    return this.fetch(`/admin/outreach/sequences/${id}/resume`, { method: "POST" }, token)
  }
  async cancelSequence(id: string, token?: string) {
    return this.fetch(`/admin/outreach/sequences/${id}/cancel`, { method: "POST" }, token)
  }
  async bulkStartSequences(contactIds: string[], token?: string) {
    return this.fetch("/admin/outreach/sequences/bulk-start", { method: "POST", body: JSON.stringify({ contact_ids: contactIds }) }, token)
  }

  // Pending Emails
  async listPendingEmails(status?: string, token?: string) {
    const qs = status ? `?status=${status}` : ""
    return this.fetch(`/admin/outreach/pending-emails${qs}`, {}, token)
  }
  async approvePendingEmail(id: string, token?: string) {
    return this.fetch(`/admin/outreach/pending-emails/${id}/approve`, { method: "POST" }, token)
  }
  async rejectPendingEmail(id: string, token?: string) {
    return this.fetch(`/admin/outreach/pending-emails/${id}/reject`, { method: "POST" }, token)
  }
  async editPendingEmail(id: string, data: { subject?: string; body?: string }, token?: string) {
    return this.fetch(`/admin/outreach/pending-emails/${id}`, { method: "PUT", body: JSON.stringify(data) }, token)
  }
  async queuePendingEmail(id: string, token?: string) {
    return this.fetch(`/admin/outreach/pending-emails/${id}/queue`, { method: "POST" }, token)
  }
  async sendQueuedEmail(id: string, token?: string) {
    return this.fetch(`/admin/outreach/pending-emails/${id}/send`, { method: "POST" }, token)
  }

  // Activity Feed
  async listRecentActivities(limit?: number, token?: string) {
    const qs = limit ? `?limit=${limit}` : ""
    return this.fetch(`/admin/outreach/activities/recent${qs}`, {}, token)
  }
  async getActivitySummary(since: string, token?: string) {
    return this.fetch(`/admin/outreach/activities/summary?since=${encodeURIComponent(since)}`, {}, token)
  }

  // Outreach Google OAuth
  async getOutreachGoogleAuthURL(token?: string) { return this.fetch("/admin/outreach/google/auth-url", {}, token) }
  async submitOutreachGoogleCallback(code: string, token?: string) {
    return this.fetch("/admin/outreach/google/callback", { method: "POST", body: JSON.stringify({ code }) }, token)
  }
  async getOutreachGoogleStatus(token?: string) { return this.fetch("/admin/outreach/google/status", {}, token) }
  async disconnectOutreachGoogle(token?: string) { return this.fetch("/admin/outreach/google/disconnect", { method: "DELETE" }, token) }

  // Multi-account Google management
  async listGoogleAccounts(token?: string) {
    return this.fetch("/admin/google/accounts", {}, token)
  }
  async getGoogleAccountAuthURL(accountKey: string, token?: string) {
    return this.fetch(`/admin/google/accounts/${accountKey}/auth-url`, {}, token)
  }
  async submitGoogleAccountCallback(accountKey: string, code: string, token?: string) {
    return this.fetch(`/admin/google/accounts/${accountKey}/callback`, { method: "POST", body: JSON.stringify({ code }) }, token)
  }
  async disconnectGoogleAccount(accountKey: string, token?: string) {
    return this.fetch(`/admin/google/accounts/${accountKey}`, { method: "DELETE" }, token)
  }
  async listPersonaAccounts(token?: string) {
    return this.fetch("/admin/outreach/persona-accounts", {}, token)
  }
  async upsertPersonaAccount(personaKey: string, data: { google_account_key: string; calendar_account_key: string; display_name: string; sender_email: string }, token?: string) {
    return this.fetch(`/admin/outreach/persona-accounts/${personaKey}`, { method: "PUT", body: JSON.stringify(data) }, token)
  }

  // Developer Portal
  async createDeveloperOrg(token: string, data: { name: string; description?: string; website_url?: string }) {
    return this.fetch('/developers/orgs', { method: 'POST', body: JSON.stringify(data) }, token)
  }
  async listDeveloperOrgs(token: string) {
    return this.fetch('/developers/orgs', {}, token)
  }
  async getDeveloperOrg(token: string, orgId: string) {
    return this.fetch(`/developers/orgs/${orgId}`, {}, token)
  }
  async updateDeveloperOrg(token: string, orgId: string, data: { name?: string; description?: string; website_url?: string }) {
    return this.fetch(`/developers/orgs/${orgId}`, { method: 'PUT', body: JSON.stringify(data) }, token)
  }
  async deleteDeveloperOrg(token: string, orgId: string) {
    return this.fetch(`/developers/orgs/${orgId}`, { method: 'DELETE' }, token)
  }
  async listDeveloperMembers(token: string, orgId: string) {
    return this.fetch(`/developers/orgs/${orgId}/members`, {}, token)
  }
  async createDeveloperKey(token: string, orgId: string, data: { name: string; environment: string; scopes: string[] }) {
    return this.fetch(`/developers/orgs/${orgId}/keys`, { method: 'POST', body: JSON.stringify(data) }, token)
  }
  async listDeveloperKeys(token: string, orgId: string) {
    return this.fetch(`/developers/orgs/${orgId}/keys`, {}, token)
  }
  async revokeDeveloperKey(token: string, orgId: string, keyId: string) {
    return this.fetch(`/developers/orgs/${orgId}/keys/${keyId}`, { method: 'DELETE' }, token)
  }
  async regenerateDeveloperKey(token: string, orgId: string, keyId: string) {
    return this.fetch(`/developers/orgs/${orgId}/keys/${keyId}/regenerate`, { method: 'POST' }, token)
  }
  async getDeveloperUsage(token: string, orgId: string, days?: number) {
    const q = days ? `?days=${days}` : ''
    return this.fetch(`/developers/orgs/${orgId}/usage${q}`, {}, token)
  }

  // Sources
  async listAvailableSources(token: string) {
    return this.fetch('/sources/available', {}, token)
  }
  async connectSource(token: string, data: { child_id: string; family_id: string; source: string; credentials?: Record<string, string>; auto_sync?: boolean }) {
    return this.fetch('/sources', { method: 'POST', body: JSON.stringify(data) }, token)
  }
  async getSource(token: string, sourceId: string) {
    return this.fetch(`/sources/${sourceId}`, {}, token)
  }
  async listSourcesByChild(token: string, childId: string) {
    return this.fetch(`/children/${childId}/sources`, {}, token)
  }
  async listSourcesByFamily(token: string, familyId: string) {
    return this.fetch(`/families/${familyId}/sources`, {}, token)
  }
  async syncSource(token: string, sourceId: string, syncMode: string = 'full') {
    return this.fetch(`/sources/${sourceId}/sync`, { method: 'POST', body: JSON.stringify({ sync_mode: syncMode }) }, token)
  }
  async pushSourceRule(token: string, sourceId: string, category: string, value: unknown) {
    return this.fetch(`/sources/${sourceId}/rules`, { method: 'POST', body: JSON.stringify({ category, value }) }, token)
  }
  async getSourceGuidedSteps(token: string, sourceId: string, category: string) {
    return this.fetch(`/sources/${sourceId}/guide/${category}`, {}, token)
  }
  async listSourceSyncJobs(token: string, sourceId: string, limit?: number) {
    const q = limit ? `?limit=${limit}` : ''
    return this.fetch(`/sources/${sourceId}/jobs${q}`, {}, token)
  }
  async getSourceSyncJob(token: string, sourceId: string, jobId: string) {
    return this.fetch(`/sources/${sourceId}/jobs/${jobId}`, {}, token)
  }
  async getSourceSyncResults(token: string, sourceId: string, jobId: string) {
    return this.fetch(`/sources/${sourceId}/jobs/${jobId}/results`, {}, token)
  }
  async retrySourceSync(token: string, sourceId: string, jobId: string) {
    return this.fetch(`/sources/${sourceId}/jobs/${jobId}/retry`, { method: 'POST' }, token)
  }
  async disconnectSource(token: string, sourceId: string) {
    return this.fetch(`/sources/${sourceId}`, { method: 'DELETE' }, token)
  }

  async listFeedback(status?: string) {
    const qs = status ? `?status=${status}` : ""
    const res = await window.fetch(`${this.directBaseUrl}/feedback${qs}`, {
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }
}

export const api = new ApiClient(DIRECT_API_URL)
