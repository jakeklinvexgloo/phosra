import { authkitMiddleware } from "@workos-inc/authkit-nextjs"

export const runtime = "nodejs"

const unauthenticatedPaths = [
  "/",
  "/login(.*)",
  "/docs(.*)",
  "/platforms(.*)",
  "/playground(.*)",
  "/pricing(.*)",
  "/changelog(.*)",
  "/demo(.*)",
  "/compliance(.*)",
  "/standards(.*)",
  "/about(.*)",
  "/brand(.*)",
  "/contact(.*)",
  "/investors",
  "/api/investors(.*)",
  "/newsroom(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/auth/callback(.*)",
  "/api/playground(.*)",
  "/opengraph-image(.*)",
  "/twitter-image(.*)",
]

// In sandbox mode, don't protect dashboard routes (auth is handled by X-Sandbox-Session header)
if (process.env.NEXT_PUBLIC_SANDBOX_MODE === "true") {
  unauthenticatedPaths.push("/dashboard(.*)")
}

export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths,
  },
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
