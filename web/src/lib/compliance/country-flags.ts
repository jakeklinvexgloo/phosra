import type { Jurisdiction } from "./types"

const COUNTRY_FLAGS: Record<string, string> = {
  US: "\ud83c\uddfa\ud83c\uddf8",
  GB: "\ud83c\uddec\ud83c\udde7",
  AU: "\ud83c\udde6\ud83c\uddfa",
  IN: "\ud83c\uddee\ud83c\uddf3",
  CA: "\ud83c\udde8\ud83c\udde6",
  BR: "\ud83c\udde7\ud83c\uddf7",
  KR: "\ud83c\uddf0\ud83c\uddf7",
  JP: "\ud83c\uddef\ud83c\uddf5",
  CN: "\ud83c\udde8\ud83c\uddf3",
  SG: "\ud83c\uddf8\ud83c\uddec",
  NZ: "\ud83c\uddf3\ud83c\uddff",
  IE: "\ud83c\uddee\ud83c\uddea",
  DE: "\ud83c\udde9\ud83c\uddea",
  FR: "\ud83c\uddeb\ud83c\uddf7",
  ZA: "\ud83c\uddff\ud83c\udde6",
  KE: "\ud83c\uddf0\ud83c\uddea",
  NG: "\ud83c\uddf3\ud83c\uddec",
  SA: "\ud83c\uddf8\ud83c\udde6",
  AE: "\ud83c\udde6\ud83c\uddea",
  IL: "\ud83c\uddee\ud83c\uddf1",
}

export function getCountryFlag(countryCode: string): string {
  return COUNTRY_FLAGS[countryCode] || "\ud83c\udf10"
}

export interface DisplayGroup {
  jurisdictionGroup: Jurisdiction
  label: string
  flag: string
  defaultOpen: boolean
}

export const DISPLAY_GROUPS: DisplayGroup[] = [
  {
    jurisdictionGroup: "us-federal",
    label: "US Federal",
    flag: "\ud83c\uddfa\ud83c\uddf8",
    defaultOpen: true,
  },
  {
    jurisdictionGroup: "us-state",
    label: "US State",
    flag: "\ud83c\uddfa\ud83c\uddf8",
    defaultOpen: false,
  },
  {
    jurisdictionGroup: "eu",
    label: "European Union",
    flag: "\ud83c\uddea\ud83c\uddfa",
    defaultOpen: true,
  },
  {
    jurisdictionGroup: "uk",
    label: "United Kingdom",
    flag: "\ud83c\uddec\ud83c\udde7",
    defaultOpen: true,
  },
  {
    jurisdictionGroup: "asia-pacific",
    label: "Asia-Pacific",
    flag: "\ud83c\udf0f",
    defaultOpen: true,
  },
  {
    jurisdictionGroup: "americas",
    label: "Americas",
    flag: "\ud83c\udf0e",
    defaultOpen: true,
  },
  {
    jurisdictionGroup: "middle-east-africa",
    label: "Middle East & Africa",
    flag: "\ud83c\udf0d",
    defaultOpen: true,
  },
]
