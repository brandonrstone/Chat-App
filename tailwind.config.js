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
        primary: '#b590ff',
        'primary-dark': 'rgb(30 41 59 / var(--tw-bg-opacity, 1))'
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'], // Add your custom font
      },
    },
  },
  plugins: []
}