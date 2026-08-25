/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0b0f19",
          card: "#131b2e",
          border: "#1e293b",
          hover: "#1c2640"
        },
        accent: {
          cyan: "#38bdf8",
          purple: "#c084fc",
          emerald: "#34d399",
          amber: "#fbbf24",
          rose: "#fb7185"
        }
      }
    },
  },
  plugins: [],
}
