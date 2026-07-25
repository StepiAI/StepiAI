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
        blue: '#1A73E8',

        light: {
          canvas: '#F2F2F7',
          sheet: '#FFFFFF',
          ink: '#1C1C1E',
          inkStrong: '#111114',
          // Token di bawah ini dilewatin CSS variable biar toggle "Increase
          // Contrast" (Settings > Accessibility) bisa nuker nilainya pas
          // runtime. Nilai kedua = fallback: dipake kalau variabelnya gak
          // kebaca, jd paling jelek warnanya balik ke normal — bukan ilang.
          //
          // #8E8E93 cuma 3.26:1 di atas putih (gagal WCAG AA buat teks body),
          // makanya default muted-nya sekarang #6E6E78 = 5.04:1.
          muted: 'var(--color-muted, #6E6E78)',
          faint: 'var(--color-faint, #A0A0A8)',
          hint: 'var(--color-hint, #B4B4BC)',
          disabled: 'var(--color-disabled, #C6C6CC)',
          line: 'var(--color-line, #EAEAEE)',
          rule: 'var(--color-rule, #F0F0F3)',
          fill: '#F1F1F5',
          grid: '#C3D2E8',
          accent: 'var(--color-accent, #2E7BE0)',
          accentSoft: '#D7E7FC',
          icon: '#4A4A52',
          cta: '#0A0A0A',
          bubble: '#FFFFFF',
          userBubble: '#E8F1FD',
          accentLine: '#C4D7F5',
          success: '#41C46F',
        },
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
