/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        appBg: '#0B0B0F',
        cardBg: '#15151C',
        borderSep: '#232330',
        textPrimary: '#F4F4F6',
        textMuted: '#8A8A97',
        accent: '#6366F1',
        // Priority strip colors
        priorityLow: '#34D399',
        priorityMedium: '#FBBF24',
        priorityHigh: '#F87171',
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#1e1b4b',
        },
      },
      borderRadius: {
        card: '8px',
        input: '8px',
        btn: '6px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'hover-subtle': '0 4px 12px 0 rgba(0, 0, 0, 0.4)',
        'drag-active': '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
      }
    },
  },
  plugins: [],
}
