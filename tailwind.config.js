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
          primary: 'var(--brand-primary)',
          'primary-l': 'var(--brand-primary-l)',
          accent: 'var(--brand-accent)',
          'accent-soft': 'var(--brand-accent-soft)',
          bg: 'var(--brand-bg)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
        },
        border: 'var(--border)',
        status: {
          new: 'var(--status-new)',
          contacted: 'var(--status-contacted)',
          qualified: 'var(--status-qualified)',
          won: 'var(--status-won)',
          lost: 'var(--status-lost)',
        },
        ai: {
          color: 'var(--ai-color)',
          bg: 'var(--ai-bg)',
          border: 'var(--ai-border)',
          text: 'var(--ai-text)',
        },
      },
      textColor: {
        primary: 'var(--text)',
        secondary: 'var(--text-muted)',
        light: 'var(--text-muted)',
      },
      zIndex: {
        base: '0',
        dropdown: '20',
        sticky: '40',
        overlay: '100',
        modal: '1000',
        popover: '9000',
        toast: '10000',
      },
    },
  },
  plugins: [],
}
