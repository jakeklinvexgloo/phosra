/* ------------------------------------------------------------------ */
/*  Investor Portal — Single source of truth                          */
/* ------------------------------------------------------------------ */

export const RAISE_DETAILS = {
  instrument: "SAFE (Post-Money)",
  targetAmount: "$950K",
  valuationCap: "$6M",
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
    description: "11-slide pre-seed deck — problem, infrastructure thesis, product, market, team",
    url: "/deck/",
    category: "product",
  },
  {
    label: "Financial Model",
    description: "3-year projection with unit economics",
    url: "/investors/financial-model",
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

