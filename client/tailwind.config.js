/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#111214',
          subtle: '#181A1D',
          card: '#1B1D21',
          border: '#28292B',
          text: '#F5F4F0',
          muted: '#8A8D93',
        },
        lime: {
          DEFAULT: '#D4FF00',
          hover: '#C2EB00',
          muted: 'rgba(212, 255, 0, 0.12)',
          border: 'rgba(212, 255, 0, 0.35)',
        },
        warm: {
          bg: '#F8F7F3',
          card: '#FFFFFF',
          text: '#151619',
          secondary: '#74777D',
          border: '#E6E1D8',
          subtle: '#F1EFEA',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 1px rgba(0, 0, 0, 0.02)',
        'card': '0 2px 8px -2px rgba(17, 18, 20, 0.04), 0 1px 4px -1px rgba(17, 18, 20, 0.02)',
        'elevated': '0 8px 24px -4px rgba(17, 18, 20, 0.08), 0 2px 6px -2px rgba(17, 18, 20, 0.04)',
      }
    },
  },
  plugins: [],
}
