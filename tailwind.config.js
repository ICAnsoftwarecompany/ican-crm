/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Cairo', 'sans-serif'],
        latin: ['DM Sans', 'sans-serif'],
        sans: ['Cairo', 'DM Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#162847',
          'primary-l': '#1D3461',
          accent: '#00C2CB',
          'accent-soft': '#E8F9FA',
          bg: '#F0F4FC',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          2: '#F8FAFF',
        },
        border: '#E2E6F0',
        status: {
          new: '#3B82F6',
          contacted: '#F59E0B',
          qualified: '#8B5CF6',
          won: '#10B981',
          lost: '#EF4444',
        },
        ai: {
          color: '#00C2CB',
          bg: '#E8F9FA',
          border: '#A0ECF0',
          text: '#007A80',
        },
      },
      textColor: {
        primary: '#0F172A',
        secondary: '#64748B',
        light: '#94A3B8',
      },
    },
  },
  plugins: [],
}
