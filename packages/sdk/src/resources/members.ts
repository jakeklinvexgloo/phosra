import type { BaseClient } from "../client.js";
import type { FamilyMember, FamilyRole } from "../types.js";

export class MembersResource {
  constructor(private client: BaseClient) {}

  /**
   * List all members of a family with their roles.
   */
  async list(familyId: string): Promise<FamilyMember[]> {
    return this.client.request<FamilyMember[]>("GET", `/families/${familyId}/members`);
  }

  /**
   * Add a user to a family with a specific role.
   */
  async invite(
    familyId: string,
    params: { user_id: string; role: FamilyRole },
  ): Promise<FamilyMember> {
    return this.client.request<FamilyMember>(
      "POST",
      `/families/${familyId}/members`,
      { body: params },
    );
  }

  /**
   * Remove a member from a family.
   */
  async remove(familyId: string, memberId: string): Promise<void> {
    return this.client.request<void>(
      "DELETE",
      `/families/${familyId}/members/${memberId}`,
    );
  }
}
