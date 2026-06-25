import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./emails/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  "#eef1f8",
          100: "#d5dcee",
          200: "#aab9dd",
          300: "#7e95cb",
          400: "#5372ba",
          500: "#3a58a9",
          600: "#2d4589",
          700: "#1e3170",
          800: "#131f4d",
          900: "#0A0F1E",
          950: "#060912",
        },
        crimson: {
          50:  "#fff0f1",
          100: "#ffcfd1",
          200: "#ffa0a6",
          300: "#ff6472",
          400: "#f43348",
          500: "#C01820",
          600: "#9B1219",
          700: "#780E14",
          800: "#560A0F",
          900: "#3C070A",
        },
        gold: {
          300: "#F0D080",
          400: "#E5BE6A",
          500: "#D4A853",
          600: "#B8860B",
          700: "#9A6E08",
        },
        cream: "#FAFAF5",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        brand: ["Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-mesh": "radial-gradient(at 40% 20%, hsla(358,75%,50%,0.14) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(358,60%,30%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(358,100%,90%,0.08) 0px, transparent 50%)",
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-right": "slideRight 0.5s ease forwards",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "marquee": "marquee 25s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      boxShadow: {
        "glow-crimson": "0 0 30px rgba(192,24,32,0.35)",
        "glow-navy": "0 0 40px rgba(10,15,30,0.4)",
        "card": "0 4px 24px rgba(10,15,30,0.08), 0 1px 4px rgba(10,15,30,0.04)",
        "card-hover": "0 12px 40px rgba(10,15,30,0.14), 0 2px 8px rgba(10,15,30,0.06)",
        "elevated": "0 20px 60px rgba(10,15,30,0.15), 0 4px 16px rgba(10,15,30,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
