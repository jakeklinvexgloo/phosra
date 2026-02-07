const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = `${baseUrl}/api/v1`
  }

  private async fetch(path: string, options: RequestInit = {}): Promise<any> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers })

    if (res.status === 401 && token) {
      const refreshed = await this.refreshToken()
      if (refreshed) {
        headers["Authorization"] = `Bearer ${localStorage.getItem("access_token")}`
        const retryRes = await fetch(`${this.baseUrl}${path}`, { ...options, headers })
        if (!retryRes.ok) throw new Error(await retryRes.text())
        return retryRes.status === 204 ? null : retryRes.json()
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
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

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) return false

    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
      if (!res.ok) return false
      const data = await res.json()
      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("refresh_token", data.refresh_token)
      return true
    } catch {
      return false
    }
  }

  // Auth
  async register(email: string, password: string, name: string) {
    return this.fetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    })
  }

  async login(email: string, password: string) {
    return this.fetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async logout() {
    return this.fetch("/auth/logout", { method: "POST" })
  }

  async me() {
    return this.fetch("/auth/me")
  }

  // Families
  async listFamilies() { return this.fetch("/families") }
  async createFamily(name: string) { return this.fetch("/families", { method: "POST", body: JSON.stringify({ name }) }) }
  async getFamily(id: string) { return this.fetch(`/families/${id}`) }
  async updateFamily(id: string, name: string) { return this.fetch(`/families/${id}`, { method: "PUT", body: JSON.stringify({ name }) }) }
  async deleteFamily(id: string) { return this.fetch(`/families/${id}`, { method: "DELETE" }) }
  async listMembers(familyId: string) { return this.fetch(`/families/${familyId}/members`) }
  async addMember(familyId: string, userId: string, role: string) { return this.fetch(`/families/${familyId}/members`, { method: "POST", body: JSON.stringify({ user_id: userId, role }) }) }

  // Children
  async listChildren(familyId: string) { return this.fetch(`/families/${familyId}/children`) }
  async createChild(familyId: string, name: string, birthDate: string) { return this.fetch(`/families/${familyId}/children`, { method: "POST", body: JSON.stringify({ name, birth_date: birthDate }) }) }
  async getChild(id: string) { return this.fetch(`/children/${id}`) }
  async updateChild(id: string, name: string, birthDate: string) { return this.fetch(`/children/${id}`, { method: "PUT", body: JSON.stringify({ name, birth_date: birthDate }) }) }
  async deleteChild(id: string) { return this.fetch(`/children/${id}`, { method: "DELETE" }) }
  async getAgeRatings(childId: string) { return this.fetch(`/children/${childId}/age-ratings`) }

  // Policies
  async listPolicies(childId: string) { return this.fetch(`/children/${childId}/policies`) }
  async createPolicy(childId: string, name: string) { return this.fetch(`/children/${childId}/policies`, { method: "POST", body: JSON.stringify({ name }) }) }
  async getPolicy(id: string) { return this.fetch(`/policies/${id}`) }
  async updatePolicy(id: string, name: string, priority: number) { return this.fetch(`/policies/${id}`, { method: "PUT", body: JSON.stringify({ name, priority }) }) }
  async deletePolicy(id: string) { return this.fetch(`/policies/${id}`, { method: "DELETE" }) }
  async activatePolicy(id: string) { return this.fetch(`/policies/${id}/activate`, { method: "POST" }) }
  async pausePolicy(id: string) { return this.fetch(`/policies/${id}/pause`, { method: "POST" }) }
  async generateFromAge(policyId: string) { return this.fetch(`/policies/${policyId}/generate-from-age`, { method: "POST" }) }

  // Rules
  async listRules(policyId: string) { return this.fetch(`/policies/${policyId}/rules`) }
  async createRule(policyId: string, category: string, enabled: boolean, config: any) { return this.fetch(`/policies/${policyId}/rules`, { method: "POST", body: JSON.stringify({ category, enabled, config }) }) }
  async updateRule(ruleId: string, enabled: boolean, config: any) { return this.fetch(`/rules/${ruleId}`, { method: "PUT", body: JSON.stringify({ enabled, config }) }) }
  async deleteRule(ruleId: string) { return this.fetch(`/rules/${ruleId}`, { method: "DELETE" }) }
  async bulkUpsertRules(policyId: string, rules: any[]) { return this.fetch(`/policies/${policyId}/rules/bulk`, { method: "PUT", body: JSON.stringify({ rules }) }) }

  // Platforms
  async listPlatforms() { return this.fetch("/platforms") }
  async getPlatform(id: string) { return this.fetch(`/platforms/${id}`) }
  async listPlatformsByCategory(category: string) { return this.fetch(`/platforms/by-category?category=${category}`) }
  async listPlatformsByCapability(capability: string) { return this.fetch(`/platforms/by-capability?capability=${capability}`) }

  // Compliance
  async listComplianceLinks(familyId: string) { return this.fetch(`/families/${familyId}/compliance`) }
  async verifyCompliance(familyId: string, platformId: string, credentials: string) { return this.fetch("/compliance", { method: "POST", body: JSON.stringify({ family_id: familyId, platform_id: platformId, credentials }) }) }
  async revokeCertification(linkId: string) { return this.fetch(`/compliance/${linkId}`, { method: "DELETE" }) }
  async verifyLink(linkId: string) { return this.fetch(`/compliance/${linkId}/verify`, { method: "POST" }) }

  // Enforcement
  async triggerChildEnforcement(childId: string) { return this.fetch(`/children/${childId}/enforce`, { method: "POST" }) }
  async triggerLinkEnforcement(linkId: string) { return this.fetch(`/compliance/${linkId}/enforce`, { method: "POST" }) }
  async getEnforcementJob(jobId: string) { return this.fetch(`/enforcement/jobs/${jobId}`) }
  async getEnforcementJobResults(jobId: string) { return this.fetch(`/enforcement/jobs/${jobId}/results`) }
  async listChildEnforcementJobs(childId: string) { return this.fetch(`/children/${childId}/enforcement/jobs`) }
  async retryEnforcementJob(jobId: string) { return this.fetch(`/enforcement/jobs/${jobId}/retry`, { method: "POST" }) }

  // Ratings
  async getRatingSystems() { return this.fetch("/ratings/systems") }
  async getRatingsBySystem(systemId: string) { return this.fetch(`/ratings/systems/${systemId}`) }
  async getRatingsByAge(age: number) { return this.fetch(`/ratings/by-age?age=${age}`) }

  // Webhooks
  async listWebhooks(familyId: string) { return this.fetch(`/families/${familyId}/webhooks`) }
  async createWebhook(familyId: string, url: string, events: string[]) { return this.fetch("/webhooks", { method: "POST", body: JSON.stringify({ family_id: familyId, url, events }) }) }
  async deleteWebhook(id: string) { return this.fetch(`/webhooks/${id}`, { method: "DELETE" }) }
  async testWebhook(id: string) { return this.fetch(`/webhooks/${id}/test`, { method: "POST" }) }

  // Reports
  async familyOverview(familyId: string) { return this.fetch(`/families/${familyId}/reports/overview`) }

  // Quick Setup
  async quickSetup(req: { family_id?: string; family_name?: string; child_name: string; birth_date: string; strictness: string }) {
    return this.fetch("/setup/quick", { method: "POST", body: JSON.stringify(req) })
  }
}

export const api = new ApiClient(API_URL)
