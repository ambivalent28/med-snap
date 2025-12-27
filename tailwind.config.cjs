/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f8ff",
          100: "#e6f1ff",
          200: "#c5ddff",
          300: "#97c0ff",
          400: "#5c96ff",
          500: "#2f6bff",
          600: "#1d51e6",
          700: "#1740b3",
          800: "#14378c",
          900: "#122f71"
        }
      }
    }
  },
  plugins: []
};

