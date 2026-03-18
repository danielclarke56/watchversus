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
          DEFAULT: '#8A8A8A',
          light: '#ADADAD',
          dark: '#5C5C5C',
        },
        slate: {
          950: '#020617',
        },
        accent: '#5C5C5C',
        accentHover: '#404040',
        accentLight: '#F0F0F0',
        winner: '#16A34A',
        winnerBg: '#F0FDF4',
        surface: '#FFFFFF',
        surfaceAlt: '#FAFAFA',
        border: '#F0F0F0',
        borderStrong: '#E8E8E8',
        textPrimary: '#444444',
        textSecond: '#777777',
        textMuted: '#AAAAAA',
        neutral: '#F9F9F9',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        heading: ['Satoshi', 'system-ui', 'sans-serif'],
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
