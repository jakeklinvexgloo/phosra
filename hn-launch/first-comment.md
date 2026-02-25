# HN First Comment (Ready to Paste)

---

Author here. Happy to answer questions about the spec, the law registry, or the rule category taxonomy.

Quick background: I've been tracking child safety regulations for a few years. The compliance landscape is genuinely fragmented -- 67 laws across 7 jurisdiction groups, each with different age thresholds, consent requirements, and content categories. We open-sourced the law registry (https://github.com/jakeklinvexgloo/pcss-spec) because we think that mapping should be shared infrastructure.

PCSS also scratches a personal itch. I have a 7-year-old, and setting consistent content rules means configuring YouTube, Roblox, the App Store, the TV, and the WiFi filter separately -- five systems with five different age models and no interoperability. The same fragmentation that makes compliance expensive for platforms makes parental controls painful for families. PCSS tries to fix both with the same vocabulary.

The data model:

- 67 laws mapped (status: enacted/passed/pending/proposed/injunction)
- 7 jurisdiction groups (US federal, US state, EU, UK, Asia-Pacific, Americas, Middle East & Africa)
- 45 rule categories (e.g., algo_feed_control, parental_consent_gate, csam_reporting)
- 5 regulated platform categories (streaming, gaming, device, browser, DNS)
- Age-to-rating mapping across MPAA, ESRB, PEGI, Apple, TV Parental Guidelines

The spec is CC-BY-4.0. The law registry is on GitHub (https://github.com/jakeklinvexgloo/pcss-spec). Try the live compliance checker at https://www.phosra.com/check -- enter your platform type and jurisdictions to see which rule categories apply.

Feedback on the rule category schema is very welcome -- especially from anyone who's built age-gating or content classification systems.

---
