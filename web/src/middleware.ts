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
  "/about(.*)",
  "/contact(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/auth/callback(.*)",
  "/api/playground(.*)",
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
