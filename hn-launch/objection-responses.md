# HN Objection Response Playbook

Prepared responses for the most likely critical comments. Each response is factual, non-defensive, and stays in the engineering lane.

---

## 1. "This is just marketing for your SaaS"

> Fair point to raise. The spec and law registry are CC-BY-4.0 and on GitHub -- anyone can use them without Phosra. The registry maps 67 laws to 45 rule categories as structured data. We built Phosra because we needed a product on top of the spec, but the spec stands alone. If someone builds a competing implementation from the same data, that's a win for interoperability.

---

## 2. "Who appointed you the standard-maker?"

> Nobody. This is a v1 proposal, not a ratified standard. The law data is sourced from public legislative records and mapped to a rule taxonomy we found useful while building compliance tooling. We published it because we couldn't find an existing open dataset that structured child safety laws this way. If a standards body like IEEE or W3C wants to formalize something better, the CC-BY-4.0 license means they can use any of this as a starting point.

---

## 3. "Child safety regulation is surveillance / nanny state"

> The spec is agnostic on whether these laws are good policy. It maps what exists: 67 laws across 7 jurisdiction groups, each with specific technical requirements. If you operate a platform with users under 18 in multiple jurisdictions, these requirements apply to you whether or not you agree with them. PCSS makes the compliance surface machine-readable so engineers can see exactly what applies to their stack.

---

## 4. "This is vaporware / does the API actually work?"

> You can test it right now. `curl https://www.phosra.com/api/compliance/laws | jq .total` returns 67. `curl https://www.phosra.com/api/compliance/laws/kosa | jq .shortName` returns "KOSA". The `/api/compliance/map` endpoint returns the full rule-category-to-law mapping. No API key needed -- it's public data served from an in-memory registry.

---

## 5. "Why not just use Apple Screen Time / PRIVO / IEEE 2089?"

> Different layers of the stack. Apple Screen Time is a single-vendor device control -- it doesn't cover YouTube's content policies or Roblox's chat settings, and it doesn't map to legal requirements. PRIVO is age verification, which is one of our 45 rule categories (`age_gate`). IEEE 2089 addresses age-appropriate design principles but doesn't provide a machine-readable law-to-rule mapping. PCSS sits below all of these as the compliance data layer: which laws apply, what they require, and which rule categories map to each.

---

## 6. "You mapped public laws -- why should I pay?"

> You shouldn't have to pay for the law data. That's why the registry is CC-BY-4.0 on GitHub. The structured mapping of 67 laws to 45 rule categories is free and always will be. Phosra (the product) adds enforcement -- actually pushing those rules to platform APIs, tracking compliance state, and handling the operational work. The data is open; the plumbing is the product.

---

## 7. "This is a censorship bus / privacy nightmare"

> The spec defines rule categories like `content_rating` and `web_category_block`, but it doesn't mandate what content to block or what ratings to apply -- those are set by parents or by the applicable laws in each jurisdiction. PCSS is a transport layer: it standardizes how parental control rules are expressed and communicated between systems. A parent using PCSS to set a PG-13 content rating is doing the same thing they'd do in each platform's settings, just in one place instead of five. The privacy model is parent-controlled, not platform-controlled.

---

## General Response Principles

1. **Lead with facts and data.** Specific numbers (67 laws, 45 categories, 7 jurisdictions) signal rigor.
2. **Acknowledge the concern.** "Fair point" or "different layers" -- never dismiss.
3. **Point to artifacts.** Link the GitHub repo, the API, or specific curl commands.
4. **One reply per thread.** If someone wants to argue, let the facts stand. Don't get into back-and-forth.
5. **Stay in the engineering lane.** Don't debate policy. Describe what exists and how it's structured.
