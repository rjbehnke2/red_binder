/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf2f1',
          100: '#fce4e2',
          200: '#f9cdc9',
          300: '#f4aba6',
          400: '#ec7b73',
          500: '#e05147',
          600: '#C0392B', // Primary brand red
          700: '#a12e23',
          800: '#852922',
          900: '#6f2722',
          950: '#3d100e',
        },
        surface: {
          DEFAULT: '#1a1a1a',
          elevated: '#242424',
          overlay: '#2e2e2e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
