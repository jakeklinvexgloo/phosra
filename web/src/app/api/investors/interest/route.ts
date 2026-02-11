import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, company, title, intro } = body as {
      name?: string
      email?: string
      company?: string
      title?: string
      intro?: string
    }

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 },
      )
    }

    const notifyEmail = process.env.INVESTOR_NOTIFY_EMAIL
    if (!notifyEmail) {
      console.error("INVESTOR_NOTIFY_EMAIL is not configured")
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 },
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const { data, error: sendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Phosra Investors <onboarding@resend.dev>",
      to: notifyEmail,
      subject: `Investor Interest: ${name}${company ? ` from ${company}` : ""}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px;">
          <h2 style="color: #0D1B2A; margin-bottom: 24px;">New Investor Interest</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 120px;">Name</td>
              <td style="padding: 8px 0; font-weight: 600;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Email</td>
              <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
            </tr>
            ${company ? `<tr><td style="padding: 8px 0; color: #666;">Company</td><td style="padding: 8px 0;">${escapeHtml(company)}</td></tr>` : ""}
            ${title ? `<tr><td style="padding: 8px 0; color: #666;">Title</td><td style="padding: 8px 0;">${escapeHtml(title)}</td></tr>` : ""}
          </table>
          ${intro ? `<div style="margin-top: 20px; padding: 16px; background: #f8f9fa; border-radius: 8px;"><p style="color: #666; margin: 0 0 8px; font-size: 13px;">Introduction</p><p style="margin: 0;">${escapeHtml(intro)}</p></div>` : ""}
        </div>
      `,
    })

    if (sendError) {
      console.error("Resend error:", sendError)
      return NextResponse.json(
        { error: `Email delivery failed: ${sendError.message}` },
        { status: 500 },
      )
    }

    console.log("Resend response:", JSON.stringify({ data, sendError }, null, 2))
    console.log("Sent from:", process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev")
    console.log("Sent to:", notifyEmail)
    return NextResponse.json({ ok: true, id: data?.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Investor interest email failed:", message)
    return NextResponse.json(
      { error: "Failed to send. Please try again." },
      { status: 500 },
    )
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
