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
        obsidian: {
          950: "#0A0A0A",
          900: "#0E0E0E",
        },
        charcoal: {
          850: "#161616",
          800: "#1E1E1E",
        },
        graphite: {
          700: "#333333",
          600: "#525252",
        },
        ivory: "#F2EFE9",
        stone: "#A6A29A",
        ash: "#73706A",
        sage: "#9CB4A3",
        silver: "#8E8B85",
        fillet: "#D8D4CC",
        terracotta: "#C27D73",
        amber: "#C9A86A",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;