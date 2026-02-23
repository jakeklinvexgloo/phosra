import type { BaseClient } from "../client.js";
import type { RatingSystem, Rating, AgeRatings } from "../types.js";

export class RatingsResource {
  constructor(private client: BaseClient) {}

  /**
   * List all content rating systems (MPAA, TV, ESRB, PEGI, CSM).
   */
  async systems(): Promise<RatingSystem[]> {
    return this.client.request<RatingSystem[]>("GET", "/ratings/systems");
  }

  /**
   * Get all ratings within a specific system.
   */
  async bySystem(systemId: string): Promise<Rating[]> {
    return this.client.request<Rating[]>("GET", `/ratings/systems/${systemId}`);
  }

  /**
   * Get recommended maximum ratings across all systems for a specific age.
   */
  async byAge(age: number): Promise<AgeRatings> {
    return this.client.request<AgeRatings>("GET", "/ratings/by-age", {
      query: { age },
    });
  }

  /**
   * Get equivalent ratings in other systems for a given rating (cross-system mapping).
   */
  async convert(ratingId: string): Promise<Rating[]> {
    return this.client.request<Rating[]>("GET", `/ratings/${ratingId}/convert`);
  }
}
