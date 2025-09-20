/** @type {import('tailwindcss').Config} */
export default {
  // FIX: This line enables class-based dark mode for Tailwind.
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
