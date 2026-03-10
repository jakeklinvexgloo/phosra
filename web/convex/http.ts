import { httpRouter } from "convex/server"
import { injectDemoEvents } from "./demo"

const http = httpRouter()

http.route({
  path: "/demo/inject-events",
  method: "POST",
  handler: injectDemoEvents,
})

export default http
