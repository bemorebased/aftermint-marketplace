import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Enable class-based theme switching
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Semantic color names that will use CSS variables
        'theme-background': 'hsl(var(--theme-background))',
        'theme-surface': 'hsl(var(--theme-surface))',
        'theme-card-highlight': 'hsl(var(--theme-card-highlight))',
        'theme-primary': 'hsl(var(--theme-primary))',
        'theme-secondary': 'hsl(var(--theme-secondary))',
        'theme-text-primary': 'hsl(var(--theme-text-primary))',
        'theme-text-secondary': 'hsl(var(--theme-text-secondary))',
        'theme-border': 'hsl(var(--theme-border))',
        
        // Specific brand/accent colors can also be defined directly if needed
        // For example, the Based theme's glowy cyan for direct use:
        'based-cyan-glow': '#64FFDA',
        based: "hsl(var(--BASED))",
        "based-light": "hsl(var(--BASED-light))",
        "based-dark": "hsl(var(--BASED-dark))",
        kek: "hsl(var(--KEK))",
        "kek-light": "hsl(var(--KEK-light))",
        "kek-dark": "hsl(var(--KEK-dark))",
        modes: "hsl(var(--MODES))",
        "modes-light": "hsl(var(--MODES-light))",
        "modes-dark": "hsl(var(--MODES-dark))",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        gradient: 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          to: { 'background-position': '200% center' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config; 