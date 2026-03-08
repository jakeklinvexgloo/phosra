import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./src/renderer/**/*.{html,tsx,ts}', './src/home/**/*.{html,tsx,ts}', './src/family/**/*.{html,tsx,ts}'],
  theme: {
    extend: {
      colors: {
        chrome: {
          bg: 'var(--chrome-bg)',
          surface: 'var(--chrome-surface)',
          'surface-2': 'var(--chrome-surface-2)',
          hover: 'var(--chrome-hover)',
          active: 'var(--chrome-active)',
          border: 'var(--chrome-border)',
          'border-subtle': 'var(--chrome-border-subtle)',
          text: 'var(--chrome-text)',
          'text-secondary': 'var(--chrome-text-secondary)',
          accent: 'var(--chrome-accent)',
          'accent-hover': 'var(--chrome-accent-hover)',
          glow: 'var(--chrome-glow)',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glass-lg': '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glow': '0 0 20px rgba(108, 140, 255, 0.15)',
        'tile': '0 2px 8px rgba(0, 0, 0, 0.2)',
        'tile-hover': '0 8px 24px rgba(0, 0, 0, 0.35)',
      },
      animation: {
        'loading-bar': 'loading-bar 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 200ms cubic-bezier(0, 0, 0.2, 1)',
        'scale-in': 'scale-in 200ms cubic-bezier(0, 0, 0.2, 1)',
        'slide-down': 'slide-down 250ms cubic-bezier(0, 0, 0.2, 1)',
        'tile-enter': 'tile-enter 300ms cubic-bezier(0, 0, 0.2, 1) backwards',
        'field-enter': 'field-enter 350ms cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'slide-in-right': 'slide-in-right 300ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'loading-bar': {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95) translateY(-4px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'tile-enter': {
          from: { opacity: '0', transform: 'scale(0.92) translateY(6px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'field-enter': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
