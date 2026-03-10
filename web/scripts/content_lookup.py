"""
TMDB content metadata lookup — get age ratings for any movie/show.
TMDB API is free at https://www.themoviedb.org/settings/api
"""
import httpx
import asyncio
import os

TMDB_API_KEY = os.environ.get("TMDB_API_KEY", "")  # Free API key from themoviedb.org


async def get_content_rating(title: str) -> dict:
    """Look up content rating for a movie or TV show."""
    if not TMDB_API_KEY:
        return {"error": "Set TMDB_API_KEY env var (free at themoviedb.org/settings/api)"}

    async with httpx.AsyncClient() as client:
        # Search for the title
        search = await client.get(
            "https://api.themoviedb.org/3/search/multi",
            params={"api_key": TMDB_API_KEY, "query": title, "include_adult": False}
        )
        results = search.json().get("results", [])
        if not results:
            return {"title": title, "rating": "Not found"}

        top = results[0]
        media_type = top.get("media_type", "movie")
        content_id = top["id"]

        # Get US content rating
        if media_type == "movie":
            details = await client.get(
                f"https://api.themoviedb.org/3/movie/{content_id}/release_dates",
                params={"api_key": TMDB_API_KEY}
            )
            releases = details.json().get("results", [])
            us = next((r for r in releases if r["iso_3166_1"] == "US"), None)
            rating = us["release_dates"][0]["certification"] if us else "NR"
        else:
            details = await client.get(
                f"https://api.themoviedb.org/3/tv/{content_id}/content_ratings",
                params={"api_key": TMDB_API_KEY}
            )
            ratings = details.json().get("results", [])
            us = next((r for r in ratings if r["iso_3166_1"] == "US"), None)
            rating = us["rating"] if us else "NR"

        return {
            "title": top.get("title") or top.get("name"),
            "type": media_type,
            "rating": rating,
            "overview": top.get("overview", "")[:200],
            "genres": top.get("genre_ids", []),
        }


async def main():
    # Test a few titles
    titles = ["Moana", "Stranger Things", "Breaking Bad", "Bluey", "The Witcher"]
    for title in titles:
        result = await get_content_rating(title)
        print(f"{result.get('title', title)}: {result.get('rating', 'unknown')}")

if __name__ == "__main__":
    asyncio.run(main())
