"use client"

interface SimulatorShellProps {
  provider: string
  children: React.ReactNode
}

export function SimulatorShell({ provider, children }: SimulatorShellProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Provider selector */}
      <div className="flex items-center gap-3">
        <label className="text-[13px] font-medium text-muted-foreground">Provider</label>
        <select
          value={provider}
          disabled
          className="rounded-md border border-border bg-background px-3 py-1.5 text-[13px] text-foreground"
        >
          <option value="netflix">Netflix</option>
          <option value="prime" disabled>Prime Video (coming soon)</option>
          <option value="apple" disabled>Apple TV+ (coming soon)</option>
        </select>
      </div>

      {/* Sandbox badge + simulator container */}
      <div
        style={{
          border: "2px dashed #d97706",
          borderRadius: "12px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Badge */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            borderRadius: "6px",
            backgroundColor: "rgba(217, 119, 6, 0.15)",
            border: "1px solid rgba(217, 119, 6, 0.4)",
            fontSize: "11px",
            fontWeight: 600,
            color: "#d97706",
            letterSpacing: "0.05em",
            textTransform: "uppercase" as const,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#d97706" }} />
          Sandbox Simulation
        </div>

        {children}
      </div>
    </div>
  )
}
