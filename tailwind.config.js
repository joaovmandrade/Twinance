/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        dark:     '#0F0E17',
        surface:  '#1A1827',
        elevated: '#221F32',
        rim:      '#2D2A3E',
        'on-dark': '#F0EEF8',
        muted:    '#9B97B2',

        gray: {
          50:  '#221F32',
          100: '#221F32',
          200: '#2D2A3E',
          300: '#544F68',
          400: '#9B97B2',
          500: '#9B97B2',
          600: '#B8B4CC',
          700: '#D4D0E4',
          800: '#E8E4F5',
          900: '#F0EEF8',
        },

        primary: {
          50:  '#200D14',
          100: '#2D1624',
          200: '#4A2035',
          300: '#FF85B8',
          400: '#FF6AA4',
          500: '#FF4D8D',
          600: '#FF4D8D',
          700: '#E63577',
          800: '#C21F60',
          900: '#9E0D4A',
        },

        partner: {
          50:  '#130E20',
          100: '#1E1535',
          200: '#3D2E6B',
          300: '#B28EFF',
          400: '#A377FF',
          500: '#9B6CFF',
          600: '#9B6CFF',
          700: '#7C4AE8',
          800: '#6230CC',
          900: '#4A1FAF',
        },

        success: '#1ED8A0',
        warning: '#F5A623',
        error:   '#FF5170',
      },
    },
  },
  plugins: [],
}
