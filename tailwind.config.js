/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'theme-dark',
    'theme-kek',
    'theme-based',
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          background: 'hsl(var(--background) / <alpha-value>)',
          surface: 'hsl(var(--surface) / <alpha-value>)',
          primary: 'hsl(var(--primary) / <alpha-value>)',
          secondary: 'hsl(var(--secondary) / <alpha-value>)',
          'text-primary': 'hsl(var(--text-primary) / <alpha-value>)',
          'text-secondary': 'hsl(var(--text-secondary) / <alpha-value>)',
          border: 'hsl(var(--border-color) / <alpha-value>)',
          'card-highlight': 'hsl(var(--card-highlight) / <alpha-value>)',
        },
      },
      boxShadow: {
        glow: 'var(--glow-primary)',
        card: 'var(--card-shadow)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shine': 'shine 1.5s ease-in-out infinite',
      },
      keyframes: {
        shine: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' }
        }
      }
    },
  },
  plugins: [],
}; 