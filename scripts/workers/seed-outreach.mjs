#!/usr/bin/env node

/**
 * seed-outreach.mjs
 *
 * Comprehensive seed script — hand-curated from outreach-contacts.md,
 * outreach-tech-companies.md, and outreach-capability-mapping.md.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/workers/seed-outreach.mjs
 *   node scripts/workers/seed-outreach.mjs              # local defaults
 *   node scripts/workers/seed-outreach.mjs --force      # clear + re-seed
 */

import pg from "pg"

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://guardiangate:guardiangate_dev@localhost:5432/guardiangate"

const FORCE = process.argv.includes("--force")

// ── Hand-curated contact data ──────────────────────────────────

const contacts = [
  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: THINK TANK / ADVOCACY — from outreach-contacts.md
  // ═══════════════════════════════════════════════════════════════

  // EPPC
  { name: "Clare Morell", org: "EPPC", title: "Fellow, Technology & Human Flourishing", contact_type: "think_tank", twitter_handle: "ClareMorellEPPC", linkedin_url: "https://linkedin.com/in/clare-morell-2903a980/", relevance_score: 89, priority_tier: 1, tags: ["think-tank", "priority-1", "kosa", "parental-controls"], notes: "Policy directly adopted into Utah state law. Leads EPPC Technology & Human Flourishing program." },
  { name: "Adam Candeub", org: "EPPC", title: "Director, Internet Accountability Project", contact_type: "think_tank", relevance_score: 60, priority_tier: 3, tags: ["think-tank"], notes: "Co-convened working group w/ Morell, Twenge, Wilcox." },

  // Common Sense Media
  { name: "Jim Steyer", org: "Common Sense Media", title: "Founder & CEO", contact_type: "advocacy", twitter_handle: "jimsteyer", relevance_score: 91, priority_tier: 1, tags: ["advocacy", "priority-1", "ratings", "pre-built-standard"], notes: "Built the largest children's media/tech advocacy org. Stanford professor. Pre-built standard in Phosra (5,421 adoptions)." },
  { name: "Amina Fazlullah", org: "Common Sense Media", title: "Sr. Director, Equity Policy", contact_type: "advocacy", linkedin_url: "https://linkedin.com/in/amina-fazlullah-08664235/", relevance_score: 70, priority_tier: 2, tags: ["advocacy", "policy"], notes: "Former Mozilla Tech Policy Fellow. D.C.-based policy lead." },

  // Center for Humane Technology
  { name: "Tristan Harris", org: "Center for Humane Technology", title: "Co-Founder & Executive Director", contact_type: "advocacy", email: "hello@humanetech.com", twitter_handle: "tristanharris", linkedin_url: "https://linkedin.com/in/tristanharris/", relevance_score: 93, priority_tier: 1, tags: ["advocacy", "priority-1", "pre-built-standard", "high-profile"], notes: "Former Google Design Ethicist. Star of 'The Social Dilemma.' Pre-built Humane Tech Standard (2,198 adoptions)." },
  { name: "Aza Raskin", org: "Center for Humane Technology", title: "Co-Founder & President", contact_type: "advocacy", twitter_handle: "aza", linkedin_url: "https://linkedin.com/in/azaraskin/", relevance_score: 80, priority_tier: 2, tags: ["advocacy", "design"], notes: "Co-invented infinite scroll; now advocates against manipulative design." },

  // IFS
  { name: "Michael Toscano", org: "Institute for Family Studies", title: "Sr. Fellow, Director Family First Technology Initiative", contact_type: "think_tank", linkedin_url: "https://linkedin.com/in/michael-toscano-ab662896/", relevance_score: 84, priority_tier: 1, tags: ["think-tank", "priority-1", "policy"], notes: "Co-convened working group that produced policy ideas adopted by Utah. Directs IFS tech policy arm." },
  { name: "Jean Twenge", org: "Institute for Family Studies / SDSU", title: "Sr. Fellow / Professor of Psychology", contact_type: "academic", twitter_handle: "jean_twenge", relevance_score: 84, priority_tier: 2, tags: ["academic", "author", "ifs"], notes: "Author of 'iGen' and 'Generations.' 190+ scientific publications." },
  { name: "W. Bradford Wilcox", org: "Institute for Family Studies", title: "Sr. Fellow (Founder)", contact_type: "academic", email: "chris@ifstudies.org", relevance_score: 60, priority_tier: 3, tags: ["academic", "ifs"], notes: "UVA Professor of Sociology. Media contact: chris@ifstudies.org." },

  // AEI
  { name: "Shane Tews", org: "American Enterprise Institute", title: "Nonresident Sr. Fellow", contact_type: "think_tank", twitter_handle: "ShaneTews", linkedin_url: "https://linkedin.com/in/shane-tews-b20230/", relevance_score: 70, priority_tier: 1, tags: ["think-tank", "priority-1", "parental-controls"], notes: "Authored 'Protecting Youth Online: A Guide to Parental Controls.' Advocates app-level responsibility." },

  // Heritage Foundation
  { name: "Kara Frederick", org: "Heritage Foundation", title: "Director (fmr), Tech Policy Center", contact_type: "think_tank", twitter_handle: "karaafrederick", linkedin_url: "https://linkedin.com/in/kara-frederick-965a33129/", relevance_score: 85, priority_tier: 2, tags: ["think-tank", "kosa", "coppa"], notes: "Former Facebook team lead & DoD counterterrorism analyst. Led Heritage advocacy for KOSA/COPPA 2.0." },
  { name: "Daniel Cochrane", org: "Heritage Foundation", title: "Sr. Research Associate, Center for Technology & Human Person", contact_type: "think_tank", twitter_handle: "RealDCochrane", linkedin_url: "https://linkedin.com/in/daniel-evan-cochrane", relevance_score: 85, priority_tier: 1, tags: ["think-tank", "priority-1", "platform-accountability"], notes: "Testified before House on data privacy & kids on social media." },

  // R Street
  { name: "Shoshana Weissmann", org: "Abundance Institute (fmr R Street)", title: "Policy Advisor", contact_type: "think_tank", twitter_handle: "senatorshoshana", email: "scweissmann@gmail.com", relevance_score: 35, priority_tier: 3, tags: ["think-tank", "free-expression", "skeptic"], notes: "Critic of KOSA from free-expression angle. Low engagement likelihood but bipartisan signal." },

  // BPC
  { name: "Marilyn Serafini", org: "Bipartisan Policy Center", title: "Executive Director", contact_type: "think_tank", twitter_handle: "marilynserafini", relevance_score: 71, priority_tier: 3, tags: ["think-tank", "bipartisan"], notes: "Leads BPC tech & health program." },
  { name: "Gabriel Loud", org: "Bipartisan Policy Center", title: "Technology Program contact", contact_type: "think_tank", email: "gloud@bipartisanpolicy.org", relevance_score: 71, priority_tier: 3, tags: ["think-tank", "bipartisan"], notes: "Point of contact for BPC technology program." },

  // NCMEC
  { name: "Michelle DeLaune", org: "NCMEC", title: "President & CEO", contact_type: "advocacy", twitter_handle: "NCMEC_CEO", linkedin_url: "https://linkedin.com/in/michelle-delaune-b4494ba/", relevance_score: 76, priority_tier: 2, tags: ["advocacy", "csam", "law-enforcement"], notes: "First woman to lead NCMEC. Testified before Congress multiple times." },
  { name: "Yiota Souras", org: "NCMEC", title: "Chief Legal Officer", contact_type: "advocacy", relevance_score: 70, priority_tier: 3, tags: ["advocacy", "legal", "csam"], notes: "Oversees legislative matters. Led FOSTA/SESTA enactment." },

  // CDD
  { name: "Jeff Chester", org: "Center for Digital Democracy", title: "Executive Director & Co-Founder", contact_type: "advocacy", email: "jeff@democraticmedia.org", relevance_score: 80, priority_tier: 2, tags: ["advocacy", "coppa", "privacy"], notes: "Led the campaign for original COPPA (1998). Pioneer of children's digital privacy advocacy." },

  // EPIC
  { name: "Alan Butler", org: "EPIC", title: "Executive Director & President", contact_type: "advocacy", twitter_handle: "AlanInDC", linkedin_url: "https://linkedin.com/in/alan-butler-05369218/", relevance_score: 79, priority_tier: 2, tags: ["advocacy", "privacy", "aadc"], notes: "Testified before Senate Judiciary and House Oversight on children's safety." },
  { name: "Caitriona Fitzgerald", org: "EPIC", title: "Deputy Director", contact_type: "advocacy", relevance_score: 70, priority_tier: 3, tags: ["advocacy", "aadc"], notes: "Testified in support of Georgia AADC. Published model platform design legislation." },

  // FPF
  { name: "Jules Polonetsky", org: "Future of Privacy Forum", title: "CEO", contact_type: "think_tank", email: "julespol@fpf.org", linkedin_url: "https://linkedin.com/in/julespolonetsky/", relevance_score: 74, priority_tier: 2, tags: ["think-tank", "privacy"], notes: "Former AOL Chief Privacy Officer, former NYC Council member." },
  { name: "Bailey Sanchez", org: "Future of Privacy Forum", title: "Sr. Counsel, Youth & Education Privacy", contact_type: "think_tank", linkedin_url: "https://linkedin.com/in/baileysanchez/", relevance_score: 70, priority_tier: 3, tags: ["think-tank", "coppa", "aadc"], notes: "Published FPF's COPPA 2.0 redline. Tracks state AADC adoption." },

  // Brookings
  { name: "Nicol Turner Lee", org: "Brookings Institution", title: "Sr. Fellow; Director, Center for Technology Innovation", contact_type: "academic", twitter_handle: "drturnerlee", linkedin_url: "https://linkedin.com/in/drnicolturnerlee/", relevance_score: 72, priority_tier: 3, tags: ["academic", "safety-by-design"], notes: "Co-authored 'Youth Internet Safety: Risks, Responses, and Research Recommendations.'" },

  // 5Rights
  { name: "Baroness Beeban Kidron", org: "5Rights Foundation", title: "Founder & Honorary President", contact_type: "advocacy", twitter_handle: "5RightsFound", relevance_score: 86, priority_tier: 2, tags: ["advocacy", "aadc", "international", "pre-built-standard"], notes: "UK House of Lords. Author of UK Age-Appropriate Design Code. Pre-built 5Rights Standard (1,567 adoptions)." },

  // Internet Safety Labs
  { name: "Lisa LeVasseur", org: "Internet Safety Labs", title: "Founder & Executive Director", contact_type: "advocacy", email: "admin@internetsafetylabs.org", twitter_handle: "LALeVasseur", linkedin_url: "https://linkedin.com/in/lisalevasseur/", relevance_score: 64, priority_tier: 3, tags: ["advocacy", "testing", "edtech"], notes: "Founded first independent digital product safety testing org." },

  // NCOSE
  { name: "Dawn Hawkins", org: "NCOSE", title: "SVP & Executive Director", contact_type: "advocacy", twitter_handle: "DawnHawkins33", linkedin_url: "https://linkedin.com/in/dawn-hawkins-84575917/", relevance_score: 83, priority_tier: 2, tags: ["advocacy", "exploitation", "pre-built-standard"], notes: "United 300+ orgs in coalition. Testified before Congress. Pre-built NCOSE Digital Safety Standard." },

  // Aspen
  { name: "Vivian Schiller", org: "Aspen Digital", title: "VP & Executive Director", contact_type: "advocacy", twitter_handle: "vivian", linkedin_url: "https://linkedin.com/in/vivianschiller/", relevance_score: 62, priority_tier: 3, tags: ["advocacy", "convening"], notes: "Former NPR president, NYT digital head. Leads digital wellbeing among youth initiative." },

  // ── ADVOCACY ORGANIZATIONS ─────────────────────────────────────

  // Fairplay
  { name: "Josh Golin", org: "Fairplay", title: "Executive Director", contact_type: "advocacy", linkedin_url: "https://linkedin.com/in/josh-golin-7040987/", relevance_score: 95, priority_tier: 1, tags: ["advocacy", "priority-1", "pre-built-standard", "ftc"], notes: "Led FTC complaint → Google COPPA settlement. Pre-built Fairplay Standard (3,156 adoptions). #1 ranked outreach target." },
  { name: "Haley Hinkle", org: "Fairplay", title: "Policy Counsel", contact_type: "advocacy", relevance_score: 80, priority_tier: 2, tags: ["advocacy", "kosa", "legal"], notes: "Authored KOSA legal analysis. Testified before MN House." },

  // ParentsTogether
  { name: "Justin Ruben", org: "ParentsTogether", title: "Co-Director", contact_type: "advocacy", relevance_score: 90, priority_tier: 1, tags: ["advocacy", "priority-1", "pre-built-standard", "grassroots"], notes: "Co-founded org mobilizing 2.5M+ parents. Pre-built ParentsTogether Standard (2,834 adoptions)." },
  { name: "Beth Messersmith", org: "ParentsTogether", title: "Co-Director", contact_type: "advocacy", relevance_score: 80, priority_tier: 2, tags: ["advocacy", "grassroots"] },

  // Wait Until 8th
  { name: "Brooke Shannon", org: "Wait Until 8th", title: "Founder & Executive Director", contact_type: "advocacy", email: "info@waituntil8th.org", relevance_score: 81, priority_tier: 2, tags: ["advocacy", "pre-built-standard", "grassroots"], notes: "Founded 2017 in Austin. 130,000+ families signed pledge. 2nd most adopted Phosra standard (4,213 adoptions)." },

  // Protect Young Eyes
  { name: "Chris McKenna", org: "Protect Young Eyes", title: "Founder & CEO", contact_type: "advocacy", email: "chris@protectyoungeyes.com", twitter_handle: "iProtectKids", relevance_score: 92, priority_tier: 1, tags: ["advocacy", "priority-1", "pre-built-standard", "presentations"], notes: "Over 4,600 presentations. Pre-built PYE Standard (1,876 adoptions). His core complaint = 30+ steps to configure controls = Phosra solves." },

  // Enough Is Enough
  { name: "Donna Rice Hughes", org: "Enough Is Enough", title: "President & CEO", contact_type: "advocacy", email: "enough@enough.org", twitter_handle: "donnarhughes", relevance_score: 68, priority_tier: 3, tags: ["advocacy", "predator-prevention"], notes: "Founded 1994. Pioneered internet safety legislation." },

  // Thorn
  { name: "Julie Cordua", org: "Thorn", title: "CEO", contact_type: "advocacy", linkedin_url: "https://linkedin.com/in/juliecordua/", relevance_score: 82, priority_tier: 2, tags: ["advocacy", "csam", "pre-built-standard", "tech"], notes: "Founded by Ashton Kutcher & Demi Moore. Builds tech tools to detect CSAM. Pre-built Thorn Digital Defenders Standard." },

  // FOSI
  { name: "Stephen Balkam", org: "FOSI", title: "Founder & CEO", contact_type: "advocacy", twitter_handle: "StephenBalkam", relevance_score: 58, priority_tier: 3, tags: ["advocacy", "convening"], notes: "Convenes annual conference bringing together tech companies, policymakers, advocates." },

  // ConnectSafely
  { name: "Larry Magid", org: "ConnectSafely", title: "CEO", contact_type: "advocacy", twitter_handle: "LarryMagid", relevance_score: 40, priority_tier: 3, tags: ["advocacy", "skeptic"], notes: "CBS News tech analyst. Skeptical of heavy-handed restriction." },

  // SMVLC
  { name: "Matthew Bergman", org: "Social Media Victims Law Center", title: "Founder", contact_type: "advocacy", relevance_score: 78, priority_tier: 2, tags: ["advocacy", "legal", "pre-built-standard", "litigation"], notes: "Files lawsuits against social media companies. Pre-built SMVLC Safe Platform Standard (strictest in registry)." },

  // Design It For Us
  { name: "Zamaan Qureshi", org: "Design It For Us", title: "Co-Chair", contact_type: "advocacy", twitter_handle: "zamaanq", relevance_score: 87, priority_tier: 2, tags: ["advocacy", "youth-led", "pre-built-standard"], notes: "Youth-led coalition. Testified before Congress. Pre-built Design It For Us Standard." },
  { name: "Emma Lembke", org: "LOG OFF / Design It For Us", title: "Co-Chair & Founder of LOG OFF", contact_type: "advocacy", twitter_handle: "EmmaLembke", relevance_score: 80, priority_tier: 2, tags: ["advocacy", "youth-led", "pre-built-standard"], notes: "Started LOG OFF movement at age 16. Pre-built Log Off Movement Standard." },

  // #HalfTheStory
  { name: "Larissa May", org: "#HalfTheStory", title: "Founder & Executive Director", contact_type: "advocacy", linkedin_url: "https://linkedin.com/in/larissa-may-78827236/", relevance_score: 66, priority_tier: 3, tags: ["advocacy", "education", "youth"], notes: "Created 'Social Media U' education program." },

  // ── ACADEMICS ──────────────────────────────────────────────────

  { name: "Jonathan Haidt", org: "NYU Stern School of Business", title: "Professor", contact_type: "academic", twitter_handle: "JonHaidt", relevance_score: 88, priority_tier: 1, tags: ["academic", "priority-1", "pre-built-standard", "author"], notes: "Author of 'The Anxious Generation.' Four Norms = Phosra's #1 standard (2,847 adoptions, 142 schools)." },
  { name: "Amelia Vance", org: "Public Interest Privacy Center", title: "Founder", contact_type: "academic", email: "amelia@pipc.tech", twitter_handle: "ameliaivance", relevance_score: 52, priority_tier: 3, tags: ["academic", "privacy", "education"], notes: "Former FPF VP of Youth & Education Privacy. Leading expert on student/child privacy." },
  { name: "Michael Rich", org: "Digital Wellness Lab, Boston Children's Hospital", title: "Founder/Director; Associate Professor, Harvard Medical School", contact_type: "academic", email: "cimaid@childrens.harvard.edu", relevance_score: 55, priority_tier: 3, tags: ["academic", "medical"], notes: "Leading medical voice on children's digital media impact. Founded CIMAID clinic." },
  { name: "Danah Boyd", org: "Data & Society / Microsoft Research", title: "Founder; Partner Researcher", contact_type: "academic", relevance_score: 20, priority_tier: 3, tags: ["academic", "skeptic", "do-not-contact"], notes: "Fundamentally opposes techno-legal solutionism. NOT recommended for outreach — high risk of public criticism." },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: FEDERAL LEGISLATORS
  // ═══════════════════════════════════════════════════════════════

  // Tier 1
  { name: "Sen. Richard Blumenthal", org: "U.S. Senate (D-CT)", title: "Senator", contact_type: "legislator", phone: "(202) 224-2823", twitter_handle: "SenBlumenthal", relevance_score: 90, priority_tier: 1, tags: ["federal", "kosa", "earn-it", "tier-1"], notes: "KOSA primary sponsor, EARN IT primary co-sponsor, Clean Slate." },
  { name: "Sen. Marsha Blackburn", org: "U.S. Senate (R-TN)", title: "Senator", contact_type: "legislator", phone: "(202) 224-3344", twitter_handle: "MarshaBlackburn", relevance_score: 90, priority_tier: 1, tags: ["federal", "kosa", "report-act", "tier-1"], notes: "KOSA primary sponsor, REPORT Act primary co-sponsor." },
  { name: "Sen. Dick Durbin", org: "U.S. Senate (D-IL)", title: "Senate Minority Whip", contact_type: "legislator", phone: "(202) 224-2152", twitter_handle: "SenatorDurbin", relevance_score: 88, priority_tier: 1, tags: ["federal", "stop-csam", "tier-1"], notes: "STOP CSAM primary, Clean Slate primary, Durbin-Grassley package." },
  { name: "Sen. Ed Markey", org: "U.S. Senate (D-MA)", title: "Senator", contact_type: "legislator", phone: "(202) 224-2742", twitter_handle: "SenMarkey", relevance_score: 88, priority_tier: 1, tags: ["federal", "coppa", "tier-1"], notes: "COPPA 2.0 primary sponsor, Clean Slate co-sponsor." },
  { name: "Sen. Lindsey Graham", org: "U.S. Senate (R-SC)", title: "Senator", contact_type: "legislator", phone: "(202) 224-5972", twitter_handle: "LindseyGrahamSC", relevance_score: 85, priority_tier: 1, tags: ["federal", "earn-it", "tier-1"], notes: "EARN IT Act primary sponsor, KOSA co-sponsor." },
  { name: "Sen. Josh Hawley", org: "U.S. Senate (R-MO)", title: "Senator", contact_type: "legislator", phone: "(202) 224-6154", twitter_handle: "HawleyMO", relevance_score: 85, priority_tier: 1, tags: ["federal", "stop-csam", "tier-1"], notes: "STOP CSAM primary co-sponsor, EARN IT co-sponsor." },

  // Tier 2
  { name: "Sen. Bill Cassidy", org: "U.S. Senate (R-LA)", title: "HELP Committee Chair", contact_type: "legislator", phone: "(202) 224-5824", twitter_handle: "SenBillCassidy", relevance_score: 80, priority_tier: 2, tags: ["federal", "coppa", "tier-2"] },
  { name: "Sen. Chuck Grassley", org: "U.S. Senate (R-IA)", title: "Judiciary Chair, President Pro Tempore", contact_type: "legislator", phone: "(202) 224-3744", twitter_handle: "ChuckGrassley", relevance_score: 80, priority_tier: 2, tags: ["federal", "tier-2"] },
  { name: "Sen. Jon Ossoff", org: "U.S. Senate (D-GA)", title: "Senator", contact_type: "legislator", phone: "(202) 224-3521", twitter_handle: "SenOssoff", relevance_score: 82, priority_tier: 2, tags: ["federal", "report-act", "signed-into-law", "tier-2"], notes: "REPORT Act primary — SIGNED INTO LAW May 2024." },
  { name: "Sen. Brian Schatz", org: "U.S. Senate (D-HI)", title: "Senator", contact_type: "legislator", phone: "(202) 224-3934", twitter_handle: "SenBrianSchatz", relevance_score: 78, priority_tier: 2, tags: ["federal", "kids-off-social-media", "tier-2"] },
  { name: "Sen. Ted Cruz", org: "U.S. Senate (R-TX)", title: "Commerce Committee Chair", contact_type: "legislator", phone: "(202) 224-5922", twitter_handle: "SenTedCruz", relevance_score: 78, priority_tier: 2, tags: ["federal", "kids-off-social-media", "coppa", "tier-2"] },
  { name: "Sen. Amy Klobuchar", org: "U.S. Senate (D-MN)", title: "Judiciary Privacy Subcommittee Ranking Member", contact_type: "legislator", phone: "(202) 224-3244", twitter_handle: "SenAmyKlobuchar", relevance_score: 75, priority_tier: 2, tags: ["federal", "kosa", "tier-2"] },
  { name: "Sen. Katie Britt", org: "U.S. Senate (R-AL)", title: "Senator", contact_type: "legislator", phone: "(202) 224-5744", twitter_handle: "SenKatieBritt", relevance_score: 75, priority_tier: 2, tags: ["federal", "kids-off-social-media", "tier-2"] },
  { name: "Sen. Chris Murphy", org: "U.S. Senate (D-CT)", title: "Senator", contact_type: "legislator", phone: "(202) 224-4041", twitter_handle: "SenMurphyOffice", relevance_score: 75, priority_tier: 2, tags: ["federal", "kids-off-social-media", "tier-2"] },
  { name: "Sen. Mike Lee", org: "U.S. Senate (R-UT)", title: "Senator", contact_type: "legislator", phone: "(202) 224-5444", twitter_handle: "SenMikeLee", relevance_score: 72, priority_tier: 2, tags: ["federal", "screen-act", "age-verification", "tier-2"] },

  // Tier 3 — House
  { name: "Rep. Gus Bilirakis", org: "U.S. House (R-FL-12)", title: "Innovation, Data & Commerce Subcommittee Chair", contact_type: "legislator", phone: "(202) 225-5755", twitter_handle: "RepGusBilirakis", relevance_score: 72, priority_tier: 2, tags: ["federal", "kosa", "house", "tier-3"] },
  { name: "Rep. Kathy Castor", org: "U.S. House (D-FL-14)", title: "Representative", contact_type: "legislator", phone: "(202) 225-3376", twitter_handle: "USRepKCastor", relevance_score: 70, priority_tier: 3, tags: ["federal", "kosa", "coppa", "house", "tier-3"] },
  { name: "Rep. Tim Walberg", org: "U.S. House (R-MI-5)", title: "Education & Workforce Chair", contact_type: "legislator", phone: "(202) 225-6276", twitter_handle: "RepWalberg", relevance_score: 70, priority_tier: 3, tags: ["federal", "coppa", "house", "tier-3"] },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: STATE LEGISLATORS
  // ═══════════════════════════════════════════════════════════════

  // Utah
  { name: "Sen. Mike McKell", org: "Utah State Senate (R-25)", title: "State Senator", contact_type: "legislator", email: "mmckell@le.utah.gov", phone: "(801) 538-1035", twitter_handle: "mikemckellutah", relevance_score: 82, priority_tier: 1, tags: ["state", "utah", "priority-1", "pioneer"], notes: "Social Media Regulation Act sponsor. Pioneer state — most receptive to parental control tools." },
  { name: "Rep. Jordan Teuscher", org: "Utah House (R-44)", title: "State Representative", contact_type: "legislator", email: "jteuscher@le.utah.gov", phone: "(801) 538-1408", twitter_handle: "jordanteuscher", relevance_score: 70, priority_tier: 2, tags: ["state", "utah"] },

  // Louisiana
  { name: "Rep. Laurie Schlegel", org: "Louisiana House (R-82)", title: "State Representative", contact_type: "legislator", email: "hse082@legis.la.gov", phone: "(504) 655-6887", twitter_handle: "RepSchlegel", relevance_score: 78, priority_tier: 1, tags: ["state", "louisiana", "priority-1", "age-verification", "pioneer"], notes: "First state to require age verification for adult content. Inspired 11+ similar state laws." },

  // Arkansas
  { name: "Sen. Tyler Dees", org: "Arkansas Senate (R-35)", title: "State Senator", contact_type: "legislator", email: "tyler.dees@senate.ar.gov", phone: "(501) 682-6107", relevance_score: 65, priority_tier: 3, tags: ["state", "arkansas"] },

  // Texas
  { name: "Rep. Shelby Slawson", org: "Texas House (R-59)", title: "State Representative", contact_type: "legislator", email: "Shelby.Slawson@house.texas.gov", phone: "(254) 523-4620", twitter_handle: "ShelbySlawson", relevance_score: 68, priority_tier: 2, tags: ["state", "texas", "scope-act"] },

  // California
  { name: "Asm. Buffy Wicks", org: "California Assembly (D-14)", title: "Assembly Member", contact_type: "legislator", email: "assemblymember.wicks@assembly.ca.gov", phone: "(916) 319-2014", twitter_handle: "AsmBuffyWicks", relevance_score: 80, priority_tier: 1, tags: ["state", "california", "aadc", "priority-1"], notes: "Leading AADC implementation. Introduced AB 1043 (Digital Age Assurance Act) in 2025." },

  // Virginia
  { name: "Sen. Schuyler VanValkenburg", org: "Virginia Senate (D-16)", title: "State Senator", contact_type: "legislator", email: "senatorvanvalkenburg@senate.virginia.gov", phone: "(804) 698-7516", relevance_score: 65, priority_tier: 3, tags: ["state", "virginia"] },

  // Florida
  { name: "Sen. Erin Grall", org: "Florida Senate (R-29)", title: "State Senator", contact_type: "legislator", email: "Grall.Erin.web@flsenate.gov", phone: "(850) 487-5029", twitter_handle: "ErinGrall", relevance_score: 68, priority_tier: 2, tags: ["state", "florida", "social-media-ban"] },

  // Connecticut
  { name: "Sen. James Maroney", org: "Connecticut Senate (D-14)", title: "State Senator", contact_type: "legislator", email: "Maroney@senatedems.ct.gov", phone: "(860) 240-0381", twitter_handle: "SenatorMaroney", relevance_score: 70, priority_tier: 2, tags: ["state", "connecticut", "privacy", "ai"], notes: "SB 3 passed unanimously in both chambers. Leader on children's privacy + AI governance." },

  // New York
  { name: "Sen. Andrew Gounardes", org: "New York Senate (D-Brooklyn)", title: "State Senator", contact_type: "legislator", email: "gounardes@nysenate.gov", phone: "(718) 238-6044", twitter_handle: "agounardes", relevance_score: 78, priority_tier: 1, tags: ["state", "new-york", "safe-for-kids", "priority-1"], notes: "SAFE for Kids Act author. Most comprehensive state framework." },
  { name: "Asm. Nily Rozic", org: "New York Assembly (D-25)", title: "Assembly Member", contact_type: "legislator", email: "RozicN@nyassembly.gov", phone: "(518) 455-5172", relevance_score: 70, priority_tier: 2, tags: ["state", "new-york"] },

  // Maryland
  { name: "Del. Jared Solomon", org: "Maryland House (D-18)", title: "Delegate", contact_type: "legislator", email: "jared.solomon@house.maryland.gov", phone: "(410) 841-3130", twitter_handle: "jaredssolomon", relevance_score: 65, priority_tier: 3, tags: ["state", "maryland", "kids-code"] },

  // Minnesota
  { name: "Rep. Kristin Bahner", org: "Minnesota House (DFL-37B)", title: "State Representative", contact_type: "legislator", email: "rep.kristin.bahner@house.mn.gov", phone: "(651) 296-5502", relevance_score: 65, priority_tier: 3, tags: ["state", "minnesota", "kids-code", "cybersecurity"], notes: "Chair of Legislative Commission on Cybersecurity." },

  // Georgia
  { name: "Sen. Jason Anavitarte", org: "Georgia Senate (R-31)", title: "Senate Majority Leader", contact_type: "legislator", email: "Jason.Anavitarte@senate.ga.gov", phone: "(404) 656-0085", twitter_handle: "jasonanavitarte", relevance_score: 68, priority_tier: 2, tags: ["state", "georgia"], notes: "Now serving as Georgia Senate Majority Leader." },

  // Pennsylvania
  { name: "Sen. Tracy Pennycuick", org: "Pennsylvania Senate (R-24)", title: "Chair, Communications & Technology Committee", contact_type: "legislator", email: "tpennycuick@pasen.gov", phone: "(717) 787-3110", twitter_handle: "Sen_Pennycuick", relevance_score: 85, priority_tier: 1, tags: ["state", "pennsylvania", "priority-1", "deepfake", "csam", "prolific"], notes: "Authored Act 125, Act 35, and SB 1050. 3 signed laws in 2 years. Most prolific state-level child safety legislator." },
  { name: "Sen. Kristin Phillips-Hill", org: "Pennsylvania Senate (R-28)", title: "Vice Chair, Communications & Technology", contact_type: "legislator", email: "senatorkristin@pasen.gov", phone: "(717) 787-7085", twitter_handle: "SenatorKristin", relevance_score: 72, priority_tier: 2, tags: ["state", "pennsylvania", "social-media"], notes: "SB 22 prime sponsor — social media parental consent." },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4: TECH COMPANIES — from outreach-tech-companies.md
  // ═══════════════════════════════════════════════════════════════

  // Streaming — Tier 1
  { name: "Christina Camilleri", org: "Netflix", title: "VP, Public Policy & Government Affairs", contact_type: "tech_company", relevance_score: 72, priority_tier: 2, tags: ["streaming", "policy", "tier-2"], notes: "Leads global policy including child safety compliance." },
  { name: "Laurie Richardson", org: "YouTube / Google", title: "VP, Trust & Safety", contact_type: "tech_company", relevance_score: 75, priority_tier: 2, tags: ["streaming", "trust-safety", "tier-2"], notes: "Oversees YouTube Kids policies, COPPA compliance." },
  { name: "Sarah Hoyle", org: "Spotify", title: "VP, Global Head of Safety", contact_type: "tech_company", relevance_score: 60, priority_tier: 2, tags: ["streaming", "trust-safety", "tier-2"], notes: "Formerly at YouTube. Leads Spotify Kids." },

  // Social Media — Tier 1
  { name: "Antigone Davis", org: "Meta", title: "VP, Global Head of Safety", contact_type: "tech_company", relevance_score: 90, priority_tier: 1, tags: ["social-media", "priority-1", "trust-safety", "personalized-draft"], notes: "Most important social media contact. Leads all child safety across Facebook, Instagram, WhatsApp. Personalized email draft ready." },
  { name: "Sandeep Grover", org: "TikTok", title: "Global Head of Trust & Safety", contact_type: "tech_company", relevance_score: 78, priority_tier: 1, tags: ["social-media", "priority-1", "trust-safety"], notes: "Leads TikTok content moderation and child safety globally. Highest regulatory scrutiny." },
  { name: "Jacqueline Beauchere", org: "Snap", title: "Global Head of Platform Safety", contact_type: "tech_company", relevance_score: 76, priority_tier: 1, tags: ["social-media", "priority-1", "trust-safety"], notes: "Former Microsoft Chief Online Safety Officer. Leads Family Center." },

  // Gaming — Tier 1
  { name: "Matt Kaufman", org: "Roblox", title: "Chief Safety Officer", contact_type: "tech_company", relevance_score: 88, priority_tier: 1, tags: ["gaming", "priority-1", "trust-safety", "personalized-draft"], notes: "Key contact. 70M+ daily active users, majority under 16. Most progressive parental controls in gaming. Personalized email draft ready." },
  { name: "Carla Gray", org: "Epic Games", title: "VP, Legal", contact_type: "tech_company", relevance_score: 80, priority_tier: 1, tags: ["gaming", "priority-1", "compliance", "ftc-fine"], notes: "$520M FTC fine for COPPA violations. High motivation for compliance tooling." },
  { name: "Courtney Gregoire", org: "Microsoft / Xbox", title: "Chief Digital Safety Officer", contact_type: "tech_company", relevance_score: 92, priority_tier: 1, tags: ["gaming", "devices", "priority-1", "trust-safety", "personalized-draft"], notes: "CRITICAL contact. Leads Microsoft's entire digital safety strategy. Xbox Family Safety. Personalized email draft ready. #1 tech outreach target." },
  { name: "Dave McCarthy", org: "Microsoft / Xbox", title: "CVP, Xbox Platform & Game Experiences", contact_type: "tech_company", relevance_score: 70, priority_tier: 2, tags: ["gaming", "product", "tier-2"], notes: "Leads Xbox parental controls (Family Settings app)." },

  // Devices — Tier 1
  { name: "Erik Neuenschwander", org: "Apple", title: "Director, User Privacy", contact_type: "tech_company", relevance_score: 78, priority_tier: 2, tags: ["devices", "privacy", "tier-2"], notes: "Leads Screen Time, Communication Safety, and parental controls across iOS." },
  { name: "Mindy Brooks", org: "Google / Android", title: "Director, Kids & Families", contact_type: "tech_company", relevance_score: 75, priority_tier: 2, tags: ["devices", "family-link", "tier-2"], notes: "Leads Family Link (Android parental controls) and YouTube Kids product." },
  { name: "Catherine Teitelbaum", org: "Amazon", title: "Director, Kids & Family", contact_type: "tech_company", relevance_score: 68, priority_tier: 2, tags: ["devices", "kids-plus", "tier-2"], notes: "Leads Amazon Kids+ across Fire tablets, Kindle, Echo devices." },

  // DNS — Tier 1
  { name: "Tom Evans", org: "Cloudflare", title: "VP, Trust & Safety", contact_type: "tech_company", relevance_score: 85, priority_tier: 1, tags: ["dns", "priority-1", "integration-partner", "personalized-draft"], notes: "1.1.1.1 for Families. Largest consumer DNS provider. Personalized email draft ready. Natural integration partner." },

  // AI — Tier 1
  { name: "Lilian Weng", org: "OpenAI", title: "VP, Safety Systems", contact_type: "tech_company", relevance_score: 72, priority_tier: 2, tags: ["ai", "safety", "tier-2"], notes: "Leads OpenAI safety research including child safety." },

  // Social Media — Tier 2
  { name: "Savannah Badalich", org: "Discord", title: "Director of Policy", contact_type: "tech_company", relevance_score: 65, priority_tier: 2, tags: ["social-media", "tier-2"], notes: "Leads Discord safety policies including Family Center." },

  // Gaming — Tier 2+
  { name: "Sean Whitcomb", org: "Sony / PlayStation", title: "VP, Communications", contact_type: "tech_company", relevance_score: 60, priority_tier: 2, tags: ["gaming", "tier-2"] },
  { name: "Devon Pritchard", org: "Nintendo", title: "SVP, Sales & Marketing", contact_type: "tech_company", relevance_score: 55, priority_tier: 3, tags: ["gaming", "tier-3"], notes: "Nintendo Switch Parental Controls app. Strictest family-friendly positioning." },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 5: INVESTORS — fundraise target list
  // ═══════════════════════════════════════════════════════════════

  { name: "Albert Wenger", org: "Union Square Ventures", title: "Managing Partner", contact_type: "investor", twitter_handle: "albertwenger", linkedin_url: "https://linkedin.com/in/albertwenger/", relevance_score: 80, priority_tier: 1, tags: ["investor", "priority-1", "pre-seed", "thesis-fit"], notes: "Thesis on 'Knowledge Age' transitions. Invested in Duolingo, Codecademy. Strong values alignment." },
  { name: "Sarah Guo", org: "Conviction", title: "Founder & Managing Partner", contact_type: "investor", twitter_handle: "saranormous", linkedin_url: "https://linkedin.com/in/sarahguo/", relevance_score: 75, priority_tier: 1, tags: ["investor", "priority-1", "ai-native", "seed"], notes: "AI-native fund. Former Greylock partner. Interested in AI safety and applied AI." },
  { name: "Charles Hudson", org: "Precursor Ventures", title: "Managing Partner & Founder", contact_type: "investor", twitter_handle: "chaborhud", linkedin_url: "https://linkedin.com/in/charleshudson/", relevance_score: 72, priority_tier: 1, tags: ["investor", "priority-1", "pre-seed"], notes: "Pre-seed specialist. Consumer/enterprise crossover. Family-oriented investments." },
  { name: "Cyan Banister", org: "Long Journey Ventures", title: "Founding Partner", contact_type: "investor", twitter_handle: "cyantist", linkedin_url: "https://linkedin.com/in/cyanbanister/", relevance_score: 70, priority_tier: 2, tags: ["investor", "seed", "consumer"], notes: "Former angel in Uber, SpaceX. Values-driven investing." },
  { name: "Mitch Kapor", org: "Kapor Capital", title: "Founder & Partner", contact_type: "investor", twitter_handle: "maboroshi", linkedin_url: "https://linkedin.com/in/mkapor/", relevance_score: 78, priority_tier: 1, tags: ["investor", "priority-1", "impact", "social-impact"], notes: "Lotus founder. Impact investing focus. Social justice & tech responsibility thesis." },
  { name: "Semil Shah", org: "Haystack", title: "Founder & General Partner", contact_type: "investor", twitter_handle: "semikiw", linkedin_url: "https://linkedin.com/in/semilshah/", relevance_score: 65, priority_tier: 2, tags: ["investor", "seed", "consumer"], notes: "Seed-stage. Consumer and enterprise. Active in regulatory-adjacent companies." },
  { name: "Clara Tsao", org: "Firebolt Ventures", title: "Founding Partner", contact_type: "investor", twitter_handle: "claratsao", relevance_score: 68, priority_tier: 2, tags: ["investor", "govtech", "seed"], notes: "Govtech + civic tech focus. Former Mozilla Foundation. Regulatory tailwind thesis." },
  { name: "Garry Tan", org: "Y Combinator", title: "President & CEO", contact_type: "investor", twitter_handle: "garrytan", linkedin_url: "https://linkedin.com/in/garrytan/", relevance_score: 85, priority_tier: 1, tags: ["investor", "priority-1", "accelerator"], notes: "YC application path. Builder-first ethos. Open to compliance/safety tools." },
  { name: "Anu Duggal", org: "Female Founders Fund", title: "Founding Partner", contact_type: "investor", twitter_handle: "anuduggal", linkedin_url: "https://linkedin.com/in/anuduggal/", relevance_score: 62, priority_tier: 2, tags: ["investor", "seed", "consumer"], notes: "Consumer-focused seed fund. Family safety could fit consumer protection thesis." },
  { name: "Alexis Ohanian", org: "776", title: "Founder & General Partner", contact_type: "investor", twitter_handle: "alexisohanian", linkedin_url: "https://linkedin.com/in/alexisohanian/", relevance_score: 76, priority_tier: 1, tags: ["investor", "priority-1", "consumer", "parent"], notes: "Reddit co-founder. Father of two. Vocal about kids' online safety. Strong values fit." },
]

// ── Main ────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding outreach contacts (comprehensive)...")
  console.log(`  Total contacts to seed: ${contacts.length}`)

  const pool = new pg.Pool({ connectionString: DATABASE_URL })

  try {
    // Check existing
    const { rows } = await pool.query("SELECT COUNT(*) FROM admin_outreach_contacts")
    const existing = parseInt(rows[0].count)

    if (existing > 0 && !FORCE) {
      console.log(`  ⚠ Table already has ${existing} contacts. Use --force to clear and re-seed.`)
      return
    }

    if (existing > 0 && FORCE) {
      console.log(`  🗑 Clearing ${existing} existing contacts...`)
      await pool.query("DELETE FROM admin_outreach_activities")
      await pool.query("DELETE FROM admin_outreach_contacts")
    }

    let inserted = 0
    for (const c of contacts) {
      try {
        await pool.query(
          `INSERT INTO admin_outreach_contacts
           (name, org, title, contact_type, email, linkedin_url, twitter_handle, phone,
            status, notes, relevance_score, tags, email_status, priority_tier)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'not_contacted', $9, $10, $11, 'none', $12)`,
          [
            c.name,
            c.org || "",
            c.title || "",
            c.contact_type,
            c.email || null,
            c.linkedin_url || null,
            c.twitter_handle || null,
            c.phone || null,
            c.notes || null,
            c.relevance_score || null,
            c.tags || null,
            c.priority_tier || 3,
          ]
        )
        inserted++
      } catch (err) {
        console.warn(`  ⚠ Failed to insert "${c.name}": ${err.message}`)
      }
    }

    console.log(`\n✅ Inserted ${inserted} outreach contacts.`)

    // Stats
    const statsResult = await pool.query(`
      SELECT contact_type, COUNT(*) as cnt
      FROM admin_outreach_contacts
      GROUP BY contact_type ORDER BY cnt DESC
    `)
    console.log("\n📊 By type:")
    for (const row of statsResult.rows) {
      console.log(`   ${row.contact_type}: ${row.cnt}`)
    }

    const tierResult = await pool.query(`
      SELECT priority_tier, COUNT(*) as cnt
      FROM admin_outreach_contacts
      GROUP BY priority_tier ORDER BY priority_tier
    `)
    console.log("\n🎯 By priority:")
    for (const row of tierResult.rows) {
      console.log(`   Tier ${row.priority_tier}: ${row.cnt}`)
    }
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})
