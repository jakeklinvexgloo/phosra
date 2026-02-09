import Link from "next/link"

const CODE_SNIPPET = `curl -X POST https://api.phosra.com/v1/policies/resolve \\
  -H "Authorization: Bearer $PARTNER_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "child_age": 9,
    "jurisdiction": "US-CA",
    "target_platforms": ["youtube", "android", "nextdns"],
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
              One API to power your parental controls app
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-lg">
              Phosra&apos;s REST API gives you 49 endpoints across regulations, policies, platforms, and enforcement. Integrate once and give your users universal parental controls across 500+ platforms — with built-in regulatory compliance.
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
                <span className="text-[11px] text-slate-400 font-mono">/v1/policies/resolve</span>
              </div>
              {/* Code */}
              <pre className="p-3 sm:p-5 overflow-x-auto text-[11px] sm:text-[13px] leading-5 sm:leading-6 font-mono">
                <code>
                  <span className="text-slate-400">curl</span>{" "}
                  <span className="text-sky-400">-X POST</span>{" "}
                  <span className="text-green-400">https://api.phosra.com/v1/policies/resolve</span>{" "}
                  <span className="text-slate-500">\</span>{"\n"}
                  {"  "}<span className="text-sky-400">-H</span>{" "}
                  <span className="text-amber-300">&quot;Authorization: Bearer $PARTNER_API_KEY&quot;</span>{" "}
                  <span className="text-slate-500">\</span>{"\n"}
                  {"  "}<span className="text-sky-400">-H</span>{" "}
                  <span className="text-amber-300">&quot;Content-Type: application/json&quot;</span>{" "}
                  <span className="text-slate-500">\</span>{"\n"}
                  {"  "}<span className="text-sky-400">-d</span>{" "}
                  <span className="text-amber-300">&apos;{"{"}</span>{"\n"}
                  {"    "}<span className="text-sky-300">&quot;child_age&quot;</span>
                  <span className="text-slate-400">:</span>{" "}
                  <span className="text-purple-400">9</span>
                  <span className="text-slate-400">,</span>{"\n"}
                  {"    "}<span className="text-sky-300">&quot;jurisdiction&quot;</span>
                  <span className="text-slate-400">:</span>{" "}
                  <span className="text-green-400">&quot;US-CA&quot;</span>
                  <span className="text-slate-400">,</span>{"\n"}
                  {"    "}<span className="text-sky-300">&quot;target_platforms&quot;</span>
                  <span className="text-slate-400">:</span>{" "}
                  <span className="text-slate-400">[</span>
                  <span className="text-green-400">&quot;youtube&quot;</span>
                  <span className="text-slate-400">,</span>{" "}
                  <span className="text-green-400">&quot;android&quot;</span>
                  <span className="text-slate-400">,</span>{" "}
                  <span className="text-green-400">&quot;nextdns&quot;</span>
                  <span className="text-slate-400">]</span>
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
