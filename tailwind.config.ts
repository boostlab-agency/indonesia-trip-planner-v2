import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefbf5",
          100: "#d6f5e5",
          200: "#afe9cd",
          300: "#7cd8b0",
          400: "#48c090",
          500: "#25a677",
          600: "#18855f",
          700: "#166a4d",
          800: "#155440",
          900: "#134536",
        },
      },
    },
  },
  plugins: [],
};

export default config;
