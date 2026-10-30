/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false, // This is critical for MUI compatibility
  },
  theme: {
    extend: {},
  },
  plugins: [],
}