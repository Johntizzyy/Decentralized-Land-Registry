/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ng-green': '#008751',
        'ng-white': '#FFFFFF',
        'ng-green-dark': '#006B42',
      },
    },
  },
  plugins: [],
}
