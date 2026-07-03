/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14213d",
        mint: "#2a9d8f",
        coral: "#e76f51",
        gold: "#f4a261"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(20, 33, 61, 0.12)"
      }
    }
  },
  plugins: []
};
