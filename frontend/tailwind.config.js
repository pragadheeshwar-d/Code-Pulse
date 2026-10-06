/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        '2xs': '360px',
        'xs': '420px',
      },
      colors: {
        bg: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          card: 'var(--surface)',
          elevated: 'var(--surface)',
          hover: 'var(--border)',
          border: 'var(--border)'
        },
        border: 'var(--border)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--on-primary)',
        },
        'on-primary': 'var(--on-primary)',
        accent: {
          DEFAULT: 'var(--accent)',
        },
        text: 'var(--text)',
        muted: 'var(--muted)',
        warm: 'var(--warm)',
        danger: 'var(--danger)',
        heatmap: {
          0: 'var(--heatmap-0)',
          1: 'var(--heatmap-1)',
          2: 'var(--heatmap-2)',
          3: 'var(--heatmap-3)',
          4: 'var(--heatmap-4)',
        },
        background: 'var(--bg)',
        brand: {
          blue: 'var(--accent)',
          'blue-hover': 'var(--accent)',
          accent: 'var(--accent)',
          emerald: 'var(--accent)',
          mint: 'var(--accent)',
        },
        diff: {
          easy: 'var(--accent)',
          medium: 'var(--warm)',
          hard: 'var(--danger)'
        },
        platform: {
          leetcode: 'var(--warm)',
          codechef: 'var(--warm)',
          geeksforgeeks: 'var(--accent)',
          codeforces: 'var(--accent)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SFMono-Regular', 'Menlo', 'monospace']
      }
    },
  },
  plugins: [],
}
