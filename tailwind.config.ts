import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-cairo)', 'Cairo', 'sans-serif'],
      },
      colors: {
        background: '#0A0A0A',
        card: '#111111',
        'card-border': '#1F1F1F',
        gold: '#D4A843',
        'gold-hover': '#C49832',
        'gold-muted': '#8B6914',
        foreground: '#FFFFFF',
        muted: '#9CA3AF',
        success: '#22C55E',
        error: '#EF4444',
        border: '#1F1F1F',
        input: '#1A1A1A',
        ring: '#D4A843',
        primary: {
          DEFAULT: '#D4A843',
          foreground: '#0A0A0A',
        },
        secondary: {
          DEFAULT: '#1F1F1F',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#1F1F1F',
          foreground: '#D4A843',
        },
        popover: {
          DEFAULT: '#111111',
          foreground: '#FFFFFF',
        },
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 168, 67, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(212, 168, 67, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
