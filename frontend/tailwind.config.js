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
        background: '#090d16',
        surface: {
          DEFAULT: '#111726',
          card: '#131b2e',
          hover: '#1a233a',
          border: '#1e293b'
        },
        brand: {
          blue: '#2563eb',
          'blue-hover': '#1d4ed8',
          accent: '#3b82f6',
        },
        diff: {
          easy: '#10b981',
          medium: '#f59e0b',
          hard: '#ef4444'
        },
        platform: {
          leetcode: '#ffa116',
          codechef: '#b57948',
          geeksforgeeks: '#2f9d54',
          codeforces: '#3b82f6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
