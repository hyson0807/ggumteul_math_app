/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "village-bg": "#FFE2DE",
        "village-surface": "#FFF8F0",
        "village-border": "#F0D5C8",
        "village-primary": "#A0522D",
        "village-text": "#5D4037",
        "village-text-secondary": "#8D6E63",
        "village-inactive": "#CDAB8F",
        "village-success": "#6B8E23",
        "village-error": "#CD5C5C",
        "village-coin": "#DAA520",
        "village-star": "#FFD700",
        "village-tab": "#FFF0E8",
        "village-cta": "#C0392B",
        "village-banner": "#8B6914",
        "village-cream": "#FFF8DC",
        "village-underground-deep": "#2A1810",
        "village-underground-shallow": "#6B4226",
        "village-ground-grass": "#7FB83D",
        "village-sky": "#8FC9F9",
        "village-space": "#0B0E2A",
        "village-splash-bg": "#2E2217",
      },
    },
  },
  plugins: [],
};
