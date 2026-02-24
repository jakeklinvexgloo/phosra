import { AuthGate } from "@/components/developers/AuthGate"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>
}
