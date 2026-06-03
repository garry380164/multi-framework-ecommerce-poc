/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans TC"', 'Inter', 'sans-serif'],
        title: ['"Noto Sans TC"', 'Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: 'rgb(var(--color-primary) / <alpha-value>)',
          'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
          'primary-light': 'rgb(var(--color-primary-light) / <alpha-value>)',
          'primary-light-hover': 'rgb(var(--color-primary-light-hover) / <alpha-value>)',
          'bg-main': 'rgb(var(--color-bg-main) / <alpha-value>)',
          'bg-search': 'rgb(var(--color-bg-search) / <alpha-value>)',
          'bg-search-hover': 'rgb(var(--color-bg-search-hover) / <alpha-value>)',
        }
      }
    },
  },
  plugins: [],
}
