import type { PrimeVideoProfile } from "./prime-video-types"

export const DEFAULT_PRIME_VIDEO_PROFILES: PrimeVideoProfile[] = [
  {
    id: "dad",
    name: "Dad",
    type: "adult",
    avatarColor: "linear-gradient(135deg, #00264d, #0779FF)",
    maturityRating: "18+",
    purchasePin: { enabled: false },
    profilePin: { enabled: false, pin: "" },
    autoplayNextEpisode: true,
    autoplayPreviews: true,
    viewingActivity: [
      { title: "The Boys", date: "Feb 20, 2026", rating: "18+", duration: "62 min", type: "included" },
      { title: "Reacher", date: "Feb 19, 2026", rating: "16+", duration: "48 min", type: "included" },
      { title: "The Lord of the Rings: The Rings of Power", date: "Feb 18, 2026", rating: "13+", duration: "72 min", type: "included" },
    ],
    watchlist: ["Citadel", "Fallout", "The Terminal List"],
    rentals: [
      { title: "Oppenheimer", date: "Feb 15, 2026", price: "$5.99" },
    ],
    timeLimitManaged: false,
    adFree: false,
  },
  {
    id: "emma",
    name: "Emma (13)",
    type: "teen",
    avatarColor: "linear-gradient(135deg, #6B21A8, #C084FC)",
    maturityRating: "18+", // intentionally insecure default
    purchasePin: { enabled: false },
    profilePin: { enabled: false, pin: "" },
    autoplayNextEpisode: true,
    autoplayPreviews: true,
    viewingActivity: [
      { title: "The Summer I Turned Pretty", date: "Feb 20, 2026", rating: "13+", duration: "45 min", type: "included" },
      { title: "Invincible", date: "Feb 19, 2026", rating: "18+", duration: "44 min", type: "included" },
      { title: "The Boys", date: "Feb 18, 2026", rating: "18+", duration: "62 min", type: "included" },
      { title: "Hunters", date: "Feb 17, 2026", rating: "18+", duration: "55 min", type: "included" },
    ],
    watchlist: ["Gen V", "Upload", "Wilderness"],
    rentals: [],
    timeLimitManaged: false,
    adFree: false,
  },
  {
    id: "kids",
    name: "Kids",
    type: "kids",
    avatarColor: "linear-gradient(135deg, #059669, #6EE7B7)",
    maturityRating: "7+", // Kids profile hardcoded to <=12 content
    purchasePin: { enabled: false },
    profilePin: { enabled: false, pin: "" },
    autoplayNextEpisode: true,
    autoplayPreviews: false,
    viewingActivity: [
      { title: "Bluey", date: "Feb 20, 2026", rating: "All", duration: "7 min", type: "included" },
      { title: "Pete the Cat", date: "Feb 19, 2026", rating: "All", duration: "24 min", type: "included" },
      { title: "If You Give a Mouse a Cookie", date: "Feb 18, 2026", rating: "All", duration: "23 min", type: "included" },
    ],
    watchlist: ["Tumble Leaf", "Creative Galaxy", "Kung Fu Panda: The Dragon Knight"],
    rentals: [],
    timeLimitManaged: false,
    adFree: true, // Kids profiles always ad-free
  },
]
