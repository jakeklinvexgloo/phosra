"use client"

import { StytchProvider as Provider } from "@stytch/nextjs"
import { createStytchHeadlessClient } from "@stytch/nextjs/headless"
import { ReactNode } from "react"

const stytch = createStytchHeadlessClient(
  process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN || "",
)

export default function StytchProvider({ children }: { children: ReactNode }) {
  return <Provider stytch={stytch}>{children}</Provider>
}
