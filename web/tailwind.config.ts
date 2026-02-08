import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        success: { DEFAULT: "hsl(var(--success))", foreground: "hsl(var(--success-foreground))" },
        warning: { DEFAULT: "hsl(var(--warning))", foreground: "hsl(var(--warning-foreground))" },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          border: "hsl(var(--sidebar-border))",
        },
        surface: "hsl(var(--surface))",
        paragraph: "hsl(var(--paragraph))",
        heading: "hsl(var(--heading))",
        brand: {
          green: "hsl(var(--brand-green))",
        },
      },
      fontSize: {
        "h1": ["50px", { lineHeight: "60px", fontWeight: "700" }],
        "h2": ["30px", { lineHeight: "38px", fontWeight: "700" }],
        "h3": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "h4": ["24px", { lineHeight: "32px", fontWeight: "400" }],
        "h1-inner": ["36px", { lineHeight: "48px", fontWeight: "700" }],
      },
      boxShadow: {
        "plaid-card": "rgba(18,18,18,0.08) 0px 8px 16px",
        "plaid-card-hover": "rgba(18,18,18,0.14) 0px 12px 24px",
      },
      width: {
        "sidebar": "320px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        scroll: "scroll 30s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
