import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: "#38bdf8",
          purple: "#a855f7",
          pink: "#f472b6",
          amber: "#f59e0b"
        },
        grayglass: "rgba(15, 23, 42, 0.6)"
      },
      backgroundImage: {
        "star-field": "radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.25), transparent 60%), radial-gradient(circle at 80% 30%, rgba(56, 189, 248, 0.2), transparent 55%), radial-gradient(circle at 50% 80%, rgba(244, 114, 182, 0.35), transparent 60%)"
      },
      animation: {
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
        drift: "drift 12s ease-in-out infinite",
        flicker: "flicker 1.8s infinite"
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(56, 189, 248, 0.6)" },
          "50%": { boxShadow: "0 0 35px rgba(168, 85, 247, 0.9)" }
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0, -5px, 0) scale(1)" },
          "50%": { transform: "translate3d(0, 8px, 0) scale(1.02)" }
        },
        flicker: {
          "0%, 100%": { opacity: "0.95" },
          "40%": { opacity: "0.6" },
          "50%": { opacity: "0.9" },
          "60%": { opacity: "0.55" },
          "70%": { opacity: "0.92" }
        }
      }
    }
  },
  plugins: []
};

export default config;
