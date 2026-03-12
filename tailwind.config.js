/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff0f5',
          100: '#ffe0eb',
          200: '#ffb3cc',
          300: '#ff80aa',
          400: '#ff4d88',
          500: '#ff1a66',
          600: '#e6005c',
          700: '#b30047',
          800: '#800033',
          900: '#4d001f',
        },
        rose: {
          light: '#fff0f5',
          soft:  '#ffd6e7',
          main:  '#f472b6',
          dark:  '#db2777',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
