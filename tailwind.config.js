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
        primary: '#b590ff'
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'], // Add your custom font
      },
    },
  },
  plugins: []
}