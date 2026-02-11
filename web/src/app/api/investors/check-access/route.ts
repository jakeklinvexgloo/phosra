import { NextRequest, NextResponse } from "next/server"
import { isInvestorAllowed } from "@/lib/investors/config"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string }

    if (!email) {
      return NextResponse.json({ allowed: false })
    }

    return NextResponse.json({ allowed: isInvestorAllowed(email) })
  } catch {
    return NextResponse.json({ allowed: false })
  }
}
