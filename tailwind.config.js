/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        accent: {
          DEFAULT: 'var(--accent)',
          hot: 'var(--accent-hot)',
        },
        'on-accent': 'var(--on-accent)',
        sunset: {
          bg: 'var(--bg)',
          surface: 'var(--surface)',
          border: 'var(--border)',
          text: 'var(--text)',
          muted: 'var(--muted)',
          accent: 'var(--accent)',
          'accent-hot': 'var(--accent-hot)',
          'on-accent': 'var(--on-accent)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Cinzel', 'Playfair Display', 'serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
