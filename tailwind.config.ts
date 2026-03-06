import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "text-pulse-critical", "text-pulse-watch", "text-pulse-stable",
    "bg-red-100", "border-red-300", "border-t-red-500", "border-l-red-500",
    "bg-amber-100", "border-amber-300", "border-t-amber-500", "border-l-amber-500",
    "bg-green-100", "border-green-300", "border-t-green-500", "border-l-green-500",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
  			display: ["var(--font-display)", "Playfair Display", "Georgia", "serif"],
  		},
  		keyframes: {
  			"fade-in": {
  				"0%": { opacity: "0" },
  				"100%": { opacity: "1" },
  			},
  			"fade-in-up": {
  				"0%": { opacity: "0", transform: "translateY(8px)" },
  				"100%": { opacity: "1", transform: "translateY(0)" },
  			},
  		},
  		animation: {
  			"fade-in": "fade-in 0.4s ease-out forwards",
  			"fade-in-up": "fade-in-up 0.5s ease-out forwards",
  		},
  		colors: {
  			"text-dark": "#2c2c2c",
  			"text-light": "#f5f5f5",
  			"text-mutedDark": "#6b6b6b",
  			"text-mutedLight": "#a3a3a3",
  			"glass-light": "rgba(255, 255, 255, 0.4)",
  			"glass-dark": "rgba(255, 255, 255, 0.05)",
  			"glass-border-light": "rgba(255, 255, 255, 0.6)",
  			"glass-border-dark": "rgba(255, 255, 255, 0.1)",
  			pulse: {
  				critical: 'hsl(var(--destructive))',
  				watch: '#f59e0b',
  				stable: '#22c55e',
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
