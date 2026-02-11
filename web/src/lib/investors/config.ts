/* ------------------------------------------------------------------ */
/*  Investor Portal — Single source of truth                          */
/* ------------------------------------------------------------------ */

export const RAISE_DETAILS = {
  instrument: "SAFE (Post-Money)",
  targetAmount: "$1.5M",
  valuationCap: "$12M",
  minCheck: "$25K",
  roundStatus: "Open",
  useOfFunds: [
    { label: "Engineering", pct: 45 },
    { label: "Go-to-Market", pct: 25 },
    { label: "Compliance & Legal", pct: 15 },
    { label: "Operations", pct: 15 },
  ],
} as const

export interface DataRoomLink {
  label: string
  description: string
  url: string
  category: "legal" | "financial" | "product" | "diligence"
}

export const DATA_ROOM_LINKS: DataRoomLink[] = [
  {
    label: "SAFE Agreement",
    description: "Post-money SAFE on standard YC terms",
    url: "/investors/phosra-safe.pdf",
    category: "legal",
  },
  {
    label: "Pitch Deck",
    description: "12-slide pre-seed deck — problem, product, market, traction, team",
    url: "/deck/phosra-pre-seed-deck.pdf",
    category: "product",
  },
  {
    label: "Financial Model",
    description: "3-year projection with unit economics",
    url: "#",
    category: "financial",
  },
  {
    label: "Cap Table",
    description: "Current ownership structure",
    url: "#",
    category: "financial",
  },
  {
    label: "Technical Architecture",
    description: "PCSS v1.0 specification and system design",
    url: "/docs",
    category: "product",
  },
  {
    label: "Compliance Matrix",
    description: "67 laws mapped to enforcement actions",
    url: "/compliance",
    category: "diligence",
  },
]

/**
 * Check whether an email address is on the investor allowlist.
 * The allowlist is read from `INVESTOR_ALLOWLIST` (comma-separated, case-insensitive).
 */
export function isInvestorAllowed(email: string): boolean {
  const raw = process.env.INVESTOR_ALLOWLIST ?? ""
  if (!raw) return false
  const allowed = raw.split(",").map((e) => e.trim().toLowerCase())
  return allowed.includes(email.trim().toLowerCase())
}
