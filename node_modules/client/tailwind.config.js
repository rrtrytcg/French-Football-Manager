/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#060816",
        panel: "#0f172a",
        glow: "#2dd4bf",
        danger: "#fb7185",
        gold: "#fbbf24",
      },
      fontFamily: {
        display: ["Rajdhani", "sans-serif"],
        body: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 0 1px rgba(45,212,191,0.25), 0 0 30px rgba(45,212,191,0.12)",
      },
      backgroundImage: {
        pitch:
          "radial-gradient(circle at top, rgba(45,212,191,0.22), transparent 35%), linear-gradient(135deg, rgba(15,23,42,0.95), rgba(2,6,23,1))",
      },
    },
  },
  plugins: [],
};
