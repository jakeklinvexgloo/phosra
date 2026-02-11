import { test, expect, type Page } from "@playwright/test"
import path from "path"

const SCREENSHOT_DIR = path.join(__dirname, "screenshots")

/**
 * Full-site visual audit.
 *
 * Visits every public page, takes a full-page screenshot,
 * captures console errors, and validates interactive elements.
 */

// ─── Helpers ────────────────────────────────────────────────────────

/** Collect console errors while visiting a page. Retries once on 500 (dev server compiling). */
async function visitAndAudit(
  page: Page,
  urlPath: string,
  screenshotName: string,
) {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  page.on("pageerror", (err) => errors.push(err.message))

  let response = await page.goto(urlPath, { waitUntil: "domcontentloaded" })

  // Retry up to 3 times if dev server returned 500 (still compiling the page)
  for (let attempt = 0; attempt < 3 && response && response.status() >= 500; attempt++) {
    errors.length = 0
    await page.waitForTimeout(5_000)
    response = await page.goto(urlPath, { waitUntil: "domcontentloaded" })
  }

  expect(
    response?.ok() || response?.status() === 304,
    `${urlPath} returned status ${response?.status()}`,
  ).toBeTruthy()

  // Wait for hydration / animations
  await page.waitForTimeout(1_500)

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${screenshotName}.png`),
    fullPage: true,
  })

  // Filter out known benign console messages
  const realErrors = errors.filter(
    (e) =>
      !e.includes("Download the React DevTools") &&
      !e.includes("Third-party cookie") &&
      !e.includes("favicon") &&
      !e.includes("[Fast Refresh]") &&
      !e.includes("Hydration") &&
      !e.includes("Failed to load resource") &&
      !e.includes("Content Security Policy") &&
      !e.includes("upgrade-insecure-requests") &&
      !e.includes("net::ERR_") &&
      !e.includes("404 (Not Found)") &&
      !e.includes("ERR_CONNECTION") &&
      !e.includes("hydrat") &&
      !e.includes("Hydrat") &&
      !e.includes("server HTML was replaced") &&
      !e.includes("react-hydration-error") &&
      !e.includes("An error occurred during hydration") &&
      !e.includes("Warning:") &&
      !e.includes("webpack-internal://"),
  )

  return realErrors
}

// ─── 1. Public Page Screenshots & Error Check ───────────────────────

const PUBLIC_PAGES = [
  { path: "/", name: "homepage" },
  { path: "/about", name: "about" },
  { path: "/brand", name: "brand" },
  { path: "/changelog", name: "changelog" },
  { path: "/contact", name: "contact" },
  { path: "/demo", name: "demo" },
  { path: "/investors", name: "investors" },
  { path: "/newsroom", name: "newsroom" },
  { path: "/pricing", name: "pricing" },
  { path: "/privacy", name: "privacy" },
  { path: "/terms", name: "terms" },
  { path: "/docs", name: "docs" },
  { path: "/platforms", name: "platforms" },
  { path: "/compliance", name: "compliance" },
  { path: "/standards", name: "standards" },
  { path: "/playground", name: "playground" },
  { path: "/login", name: "login" },
]

test.describe("1 — Public Page Screenshots & Error Check", () => {
  for (const pg of PUBLIC_PAGES) {
    test(`${pg.name} (${pg.path}) loads without errors`, async ({ page }) => {
      const errors = await visitAndAudit(page, pg.path, `01-${pg.name}`)
      if (errors.length > 0) {
        console.log(`Console errors on ${pg.path}:`, errors)
      }
      expect(errors, `Console errors on ${pg.path}`).toHaveLength(0)
    })
  }
})

// ─── 2. Compliance Detail Page Samples ──────────────────────────────

const COMPLIANCE_SAMPLES = [
  { slug: "kosa", label: "KOSA" },
  { slug: "coppa-2", label: "COPPA 2.0" },
  { slug: "eu-dsa", label: "EU DSA" },
  { slug: "kosma", label: "KOSMA" },
]

test.describe("2 — Compliance Detail Pages", () => {
  for (const law of COMPLIANCE_SAMPLES) {
    test(`/compliance/${law.slug} loads without errors`, async ({ page }) => {
      const errors = await visitAndAudit(
        page,
        `/compliance/${law.slug}`,
        `02-compliance-${law.slug}`,
      )
      // Should have a heading with the law name or short name
      await expect(page.locator("h1").first()).toBeVisible()
      if (errors.length > 0) {
        console.log(`Console errors on /compliance/${law.slug}:`, errors)
      }
      expect(
        errors,
        `Console errors on /compliance/${law.slug}`,
      ).toHaveLength(0)
    })
  }
})

// ─── 3. Standards Detail Page Samples ───────────────────────────────

const STANDARDS_SAMPLES = [
  { slug: "four-norms", label: "Four Norms" },
  { slug: "common-sense-media", label: "Common Sense Media" },
  { slug: "wait-until-8th", label: "Wait Until 8th" },
]

test.describe("3 — Standards Detail Pages", () => {
  for (const std of STANDARDS_SAMPLES) {
    test(`/standards/${std.slug} loads without errors`, async ({ page }) => {
      const errors = await visitAndAudit(
        page,
        `/standards/${std.slug}`,
        `03-standards-${std.slug}`,
      )
      await expect(page.locator("h1").first()).toBeVisible()
      if (errors.length > 0) {
        console.log(`Console errors on /standards/${std.slug}:`, errors)
      }
      expect(
        errors,
        `Console errors on /standards/${std.slug}`,
      ).toHaveLength(0)
    })
  }
})

// ─── 4. Newsroom Detail Page Samples ────────────────────────────────

const NEWSROOM_SAMPLES = [
  { slug: "introducing-phosra", label: "Introducing Phosra" },
  { slug: "community-standards-partnership", label: "Community Standards" },
]

test.describe("4 — Newsroom Detail Pages", () => {
  for (const article of NEWSROOM_SAMPLES) {
    test(`/newsroom/${article.slug} loads without errors`, async ({
      page,
    }) => {
      const errors = await visitAndAudit(
        page,
        `/newsroom/${article.slug}`,
        `04-newsroom-${article.slug}`,
      )
      await expect(page.locator("h1").first()).toBeVisible()
      if (errors.length > 0) {
        console.log(`Console errors on /newsroom/${article.slug}:`, errors)
      }
      expect(
        errors,
        `Console errors on /newsroom/${article.slug}`,
      ).toHaveLength(0)
    })
  }
})

// ─── 5. Navigation Click-Through ────────────────────────────────────

const NAV_LINKS = [
  { label: "Docs", href: "/docs" },
  { label: "Platforms", href: "/platforms" },
  { label: "Compliance", href: "/compliance" },
  { label: "Pricing", href: "/pricing" },
  { label: "Playground", href: "/playground" },
]

test.describe("5 — Navigation Click-Through", () => {
  test("homepage nav links navigate correctly", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" })
    const nav = page.locator("nav").first()
    await expect(nav).toBeVisible({ timeout: 10_000 })

    for (const link of NAV_LINKS) {
      await page.goto("/", { waitUntil: "domcontentloaded" })
      const navLink = nav.getByRole("link", { name: link.label, exact: true })
      await expect(navLink).toBeAttached()
      await navLink.click()
      await page.waitForURL(`**${link.href}*`, { timeout: 10_000 })
      expect(page.url()).toContain(link.href)
    }
  })

  test("public page header nav links navigate correctly", async ({ page }) => {
    await page.goto("/about", { waitUntil: "domcontentloaded" })
    const header = page.locator("header").first()
    await expect(header).toBeVisible({ timeout: 10_000 })

    for (const link of NAV_LINKS) {
      await page.goto("/about", { waitUntil: "domcontentloaded" })
      const headerLink = header.getByRole("link", {
        name: link.label,
        exact: true,
      })
      await expect(headerLink).toBeAttached()
      await headerLink.click()
      await page.waitForURL(`**${link.href}*`, { timeout: 10_000 })
      expect(page.url()).toContain(link.href)
    }
  })

  test("footer links navigate correctly", async ({ page }) => {
    await page.goto("/pricing", { waitUntil: "domcontentloaded" })
    const footer = page.locator("footer")
    await expect(footer).toBeVisible({ timeout: 15_000 })

    // Check key footer links exist and have valid hrefs
    const footerLinks = [
      { name: "Changelog", href: "/changelog" },
      { name: "Compliance Hub", href: "/compliance" },
      { name: "About", href: "/about" },
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
    ]

    for (const fl of footerLinks) {
      const link = footer.getByRole("link", { name: fl.name }).first()
      await expect(link).toBeVisible()
      const href = await link.getAttribute("href")
      expect(href).toContain(fl.href)
    }
  })
})

// ─── 6. Interactive Elements ────────────────────────────────────────

test.describe("6 — Interactive Elements", () => {
  test("compliance hub: search and filter", async ({ page }) => {
    await page.goto("/compliance", { waitUntil: "domcontentloaded" })
    await page.waitForTimeout(1_000)

    // Search box
    const searchInput = page
      .getByPlaceholder(/search/i)
      .or(page.locator('input[type="search"]'))
      .or(page.locator('input[type="text"]'))
      .first()
    if (await searchInput.isVisible()) {
      await searchInput.fill("COPPA")
      await page.waitForTimeout(500)
      // Should filter results — at least one result visible
      await expect(page.getByText(/COPPA/i).first()).toBeVisible()
      await searchInput.clear()
    }

    // Click a jurisdiction filter if present
    const filterButton = page
      .getByRole("button", { name: /United States/i })
      .or(page.getByRole("button", { name: /Federal/i }))
      .first()
    if (await filterButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await filterButton.click()
      await page.waitForTimeout(500)
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "06-compliance-filtered.png"),
      fullPage: true,
    })
  })

  test("pricing: FAQ accordion interaction", async ({ page }) => {
    await page.goto("/pricing", { waitUntil: "domcontentloaded" })
    await page.waitForTimeout(1_000)

    // Look for FAQ section — typically has accordion/collapsible items
    const faqHeading = page.getByRole("heading", { name: /FAQ|frequently/i }).first()
    if (await faqHeading.isVisible({ timeout: 5_000 }).catch(() => false)) {
      // Scroll to FAQ
      await faqHeading.scrollIntoViewIfNeeded()

      // Click first accordion trigger
      const accordionTrigger = page
        .locator('[data-state="closed"]')
        .or(page.locator("details summary"))
        .or(page.locator("button").filter({ hasText: /\?/ }))
        .first()
      if (
        await accordionTrigger.isVisible({ timeout: 3_000 }).catch(() => false)
      ) {
        await accordionTrigger.click()
        await page.waitForTimeout(500)
      }
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "06-pricing-faq.png"),
      fullPage: true,
    })
  })

  test("mobile viewport: hamburger menu works", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/", { waitUntil: "domcontentloaded" })
    await page.waitForTimeout(1_000)

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "06-mobile-home.png"),
      fullPage: true,
    })

    // Open hamburger menu
    const hamburger = page
      .locator("nav button")
      .filter({ has: page.locator("svg") })
      .first()
    await expect(hamburger).toBeVisible({ timeout: 10_000 })
    await hamburger.click()
    await page.waitForTimeout(500)

    // Verify menu links are visible
    for (const link of NAV_LINKS) {
      await expect(
        page.getByRole("link", { name: link.label, exact: true }).first(),
      ).toBeVisible()
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "06-mobile-menu-open.png"),
      fullPage: true,
    })
  })

  test("mobile viewport: public page hamburger menu works", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/pricing", { waitUntil: "domcontentloaded" })
    await page.waitForTimeout(1_000)

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "06-mobile-pricing.png"),
      fullPage: true,
    })

    const hamburger = page
      .locator("header button")
      .filter({ has: page.locator("svg") })
      .first()
    await expect(hamburger).toBeVisible({ timeout: 10_000 })
    await hamburger.click()
    await page.waitForTimeout(500)

    for (const link of NAV_LINKS) {
      await expect(
        page.getByRole("link", { name: link.label, exact: true }).first(),
      ).toBeVisible()
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "06-mobile-pricing-menu.png"),
      fullPage: true,
    })
  })
})

// ─── 7. Structural Checks ──────────────────────────────────────────

test.describe("7 — Structural Checks", () => {
  // Pages with both header and footer
  const pagesWithHeaderFooter = [
    "/about",
    "/pricing",
    "/compliance",
    "/platforms",
    "/standards",
    "/newsroom",
    "/changelog",
    "/brand",
    "/investors",
    "/contact",
  ]

  for (const pg of pagesWithHeaderFooter) {
    test(`${pg} has header and footer`, async ({ page }) => {
      await page.goto(pg, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(2_000)
      await expect(page.locator("header").first()).toBeVisible({
        timeout: 10_000,
      })
      await expect(page.locator("footer").first()).toBeVisible({
        timeout: 15_000,
      })
    })
  }

  // /docs has a header but no footer (docs layout by design)
  test("/docs has header", async ({ page }) => {
    await page.goto("/docs", { waitUntil: "domcontentloaded" })
    await page.waitForTimeout(2_000)
    await expect(page.locator("header").first()).toBeVisible({
      timeout: 10_000,
    })
  })
})
