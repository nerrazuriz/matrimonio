import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        'fade-in': 'fade-in 600ms ease-out',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        chess: ['"Noto Sans Symbols 2"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        medieval: ['Cinzel', 'serif'],
        scroll: ['"IM Fell English"', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
