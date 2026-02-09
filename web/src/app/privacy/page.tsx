"use client"

import { LegalPageShell } from "@/components/marketing/legal/LegalPageShell"
import { PRIVACY_SECTIONS } from "@/lib/legal-content"

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      lastUpdated="February 2026"
      sections={PRIVACY_SECTIONS}
    />
  )
}
