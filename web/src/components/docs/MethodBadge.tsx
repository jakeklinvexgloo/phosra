export function MethodBadge({ method }: { method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" }) {
  const colors: Record<string, string> = {
    GET: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    POST: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    PUT: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    DELETE: "bg-red-500/10 text-red-600 border-red-500/20",
    PATCH: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wide border ${colors[method] || colors.GET}`}>
      {method}
    </span>
  )
}
