// Prime Video Provider Sandbox types

/** Prime Video maturity tiers */
export type PrimeVideoMaturityTier = "All" | "7+" | "13+" | "16+" | "18+"

export const PRIME_VIDEO_MATURITY_TIERS: PrimeVideoMaturityTier[] = [
  "All",
  "7+",
  "13+",
  "16+",
  "18+",
]

export interface PrimeVideoViewingEntry {
  title: string
  date: string
  rating: string
  duration: string
  type: "included" | "rental" | "purchase"
}

export interface PrimeVideoRental {
  title: string
  date: string
  price: string
}

export interface PrimeVideoProfile {
  id: string
  name: string
  type: "adult" | "teen" | "kids"
  avatarColor: string // CSS gradient
  maturityRating: PrimeVideoMaturityTier
  purchasePin: { enabled: boolean } // Account-wide PIN on Purchase
  profilePin: { enabled: boolean; pin: string } // Per-profile 5-digit PIN
  autoplayNextEpisode: boolean
  autoplayPreviews: boolean
  viewingActivity: PrimeVideoViewingEntry[]
  watchlist: string[]
  rentals: PrimeVideoRental[]
  timeLimitManaged: boolean // Phosra-managed badge
  adFree: boolean // Kids profiles always ad-free
}
