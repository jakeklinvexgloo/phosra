const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = `${baseUrl}/api/v1`
  }

  async fetch(path: string, options: RequestInit = {}, token?: string): Promise<any> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    }

    // Sandbox mode: send X-Sandbox-Session header instead of WorkOS token
    const sandboxSession = typeof window !== "undefined" ? localStorage.getItem("sandbox-session") : null
    if (sandboxSession) {
      headers["X-Sandbox-Session"] = sandboxSession
    } else if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers })

    if (res.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
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
    const res = await window.fetch(`${this.baseUrl}/feedback`, {
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

  async listFeedback(status?: string) {
    const qs = status ? `?status=${status}` : ""
    const res = await window.fetch(`${this.baseUrl}/feedback${qs}`, {
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }
}

export const api = new ApiClient(API_URL)
