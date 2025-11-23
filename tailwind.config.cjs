/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./public/**/*.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00C4CC", // Turquesa Canva
        secondary: "#5E5CE6", // Azul lavanda Canva
        accent: "#FFB347",
        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 10px rgba(0, 0, 0, 0.06)",
        glow: "0 0 12px rgba(0, 196, 204, 0.3)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      },
      transitionTimingFunction: {
        "in-out-soft": "cubic-bezier(0.4, 0, 0.2, 1)"
      }
    }
  },
  plugins: [],
};
