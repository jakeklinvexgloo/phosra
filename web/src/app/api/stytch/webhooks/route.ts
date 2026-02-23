import { NextRequest, NextResponse } from "next/server"
import { Webhook } from "svix"
import { getStytchClient } from "@/lib/stytch-server"
import { queryOne } from "@/lib/investors/db"

const webhookSecret = process.env.STYTCH_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headers = {
    "svix-id": req.headers.get("svix-id") || "",
    "svix-timestamp": req.headers.get("svix-timestamp") || "",
    "svix-signature": req.headers.get("svix-signature") || "",
  }

  let payload: any
  try {
    const wh = new Webhook(webhookSecret)
    payload = wh.verify(body, headers)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  if (payload.action === "CREATE" && payload.object_type === "user") {
    const user = payload.user
    const phone = user.phone_numbers?.[0]?.phone_number

    if (phone) {
      const approved = await queryOne<{ name: string; company: string }>(
        "SELECT name, company FROM investor_approved_phones WHERE phone_e164 = $1 AND is_active = TRUE",
        [phone],
      )

      if (approved) {
        const client = getStytchClient()
        await client.users.update({
          user_id: user.user_id,
          trusted_metadata: {
            role: "investor",
            is_approved: true,
            company: approved.company,
          },
        })
      }
    }
  }

  return NextResponse.json({ received: true })
}
