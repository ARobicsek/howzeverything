import { COLORS, FONTS, SPACING, BORDERS, SHADOWS, TYPOGRAPHY } from './src/constants';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ...COLORS,
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        }
      },
      fontFamily: {
        sans: FONTS.primary.fontFamily.split(','),
        heading: FONTS.heading.fontFamily.split(','),
        body: FONTS.body.fontFamily.split(','),
      },
      spacing: SPACING,
      borderRadius: BORDERS.radius,
      boxShadow: SHADOWS,
      fontSize: {
        'xs': TYPOGRAPHY.xs,
        'sm': TYPOGRAPHY.sm,
        'base': TYPOGRAPHY.base,
        'lg': TYPOGRAPHY.lg,
        'xl': TYPOGRAPHY.xl,
        '2xl': TYPOGRAPHY['2xl'],
        '3xl': TYPOGRAPHY['3xl'],
      }
    },
  },
  plugins: [],
}