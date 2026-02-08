import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f4f6f4",
          100: "#e3e8e3",
          200: "#c7d2c7",
          300: "#a3b3a3",
          400: "#7d8f7d",
          500: "#617361",
          600: "#4d5c4d",
          700: "#3f4b3f",
          800: "#353e35",
          900: "#2e352e",
        },
        calm: {
          50: "#f0f7f8",
          100: "#d9eef0",
          200: "#b8dfe4",
          300: "#88c9d2",
          400: "#52aab8",
          500: "#378e9d",
          600: "#317383",
          700: "#2d5f6c",
          800: "#2c505a",
          900: "#28444d",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
