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
          DEFAULT: '#1a2e44',
          dark: '#0f172a',
          light: '#1e3a5f',
        },
        accent: {
          teal: '#0d9488',
          blue: '#3b82f6',
          green: '#22c55e',
        },
        surface: {
          DEFAULT: '#2d3748',
          light: '#374151',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
