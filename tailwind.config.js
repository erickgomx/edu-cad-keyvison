/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bce0fd',
          300: '#8ecbfc',
          400: '#58acf8',
          500: '#2b88f0',
          600: '#1d6cdb',
          700: '#1856b3',
          800: '#184791',
          900: '#193d74',
          950: '#102549',
        }
      }
    },
  },
  plugins: [],
}
