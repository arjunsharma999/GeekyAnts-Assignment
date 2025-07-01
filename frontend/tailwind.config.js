/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'lime-gradient': 'linear-gradient(to right, #C0F266, #DAEB5A)',
      },
    },
  },
  plugins: [],
} 