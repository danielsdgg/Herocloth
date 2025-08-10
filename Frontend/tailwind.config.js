/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./src/components/**/*.{js,jsx,ts,tsx}",
  "./src/pages/**/*.{js,jsx,ts,tsx}",
  "./src/App.tsx",
  "./index.html",
],
  theme: {
    extend: {
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
      animation: {
        "fade-in-down": "fade-in-down 0.6s ease-out",
      },
      keyframes: {
        "fade-in-down": {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};