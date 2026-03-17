import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0f172a',
          light: '#1e293b',
          medium: '#334155',
        },
        gold: {
          DEFAULT: '#d4a853',
          light: '#e4c07a',
          dark: '#b8863a',
        },
        slate: {
          950: '#020617',
        },
        accent: '#B8860B',
        accentHover: '#9A700A',
        accentLight: '#FEF3C7',
        winner: '#16A34A',
        winnerBg: '#F0FDF4',
        surface: '#FFFFFF',
        surfaceAlt: '#F1F5F9',
        border: '#E2E8F0',
        borderStrong: '#CBD5E1',
        textPrimary: '#0F172A',
        textSecond: '#475569',
        textMuted: '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.06)',
        md: '0 4px 12px rgba(0,0,0,0.08)',
        lg: '0 20px 40px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [typography],
};
export default config;
