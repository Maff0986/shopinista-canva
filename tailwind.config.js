/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2B6CB0',
        secondary: '#2C5282',
        success: '#16A34A'
      }
    }
  },
  plugins: []
};
