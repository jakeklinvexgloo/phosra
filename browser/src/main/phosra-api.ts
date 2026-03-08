/**
 * Phosra backend API client — uses Electron's `net.fetch` (no external deps).
 *
 * All requests include a fresh Stytch JWT as a Bearer token.
 * Token is obtained from AuthManager which handles refresh automatically.
 */

import { net } from 'electron';

const API_BASE = 'https://phosra-api.fly.dev/api/v1';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Strictness = 'recommended' | 'strict' | 'relaxed';

export interface QuickSetupRequest {
  family_name?: string;
  child_name: string;
  birth_date: string; // YYYY-MM-DD
  strictness: Strictness;
}

export interface QuickSetupResponse {
  family_id: string;
  child_id: string;
  policy_count: number;
}

export interface Family {
  id: string;
  name: string;
  created_at: string;
}

export interface Child {
  id: string;
  family_id: string;
  name: string;
  birth_date: string;
  created_at: string;
}

export interface ChildPolicy {
  id: string;
  child_id: string;
  rule_category: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export type FamilyRole = 'owner' | 'parent' | 'guardian';

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: FamilyRole;
  email?: string;
  name?: string;
  display_name?: string;
  joined_at: string;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class PhosraApiClient {
  constructor(private getToken: () => Promise<string | null>) {}

  async quickSetup(req: QuickSetupRequest): Promise<QuickSetupResponse> {
    return this.post<QuickSetupResponse>('/setup/quick', req);
  }

  async listFamilies(): Promise<Family[]> {
    return this.get<Family[]>('/families');
  }

  async listChildren(familyId: string): Promise<Child[]> {
    return this.get<Child[]>(`/families/${familyId}/children`);
  }

  async getChild(childId: string): Promise<Child> {
    return this.get<Child>(`/children/${childId}`);
  }

  async listPolicies(childId: string): Promise<ChildPolicy[]> {
    return this.get<ChildPolicy[]>(`/children/${childId}/policies`);
  }

  async addChild(familyId: string, name: string, birthDate: string): Promise<Child> {
    return this.post<Child>(`/families/${familyId}/children`, { name, birth_date: birthDate });
  }

  async listMembers(familyId: string): Promise<FamilyMember[]> {
    return this.get<FamilyMember[]>(`/families/${familyId}/members`);
  }

  async addMember(familyId: string, email: string, role: FamilyRole, displayName?: string): Promise<FamilyMember> {
    return this.post<FamilyMember>(`/families/${familyId}/members`, { email, role, display_name: displayName || '' });
  }

  async removeMember(familyId: string, memberId: string): Promise<void> {
    return this.del(`/families/${familyId}/members/${memberId}`);
  }

  async updateChild(childId: string, data: { name: string; birth_date: string }): Promise<Child> {
    return this.put<Child>(`/children/${childId}`, data);
  }

  async updateMember(familyId: string, memberId: string, data: { display_name: string; role: FamilyRole }): Promise<FamilyMember> {
    return this.put<FamilyMember>(`/families/${familyId}/members/${memberId}`, data);
  }

  // -----------------------------------------------------------------------
  // Viewing History Sync
  // -----------------------------------------------------------------------

  async syncViewingHistory(entries: {
    child_id: string;
    child_name: string;
    platform: string;
    title: string;
    series_title: string | null;
    watched_date: string | null;
    netflix_profile: string;
  }[]): Promise<void> {
    await this.post('/viewing-history/sync', { entries });
  }

  // -----------------------------------------------------------------------
  // CSM Reviews Sync
  // -----------------------------------------------------------------------

  async syncCSMReviews(reviews: {
    csm_slug: string;
    csm_url: string;
    csm_media_type: string;
    title: string;
    age_rating: string;
    age_range_min: number;
    quality_stars: number;
    is_family_friendly: boolean;
    review_summary: string;
    review_body: string;
    parent_summary: string;
    age_explanation: string;
    descriptors_json: { category: string; level: string; numericLevel?: number; description?: string }[];
    positive_content: { category: string; description: string }[];
  }[]): Promise<{ upserted: number }> {
    return this.post<{ upserted: number }>('/csm/reviews/bulk', { reviews });
  }

  async linkViewingHistoryCSM(): Promise<{ linked: number }> {
    return this.post<{ linked: number }>('/viewing-history/link-csm', {});
  }

  // -----------------------------------------------------------------------
  // Config Agent State
  // -----------------------------------------------------------------------

  async saveConfigState(platform: string, state: unknown): Promise<void> {
    await this.put(`/config-agent/state/${platform}`, { state });
  }

  async getConfigState(platform: string): Promise<{ state: unknown } | null> {
    try {
      return await this.get<{ state: unknown }>(`/config-agent/state/${platform}`);
    } catch {
      return null;
    }
  }

  async deleteConfigState(platform: string): Promise<void> {
    await this.del(`/config-agent/state/${platform}`);
  }

  // -----------------------------------------------------------------------
  // HTTP helpers
  // -----------------------------------------------------------------------

  private async get<T>(path: string): Promise<T> {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await net.fetch(`${API_BASE}${path}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`API ${res.status}: ${body || res.statusText}`);
    }

    return res.json() as Promise<T>;
  }

  private async del(path: string): Promise<void> {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await net.fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`API ${res.status}: ${body || res.statusText}`);
    }
  }

  private async put<T>(path: string, body: unknown): Promise<T> {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await net.fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`API ${res.status}: ${text || res.statusText}`);
    }

    return res.json() as Promise<T>;
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await net.fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`API ${res.status}: ${text || res.statusText}`);
    }

    return res.json() as Promise<T>;
  }
}
