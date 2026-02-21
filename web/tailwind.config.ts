import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', '-apple-system', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
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
        "accent-teal": "hsl(var(--accent-teal))",
        "accent-purple": "hsl(var(--accent-purple))",
        "accent-magenta": "hsl(var(--accent-magenta))",
        "accent-cyan": "hsl(var(--accent-cyan))",
      },
      fontSize: {
        "h1": ["50px", { lineHeight: "60px", fontWeight: "600" }],
        "h2": ["30px", { lineHeight: "38px", fontWeight: "600" }],
        "h3": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "h4": ["24px", { lineHeight: "32px", fontWeight: "400" }],
        "h1-inner": ["36px", { lineHeight: "48px", fontWeight: "600" }],
      },
      letterSpacing: {
        tighter: "-0.02em",
        display: "-0.03em",
      },
      boxShadow: {
        "sm": "0 1px 2px rgba(0,0,0,0.04)",
        "md": "0 4px 12px rgba(0,0,0,0.06)",
        "lg": "0 8px 24px rgba(0,0,0,0.08)",
        "card": "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.08)",
        "plaid-card": "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
        "plaid-card-hover": "0 4px 16px rgba(0,0,0,0.08)",
        "premium": "0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
        "premium-hover": "0 8px 32px rgba(0,0,0,0.1)",
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
        "scroll-right": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slow-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 30px -8px rgba(0,212,126,0.15)" },
          "50%": { boxShadow: "0 0 50px -8px rgba(0,212,126,0.35)" },
        },
        "dash-flow": {
          "0%": { strokeDashoffset: "0" },
          "100%": { strokeDashoffset: "-20" },
        },
      },
      animation: {
        scroll: "scroll 30s linear infinite",
        "scroll-right": "scroll-right 30s linear infinite",
        "slow-spin": "slow-spin 60s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "dash-flow": "dash-flow 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
export default config
