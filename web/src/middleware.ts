import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const publicRoutes = ["/", "/login(.*)", "/docs(.*)", "/sign-in(.*)", "/sign-up(.*)", "/sso-callback(.*)", "/api/playground(.*)", "/platforms(.*)", "/playground(.*)", "/pricing(.*)", "/changelog(.*)", "/demo(.*)", "/compliance(.*)", "/about(.*)", "/contact(.*)", "/privacy(.*)", "/terms(.*)"]

// In sandbox mode, don't protect dashboard routes (auth is handled by X-Sandbox-Session header)
if (process.env.NEXT_PUBLIC_SANDBOX_MODE === "true") {
  publicRoutes.push("/dashboard(.*)")
}

const isPublicRoute = createRouteMatcher(publicRoutes)

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
