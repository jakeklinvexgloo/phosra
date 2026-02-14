import type { DeviceSupport } from "@/lib/parental-controls/types"

const DEVICE_ICONS: { key: keyof DeviceSupport; label: string; icon: string }[] = [
  { key: "iOS", label: "iOS", icon: "" },
  { key: "android", label: "Android", icon: "" },
  { key: "windows", label: "Windows", icon: "" },
  { key: "macOS", label: "macOS", icon: "" },
  { key: "chromeos", label: "ChromeOS", icon: "" },
  { key: "fireos", label: "Fire OS", icon: "" },
  { key: "router", label: "Router", icon: "" },
  { key: "browser_extension", label: "Extension", icon: "" },
]

export function DeviceBadges({
  devices,
  size = "sm",
}: {
  devices: DeviceSupport
  size?: "sm" | "md"
}) {
  const supported = DEVICE_ICONS.filter((d) => devices[d.key])
  const textSize = size === "sm" ? "text-[10px]" : "text-xs"
  const padding = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1"

  return (
    <div className="flex flex-wrap gap-1">
      {supported.map((device) => (
        <span
          key={device.key}
          className={`${textSize} ${padding} rounded bg-muted text-muted-foreground font-medium`}
        >
          {device.label}
        </span>
      ))}
    </div>
  )
}
