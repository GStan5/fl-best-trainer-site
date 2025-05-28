module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A1A3F",
          light: "#152a5c",
          dark: "#061029",
          50: "#f5f7fa",
          100: "#eaeef5",
          200: "#d5dde9",
          300: "#b3c2d8",
          400: "#8a9fc1",
          500: "#6c82aa",
          600: "#516790",
          700: "#425376",
          800: "#374561",
          900: "#0A1A3F",
        },
        royal: {
          DEFAULT: "#4169E1",
          light: "#6B8EF2",
          dark: "#2A4BA8",
        },
        blue: {
          DEFAULT: "#1D4ED8",
          light: "#3B82F6",
          dark: "#1E40AF",
        },
        gray: {
          lightest: "#F9FAFB",
          light: "#F3F4F6",
          DEFAULT: "#9CA3AF",
          dark: "#4B5563",
          darkest: "#1F2937",
        },
        accent: {
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
        },
      },
      spacing: {
        128: "32rem",
        144: "36rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Montserrat", "sans-serif"],
      },
      animation: {
        gradient: "gradient 8s linear infinite",
        "gradient-text": "gradient-text 3s ease infinite",
        "bounce-slow": "bounce 3s linear infinite",
        float: "float 6s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "slight-bounce": "slightBounce 2s ease-in-out infinite",
        shine: "shine 8s infinite linear",
      },
      keyframes: {
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        "gradient-text": {
          "0%, 100%": {
            "background-size": "200% auto",
            "background-position": "0% center",
          },
          "50%": {
            "background-size": "200% auto",
            "background-position": "100% center",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slightBounce: {
          "0%, 100%": { transform: "translateY(0) translateX(-50%)" },
          "50%": { transform: "translateY(-3px) translateX(-50%)" },
        },
        shine: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      scale: {
        98: ".98",
        102: "1.02",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
