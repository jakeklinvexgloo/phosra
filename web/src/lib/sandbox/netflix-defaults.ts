import type { NetflixProfile } from "./types"

export const DEFAULT_PROFILES: NetflixProfile[] = [
  {
    id: "dad",
    name: "Dad",
    type: "adult",
    avatarColor: "linear-gradient(135deg, #1a5276, #2980b9)",
    maturityRating: "18+",
    blockedTitles: [],
    profileLock: { enabled: false, pin: "" },
    autoplayNextEpisode: true,
    autoplayPreviews: true,
    viewingActivity: [
      { title: "Breaking Bad", date: "Feb 20, 2026", rating: "TV-MA", duration: "58 min" },
      { title: "The Crown", date: "Feb 19, 2026", rating: "TV-14", duration: "61 min" },
      { title: "Our Planet", date: "Feb 18, 2026", rating: "TV-G", duration: "50 min" },
    ],
    timeLimitManaged: false,
  },
  {
    id: "emma",
    name: "Emma (13)",
    type: "standard",
    avatarColor: "linear-gradient(135deg, #7d3c98, #c39bd3)",
    maturityRating: "18+", // intentionally insecure default
    blockedTitles: [],
    profileLock: { enabled: false, pin: "" },
    autoplayNextEpisode: true,
    autoplayPreviews: true,
    viewingActivity: [
      { title: "Stranger Things", date: "Feb 20, 2026", rating: "TV-14", duration: "52 min" },
      { title: "Wednesday", date: "Feb 19, 2026", rating: "TV-14", duration: "48 min" },
      { title: "Squid Game", date: "Feb 18, 2026", rating: "TV-MA", duration: "60 min" },
      { title: "Dahmer", date: "Feb 17, 2026", rating: "TV-MA", duration: "55 min" },
    ],
    timeLimitManaged: false,
  },
  {
    id: "kids",
    name: "Kids",
    type: "kids",
    avatarColor: "linear-gradient(135deg, #27ae60, #82e0aa)",
    maturityRating: "7+",
    blockedTitles: [],
    profileLock: { enabled: false, pin: "" },
    autoplayNextEpisode: true,
    autoplayPreviews: false,
    viewingActivity: [
      { title: "Bluey", date: "Feb 20, 2026", rating: "TV-Y", duration: "7 min" },
      { title: "Cocomelon", date: "Feb 19, 2026", rating: "TV-Y", duration: "3 min" },
      { title: "Paw Patrol", date: "Feb 18, 2026", rating: "TV-Y", duration: "23 min" },
    ],
    timeLimitManaged: false,
  },
]
