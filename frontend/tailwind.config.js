/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          50: "#f4f5f8",
          100: "#e5e7ee",
          200: "#c7cbda",
          300: "#9ba1bb",
          400: "#6b7296",
          500: "#4c5278",
          600: "#383d5e",
          700: "#282c47",
          800: "#1b1e33",
          900: "#12172b",
          950: "#0a0d1a",
        },
        gold: {
          50: "#fdf8ec",
          100: "#faedc9",
          200: "#f5d98d",
          300: "#f0c25a",
          400: "#eba934",
          500: "#e0921f",
          600: "#c17418",
          700: "#9a5818",
          800: "#7d461a",
          900: "#693b1a",
        },
      },
    },
  },
  plugins: [],
};
