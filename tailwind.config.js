/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0B0B0F',
        surface: '#16161D',
        primary: '#6C5CE7',
        onPrimary: '#FFFFFF',
        text: '#F5F5F7',
        textMuted: '#9A9AA5',
        success: '#2ECC71',
        warning: '#F5A623',
        danger: '#E74C3C',
        border: '#26262E',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      fontSize: {
        h1: ['28px', { fontWeight: '700' }],
        h2: ['22px', { fontWeight: '600' }],
        body: ['16px', { fontWeight: '400' }],
        caption: ['13px', { fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};
