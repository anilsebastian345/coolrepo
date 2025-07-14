/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Tailwind will scan these files for classes
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FAFAF7',
        accent: '#D8CEC4',
        text: '#2D2D2D',
        highlight: '#C1CFC0',
        cta: '#A39891',
        card: '#F1F0ED',
      },
    },
  },
  plugins: [],
}
