import { test, expect } from "@playwright/test"

/**
 * Full-site audit: unified navigation links + consistent numbers.
 *
 * Navigation: both navbars must show exactly
 *   Docs | Platforms | Compliance | Pricing | Playground
 *
 * Numbers (canonical values):
 *   Laws/regulations  → 50+ or 52 (registry has 52)
 *   Rule categories   → 40
 *   Platforms          → 15+
 *   Rating systems     → 5
 */

const EXPECTED_NAV_LABELS = ["Docs", "Platforms", "Compliance", "Pricing", "Playground"]

// ─── Navigation Audit ───────────────────────────────────────────────

test.describe("Unified Navigation — Desktop", () => {
  test("homepage navbar has correct 5 links", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("domcontentloaded")

    // Homepage Navbar: find the desktop link container (hidden on mobile, flex on md+)
    // Use the nav element that contains the logo
    const nav = page.locator("nav").first()
    await expect(nav).toBeVisible({ timeout: 10_000 })

    for (const label of EXPECTED_NAV_LABELS) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeAttached()
    }

    // Should NOT have Features or Changelog anywhere in this nav
    await expect(nav.getByRole("link", { name: "Features" })).toHaveCount(0)
    await expect(nav.getByRole("link", { name: "Changelog" })).toHaveCount(0)
  })

  const publicPages = ["/docs", "/platforms", "/compliance", "/pricing", "/playground", "/about", "/changelog"]
  for (const path of publicPages) {
    test(`PublicPageHeader on ${path} has correct 5 links`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState("domcontentloaded")

      const header = page.locator("header").first()
      await expect(header).toBeVisible({ timeout: 10_000 })

      for (const label of EXPECTED_NAV_LABELS) {
        await expect(header.getByRole("link", { name: label, exact: true })).toBeAttached()
      }

      // Should NOT have Changelog or Features in the header nav
      await expect(header.getByRole("link", { name: "Changelog" })).toHaveCount(0)
      await expect(header.getByRole("link", { name: "Features" })).toHaveCount(0)
    })
  }

  test("PublicPageHeader highlights active link on /compliance", async ({ page }) => {
    await page.goto("/compliance")
    await page.waitForLoadState("domcontentloaded")

    const header = page.locator("header").first()
    const complianceLink = header.getByRole("link", { name: "Compliance", exact: true })
    await expect(complianceLink).toBeVisible({ timeout: 10_000 })
    // Active link gets font-medium class
    await expect(complianceLink).toHaveClass(/font-medium/)
  })
})

test.describe("Unified Navigation — Mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test("homepage mobile menu has correct 5 links after opening", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("domcontentloaded")

    // Click the hamburger button (it has a Menu icon)
    const hamburger = page.locator("nav button").filter({ has: page.locator("svg") }).first()
    await expect(hamburger).toBeVisible({ timeout: 10_000 })
    await hamburger.click()
    await page.waitForTimeout(500)

    // After clicking, all 5 nav links should be visible somewhere on the page
    for (const label of EXPECTED_NAV_LABELS) {
      await expect(page.getByRole("link", { name: label, exact: true }).first()).toBeVisible()
    }
  })

  test("public page mobile menu has correct 5 links after opening", async ({ page }) => {
    await page.goto("/pricing")
    await page.waitForLoadState("domcontentloaded")

    // Click the hamburger
    const hamburger = page.locator("header button").filter({ has: page.locator("svg") }).first()
    await expect(hamburger).toBeVisible({ timeout: 10_000 })
    await hamburger.click()
    await page.waitForTimeout(500)

    for (const label of EXPECTED_NAV_LABELS) {
      await expect(page.getByRole("link", { name: label, exact: true }).first()).toBeVisible()
    }
  })
})

// ─── Hero CTA Audit ─────────────────────────────────────────────────

test.describe("Hero CTA", () => {
  test('"Read the Docs" links to /docs (not /dashboard/docs)', async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("domcontentloaded")

    // Find the link containing "Read the Docs" text
    const docsLink = page.getByRole("link", { name: /Read the Docs/i }).first()
    await expect(docsLink).toBeVisible({ timeout: 15_000 })
    const href = await docsLink.getAttribute("href")
    expect(href).toBe("/docs")
    expect(href).not.toContain("/dashboard")
  })
})

// ─── /dashboard/docs Redirect ───────────────────────────────────────

test.describe("Dashboard docs redirect", () => {
  test("/dashboard/docs does not render docs inside dashboard chrome", async ({ page }) => {
    // Navigate to /dashboard/docs — without auth it may redirect to login or /docs
    // The key assertion: it should NOT render the DocsSidebar within the dashboard
    await page.goto("/dashboard/docs")
    await page.waitForTimeout(3_000)

    const url = page.url()
    // Should have left /dashboard/docs — either to /docs or to /login
    const stayedOnDashboardDocs = url.includes("/dashboard/docs")
    if (stayedOnDashboardDocs) {
      // If still there (e.g. SSR rendered before client redirect), the layout should return null
      // so no DocsSidebar should be visible
      await expect(page.locator(".docs-three-col")).not.toBeVisible()
    }
    // Otherwise the redirect worked
  })
})

// ─── Numbers Consistency Audit ──────────────────────────────────────

test.describe("Numbers Audit — Rule Categories = 40", () => {
  test("about page metrics shows 40 rule categories", async ({ page }) => {
    await page.goto("/about")
    await page.waitForLoadState("domcontentloaded")
    // Wait for animated counters to finish
    await page.waitForTimeout(2_000)

    await expect(page.getByText("Rule Categories")).toBeVisible({ timeout: 10_000 })
    // The metric "40" should be near "Rule Categories"
    const metricsSection = page.locator("text=Rule Categories").locator("..")
    await expect(metricsSection).toContainText("40")
  })

  test("pricing page shows 40 policy categories", async ({ page }) => {
    await page.goto("/pricing")
    await expect(page.getByText("All 40 policy categories")).toBeVisible({ timeout: 10_000 })
  })

  test("docs page shows 40 in preamble stats", async ({ page }) => {
    await page.goto("/docs")
    await page.waitForLoadState("domcontentloaded")
    await page.waitForTimeout(2_000)

    // The preamble section has a stats grid with "40" and "Policy Categories"
    const preamble = page.locator("#preamble")
    await expect(preamble).toBeVisible({ timeout: 15_000 })
    // Look for the stat that contains both "40" and "Policy Categories"
    await expect(preamble.locator("text=Policy Categories").first().locator("..")).toContainText("40")
  })

  test("docs section heading says 40 Mandatory Policy Categories", async ({ page }) => {
    await page.goto("/docs")
    await expect(page.getByRole("heading", { name: /40 Mandatory Policy Categories/ }).first()).toBeVisible({ timeout: 15_000 })
  })
})

test.describe("Numbers Audit — Compliance Laws = 50+", () => {
  test("about page metrics shows 50+ compliance laws", async ({ page }) => {
    await page.goto("/about")
    await page.waitForLoadState("domcontentloaded")
    await page.waitForTimeout(2_000)

    await expect(page.getByText("Compliance Laws")).toBeVisible({ timeout: 10_000 })
    const metricsSection = page.locator("text=Compliance Laws").locator("..")
    await expect(metricsSection).toContainText("50+")
  })

  test("about page values section references 49 more laws", async ({ page }) => {
    await page.goto("/about")
    await expect(page.getByText(/49 more child safety laws/)).toBeVisible({ timeout: 10_000 })
  })

  test("footer shows 50+ laws link", async ({ page }) => {
    await page.goto("/pricing") // Use a shorter page to make footer visible faster
    const footer = page.locator("footer")
    await expect(footer.getByRole("link", { name: /50\+ Laws/ })).toBeVisible({ timeout: 10_000 })
  })
})

test.describe("Numbers Audit — Platforms = 15+", () => {
  test("homepage hero mentions 15+ platforms", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("domcontentloaded")
    // The hero text contains "15+ platforms" — may be split across elements
    await expect(page.locator("section").first().getByText(/15\+ platforms/).first()).toBeVisible({ timeout: 15_000 })
  })

  test("about page metrics shows 15+ platform adapters", async ({ page }) => {
    await page.goto("/about")
    await page.waitForLoadState("domcontentloaded")
    await page.waitForTimeout(2_000)

    await expect(page.getByText("Platform Adapters")).toBeVisible({ timeout: 10_000 })
    const metricsSection = page.locator("text=Platform Adapters").locator("..")
    await expect(metricsSection).toContainText("15+")
  })
})

test.describe("Numbers Audit — Rating Systems = 5", () => {
  test("about page metrics shows 5 rating systems", async ({ page }) => {
    await page.goto("/about")
    await page.waitForLoadState("domcontentloaded")
    await page.waitForTimeout(2_000)

    await expect(page.getByText("Rating Systems")).toBeVisible({ timeout: 10_000 })
    const metricsSection = page.locator("text=Rating Systems").locator("..")
    await expect(metricsSection).toContainText("5")
  })

  test("docs preamble shows 5 rating systems", async ({ page }) => {
    await page.goto("/docs")
    const preamble = page.locator("#preamble")
    await expect(preamble).toBeVisible({ timeout: 15_000 })
    await expect(preamble.getByText("Rating Systems")).toBeVisible()
  })
})

// ─── Cross-page number consistency ──────────────────────────────────

test.describe("No stale numbers", () => {
  test("pricing comparison table shows 40 for all tiers", async ({ page }) => {
    await page.goto("/pricing")
    const policyRow = page.locator("tr", { hasText: "Policy categories" })
    await expect(policyRow).toBeVisible({ timeout: 10_000 })
    await expect(policyRow.getByText("40", { exact: true }).first()).toBeVisible()
    await expect(policyRow.getByText("40 + custom")).toBeVisible()
  })

  test("changelog v1.0 mentions 40 policy categories", async ({ page }) => {
    await page.goto("/changelog")
    await expect(page.getByText(/40 policy categories/).first()).toBeVisible({ timeout: 10_000 })
  })

  test("login page mentions 15+ platforms", async ({ page }) => {
    await page.goto("/login")
    await page.waitForLoadState("domcontentloaded")
    // The login sidebar benefits list mentions "15+ platforms"
    await expect(page.getByText(/15\+ platforms/).first()).toBeVisible({ timeout: 10_000 })
  })
})

// ─── Footer Audit ───────────────────────────────────────────────────

test.describe("Footer Links", () => {
  test("footer has Changelog in Product section", async ({ page }) => {
    await page.goto("/pricing")
    const footer = page.locator("footer")
    await expect(footer.getByRole("link", { name: "Changelog" })).toBeVisible({ timeout: 10_000 })
  })

  test("footer has Compliance Hub link", async ({ page }) => {
    await page.goto("/pricing")
    const footer = page.locator("footer")
    await expect(footer.getByRole("link", { name: "Compliance Hub" })).toBeVisible({ timeout: 10_000 })
  })
})
