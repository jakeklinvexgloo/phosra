"use client"

import { createContext, useContext } from "react"
import type { DeveloperOrg, DeveloperAPIKey } from "@/lib/types"

export interface DevOrgContextValue {
  org: DeveloperOrg | null
  keys: DeveloperAPIKey[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export const DevOrgContext = createContext<DevOrgContextValue>({
  org: null,
  keys: [],
  loading: true,
  error: null,
  refetch: () => {},
})

export const useDevOrg = () => useContext(DevOrgContext)
