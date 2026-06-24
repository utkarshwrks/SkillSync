/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // Primary accent (indigo → violet). Slightly desaturated vs before so
        // it reads premium, not toy-like.
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          900: "#312e81",
        },
        // Secondary accent (cyan/teal) for two-tone web3 gradients & glows.
        aqua: {
          300: "#38BDF8",
          400: "#0EA5E9",
          500: "#06b6d4",
        },
        // Tertiary accent used sparingly for highlights.
        plum: {
          400: "#38BDF8",
          500: "#0EA5E9",
        },
        // Deep-space canvas + raised card surfaces.
        night: {
          950: "#04060f",
          900: "#0b0f1c",
          800: "#121829",
          700: "#1b2236",
        },
        ink: "#f1f5f9",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(59,130,246,0.22), 0 18px 50px -14px rgba(37,99,235,0.5)",
        "glow-aqua": "0 0 0 1px rgba(14,165,233,0.22), 0 18px 50px -14px rgba(14,165,233,0.4)",
        card: "0 12px 48px -18px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(120deg, #2563EB 0%, #3B82F6 50%, #0EA5E9 100%)",
        "brand-sheen":
          "linear-gradient(120deg, #0EA5E9 0%, #2563EB 40%, #3B82F6 80%, #0EA5E9 100%)",
        "grid-faint":
          "linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-14px)" } },
        // Slow-drifting aurora blobs for the animated background. Translate-only
        // (no scale) so the heavy blur rasterizes ONCE and we just composite —
        // animating scale on a 150px+ blur re-rasterizes every frame (jank).
        auroraA: {
          "0%,100%": { transform: "translate3d(0,0,0)" },
          "33%": { transform: "translate3d(9%,7%,0)" },
          "66%": { transform: "translate3d(-7%,5%,0)" },
        },
        auroraB: {
          "0%,100%": { transform: "translate3d(0,0,0)" },
          "33%": { transform: "translate3d(-8%,-6%,0)" },
          "66%": { transform: "translate3d(6%,-9%,0)" },
        },
        // Panning grid for depth.
        gridPan: { "0%": { backgroundPosition: "0 0" }, "100%": { backgroundPosition: "44px 44px" } },
        // Moving gradient (text & borders).
        gradientMove: { "0%,100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
        // Pulsing glow for highlighted elements.
        glowPulse: {
          "0%,100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.05)" },
        },
        // Rotating conic for animated gradient ring borders.
        spinSlow: { to: { transform: "rotate(360deg)" } },
        // Rising entrance.
        riseIn: { from: { opacity: "0", transform: "translateY(14px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        // Star twinkle.
        twinkle: { "0%,100%": { opacity: "0.5" }, "50%": { opacity: "0.95" } },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "aurora-a": "auroraA 34s ease-in-out infinite",
        "aurora-b": "auroraB 40s ease-in-out infinite",
        "grid-pan": "gridPan 40s linear infinite",
        "gradient-move": "gradientMove 8s ease infinite",
        "glow-pulse": "glowPulse 6s ease-in-out infinite",
        "spin-slow": "spinSlow 9s linear infinite",
        "rise-in": "riseIn 0.5s ease both",
        twinkle: "twinkle 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
