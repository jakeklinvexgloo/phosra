const LAWS = [
  { name: "KOSA", full: "Kids Online Safety Act" },
  { name: "COPPA 2.0", full: "Children's Online Privacy Protection Act" },
  { name: "EU DSA", full: "Digital Services Act" },
  { name: "CA SB 976", full: "Age-Appropriate Design Code" },
  { name: "VA SB 854", full: "Virginia Child Safety Act" },
  { name: "NY SAFE for Kids", full: "New York SAFE for Kids Act" },
  { name: "UK AADC", full: "Age Appropriate Design Code" },
  { name: "India DPDPA", full: "Digital Personal Data Protection Act" },
  { name: "AU OSA", full: "Online Safety Act" },
  { name: "KOSMA", full: "Kids Online Safety and Media Act" },
  { name: "FTC COPPA Rule", full: "Federal Trade Commission COPPA Rule" },
]

export function Compliance() {
  return (
    <section id="compliance" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Built for the laws that protect children
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Each of Phosra&apos;s 35 rule categories maps to specific legislative requirements. When laws change, your policies update automatically.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {LAWS.map((law) => (
            <div
              key={law.name}
              className="group relative px-3 sm:px-4 py-2 sm:py-2.5 bg-[#FAFAFA] border border-border rounded-sm text-xs sm:text-sm font-medium text-foreground hover:border-brand-green hover:bg-brand-green/5 transition-colors cursor-default"
            >
              {law.name}
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-foreground text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {law.full}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
