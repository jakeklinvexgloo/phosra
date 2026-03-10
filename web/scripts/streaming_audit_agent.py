"""
Phosra Streaming Audit Agent
Uses browser-use to navigate Netflix/Peacock and audit child profile content.
"""
import asyncio
import os
import json
from dataclasses import dataclass
from typing import Optional

# browser-use
try:
    from browser_use import Agent, Browser, BrowserConfig
    from langchain_anthropic import ChatAnthropic
    BROWSER_USE_AVAILABLE = True
except ImportError:
    BROWSER_USE_AVAILABLE = False
    print("browser-use not installed. Run: pip install browser-use langchain-anthropic")

ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
BASE_CONVEX_URL = os.environ.get("NEXT_PUBLIC_CONVEX_URL", "")


@dataclass
class ContentAuditResult:
    platform: str
    titles_found: list[dict]
    concerning_titles: list[dict]
    current_rating_setting: str
    recommended_actions: list[str]
    overall_score: int  # 0-100


# =====================================================
# NETFLIX AUDIT AGENT
# =====================================================

NETFLIX_AUDIT_TASK = """
You are a parental controls auditor for a child safety platform.

Task: Audit the Netflix account for content appropriate for a {age}-year-old child.
Parent policy: {policy}

Steps:
1. Navigate to https://www.netflix.com
2. If not logged in, this is a demo — just go to https://www.netflix.com/browse and look at available content
3. Look at what's available in the Browse or Trending sections
4. For each title you can see, note: title name, visible rating (PG, TV-14, etc.)
5. Identify any titles that seem inappropriate for a {age}-year-old based on their ratings
6. Check if there's a Kids section and how it's presented

Report as JSON:
{{
  "titles_sampled": [{{"title": "...", "rating": "TV-PG", "concern": false}}, ...],
  "concerning_titles": [{{"title": "...", "rating": "TV-MA", "reason": "Adult content"}}],
  "current_setting_observed": "description of what maturity level seems set",
  "recommendations": ["Set Kids profile", "Enable PIN lock"],
  "audit_score": 0-100
}}
"""

PEACOCK_AUDIT_TASK = """
You are a parental controls auditor for a child safety platform.

Task: Audit Peacock for content appropriate for a {age}-year-old child.
Parent policy: {policy}

Steps:
1. Navigate to https://www.peacocktv.com
2. Browse the available content categories
3. Look for the Kids section
4. Note what content is visible/featured on the homepage
5. Check if parental controls are mentioned anywhere

Report as JSON:
{{
  "titles_sampled": [{{"title": "...", "rating": "TV-PG", "concern": false}}, ...],
  "concerning_titles": [],
  "platform_notes": "observation about how Peacock handles kids content",
  "recommendations": [],
  "audit_score": 0-100
}}
"""


async def audit_netflix(child_age: int, policy: str) -> ContentAuditResult:
    """Run browser-use agent to audit Netflix content."""
    if not BROWSER_USE_AVAILABLE:
        return ContentAuditResult(
            platform="netflix",
            titles_found=[],
            concerning_titles=[],
            current_rating_setting="unknown (browser-use not installed)",
            recommended_actions=["Install browser-use: pip install browser-use"],
            overall_score=0,
        )

    llm = ChatAnthropic(
        model="claude-sonnet-4-5",  # Use Sonnet for visual browsing tasks
        api_key=ANTHROPIC_KEY,
        temperature=0,
    )

    browser = Browser(config=BrowserConfig(headless=True))
    try:
        task = NETFLIX_AUDIT_TASK.format(age=child_age, policy=policy)
        agent = Agent(task=task, llm=llm, browser=browser, max_actions_per_step=5)
        result = await agent.run(max_steps=20)

        final = result.final_result() or "{}"
        json_match = final[final.find("{"):final.rfind("}")+1] if "{" in final else "{}"

        try:
            data = json.loads(json_match)
        except Exception:
            data = {}

        return ContentAuditResult(
            platform="netflix",
            titles_found=data.get("titles_sampled", []),
            concerning_titles=data.get("concerning_titles", []),
            current_rating_setting=data.get("current_setting_observed", "unknown"),
            recommended_actions=data.get("recommendations", []),
            overall_score=data.get("audit_score", 50),
        )
    finally:
        await browser.close()


async def audit_peacock(child_age: int, policy: str) -> ContentAuditResult:
    """Run browser-use agent to audit Peacock content."""
    if not BROWSER_USE_AVAILABLE:
        return ContentAuditResult(
            platform="peacock",
            titles_found=[],
            concerning_titles=[],
            current_rating_setting="unknown",
            recommended_actions=["Install browser-use"],
            overall_score=0,
        )

    llm = ChatAnthropic(model="claude-sonnet-4-5", api_key=ANTHROPIC_KEY, temperature=0)
    browser = Browser(config=BrowserConfig(headless=True))
    try:
        task = PEACOCK_AUDIT_TASK.format(age=child_age, policy=policy)
        agent = Agent(task=task, llm=llm, browser=browser, max_actions_per_step=5)
        result = await agent.run(max_steps=20)
        final = result.final_result() or "{}"
        json_match = final[final.find("{"):final.rfind("}")+1] if "{" in final else "{}"
        data = json.loads(json_match) if json_match else {}
        return ContentAuditResult(
            platform="peacock",
            titles_found=data.get("titles_sampled", []),
            concerning_titles=data.get("concerning_titles", []),
            current_rating_setting=data.get("platform_notes", ""),
            recommended_actions=data.get("recommendations", []),
            overall_score=data.get("audit_score", 50),
        )
    finally:
        await browser.close()


async def run_full_audit(child_age: int = 10, policy: str = "Age-appropriate content only, no violence or adult themes"):
    """Run audit on both platforms in parallel."""
    print(f"Auditing streaming platforms for {child_age}-year-old...")
    print(f"   Policy: {policy}\n")

    netflix_result, peacock_result = await asyncio.gather(
        audit_netflix(child_age, policy),
        audit_peacock(child_age, policy),
    )

    for result in [netflix_result, peacock_result]:
        icon = "OK" if result.overall_score >= 70 else "WARN" if result.overall_score >= 40 else "ALERT"
        print(f"\n[{icon}] {result.platform.upper()} — Score: {result.overall_score}/100")
        print(f"   Titles sampled: {len(result.titles_found)}")
        if result.concerning_titles:
            print(f"   Concerning titles ({len(result.concerning_titles)}):")
            for t in result.concerning_titles[:3]:
                print(f"      - {t.get('title', 'Unknown')} ({t.get('rating', '?')}): {t.get('reason', '')}")
        if result.recommended_actions:
            print(f"   Recommendations:")
            for r in result.recommended_actions[:3]:
                print(f"      - {r}")

    return [netflix_result, peacock_result]


if __name__ == "__main__":
    import sys
    age = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    policy = sys.argv[2] if len(sys.argv) > 2 else "Age-appropriate for elementary school child, no violence or adult themes"
    asyncio.run(run_full_audit(age, policy))
