// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./page.tsx", // Asegúrate de incluir el archivo principal
    "./app/page.tsx"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}