const API_BASE = "http://localhost:8080/api/v1"

async function apiFetch(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<any> {
  const { token, ...init } = options
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) || {}),
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${init.method || "GET"} ${path} failed (${res.status}): ${body}`)
  }
  return res.status === 204 ? null : res.json()
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<{ user: any; tokens: AuthTokens }> {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  })
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: any; tokens: AuthTokens }> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function createFamily(
  token: string,
  name: string
): Promise<any> {
  return apiFetch("/families", {
    method: "POST",
    body: JSON.stringify({ name }),
    token,
  })
}

export async function createChild(
  token: string,
  familyId: string,
  name: string,
  birthDate: string
): Promise<any> {
  return apiFetch(`/families/${familyId}/children`, {
    method: "POST",
    body: JSON.stringify({ name, birth_date: birthDate }),
    token,
  })
}

export async function createPolicy(
  token: string,
  childId: string,
  name: string
): Promise<any> {
  return apiFetch(`/children/${childId}/policies`, {
    method: "POST",
    body: JSON.stringify({ name }),
    token,
  })
}

export async function quickSetup(
  token: string,
  data: {
    family_id?: string
    family_name?: string
    child_name: string
    birth_date: string
    strictness: string
  }
): Promise<any> {
  return apiFetch("/setup/quick", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  })
}

export async function listFamilies(token: string): Promise<any[]> {
  return apiFetch("/families", { token })
}

export async function listChildren(
  token: string,
  familyId: string
): Promise<any[]> {
  return apiFetch(`/families/${familyId}/children`, { token })
}

export async function listPolicies(
  token: string,
  childId: string
): Promise<any[]> {
  return apiFetch(`/children/${childId}/policies`, { token })
}

export async function generateFromAge(
  token: string,
  policyId: string
): Promise<any> {
  return apiFetch(`/policies/${policyId}/generate-from-age`, {
    method: "POST",
    token,
  })
}
