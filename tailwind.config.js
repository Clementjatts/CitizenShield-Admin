/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode via class strategy
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8',      // Blue-700
        secondary: '#2563EB',    // Blue-600
        'primary-dark': '#1E40AF', // Blue-800
      },
    },
  },
  plugins: [],
};
