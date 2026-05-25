/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "village-bg": "#F6FAF8",
        "village-surface": "#FFFFFF",
        "village-border": "#E2EBE6",
        "village-primary": "#3F8F6B",
        "village-text": "#1F2A26",
        "village-text-secondary": "#5F6E68",
        "village-inactive": "#9FB2AA",
        "village-success": "#3F8F6B",
        "village-error": "#D6604D",
        "village-coin": "#C99A2E",
        "village-star": "#F5C842",
        "village-tab": "#FFFFFF",
        "village-cta": "#E76F51",
        "village-banner": "#7A6420",
        "village-cream": "#F6FAF8",
        "village-underground-deep": "#2A1810",
        "village-underground-shallow": "#6B4226",
        "village-ground-grass": "#7FB83D",
        "village-sky": "#8FC9F9",
        "village-space": "#0B0E2A",
        "village-splash-bg": "#F6FAF8",
      },
    },
  },
  plugins: [],
};
