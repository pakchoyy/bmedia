import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0d7a8a",
          light: "#0ea5a0",
          dark: "#2d6a7f",
          bg: "#e6f6f5",
        },
        accent: "#d97706",
        success: "#16a34a",
        danger: "#dc2626",
        ink: "#1e293b",
        pagebg: "#f8fafc",
        // Palet neo-brutalism
        nb: {
          ink: "#1b1a3a",
          cream: "#fff6dc",
          yellow: "#ffd23f",
          orange: "#ff7a1a",
          blue: "#2563eb",
          pink: "#ff5d8f",
          mint: "#2ec4b6",
          lilac: "#b79cff",
        },
      },
      backgroundImage: {
        "bgy-gradient":
          "linear-gradient(90deg, #0ea5a0 0%, #0d7a8a 50%, #2d6a7f 100%)",
        "bgy-hero":
          "linear-gradient(135deg, #0ea5a0 0%, #0d7a8a 50%, #2d6a7f 100%)",
        "bgy-stats": "linear-gradient(135deg, #0ea5a0 0%, #0d7a8a 100%)",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0,0,0,0.05)",
        md: "0 4px 6px rgba(0,0,0,0.05)",
        lg: "0 10px 25px rgba(0,0,0,0.08)",
        header: "0 2px 10px rgba(0,0,0,.18)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "'Segoe UI'", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "ui-rounded", "'Segoe UI'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
