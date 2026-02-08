import Link from "next/link"

const CODE_SNIPPET = `curl -X POST https://api.phosra.com/v1/setup/quick \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "family_name": "The Smiths",
    "child_name": "Emma",
    "child_birth_date": "2017-03-15",
    "strictness": "recommended"
  }'`

export function DevSection() {
  return (
    <section id="developers" className="py-16 sm:py-24 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left — text */}
          <div>
            <p className="text-sm font-semibold text-brand-green mb-3 tracking-wide uppercase">For Developers</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-5">
              One API call to protect a child
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-lg">
              Phosra&apos;s REST API gives you 49 endpoints across families, policies, platforms, and enforcement. Quick Setup creates a family, adds a child, and generates 24 age-appropriate rules — all in a single request.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3 bg-foreground text-white text-sm font-semibold rounded-sm hover:opacity-90 transition"
              >
                Get API Keys
              </Link>
              <Link
                href="/dashboard/docs"
                className="inline-flex items-center px-6 py-3 border border-border text-foreground text-sm font-semibold rounded-sm hover:bg-white transition"
              >
                Read the Docs
              </Link>
            </div>
          </div>

          {/* Right — code block */}
          <div className="relative">
            <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700/50">
              {/* Tab bar */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                </div>
                <span className="text-[11px] text-slate-400 font-mono">/v1/setup/quick</span>
              </div>
              {/* Code */}
              <pre className="p-3 sm:p-5 overflow-x-auto text-[11px] sm:text-[13px] leading-5 sm:leading-6 font-mono">
                <code>
                  <span className="text-slate-400">curl</span>{" "}
                  <span className="text-sky-400">-X POST</span>{" "}
                  <span className="text-green-400">https://api.phosra.com/v1/setup/quick</span>{" "}
                  <span className="text-slate-500">\</span>{"\n"}
                  {"  "}<span className="text-sky-400">-H</span>{" "}
                  <span className="text-amber-300">&quot;Authorization: Bearer $API_KEY&quot;</span>{" "}
                  <span className="text-slate-500">\</span>{"\n"}
                  {"  "}<span className="text-sky-400">-H</span>{" "}
                  <span className="text-amber-300">&quot;Content-Type: application/json&quot;</span>{" "}
                  <span className="text-slate-500">\</span>{"\n"}
                  {"  "}<span className="text-sky-400">-d</span>{" "}
                  <span className="text-amber-300">&apos;{"{"}</span>{"\n"}
                  {"    "}<span className="text-sky-300">&quot;family_name&quot;</span>
                  <span className="text-slate-400">:</span>{" "}
                  <span className="text-green-400">&quot;The Smiths&quot;</span>
                  <span className="text-slate-400">,</span>{"\n"}
                  {"    "}<span className="text-sky-300">&quot;child_name&quot;</span>
                  <span className="text-slate-400">:</span>{" "}
                  <span className="text-green-400">&quot;Emma&quot;</span>
                  <span className="text-slate-400">,</span>{"\n"}
                  {"    "}<span className="text-sky-300">&quot;child_birth_date&quot;</span>
                  <span className="text-slate-400">:</span>{" "}
                  <span className="text-green-400">&quot;2017-03-15&quot;</span>
                  <span className="text-slate-400">,</span>{"\n"}
                  {"    "}<span className="text-sky-300">&quot;strictness&quot;</span>
                  <span className="text-slate-400">:</span>{" "}
                  <span className="text-green-400">&quot;recommended&quot;</span>{"\n"}
                  {"  "}<span className="text-amber-300">{"}"}&apos;</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
