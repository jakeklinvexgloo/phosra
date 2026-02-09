"use client"

import { LegalPageShell } from "@/components/marketing/legal/LegalPageShell"
import { TERMS_SECTIONS } from "@/lib/legal-content"

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      lastUpdated="February 2026"
      sections={TERMS_SECTIONS}
    />
  )
}
