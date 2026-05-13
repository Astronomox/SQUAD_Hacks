/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E8501A',
          hover:   '#FF6B35',
          pale:    '#FFF1EC',
          dark:    '#B33D12',
          border:  '#FCDDD0',
        },
        ink: {
          900: '#111111',
          700: '#4A4A4A',
          500: '#8A8A8A',
          200: '#E4E4E0',
          100: '#F4F4F2',
          50:  '#FAFAF8',
        },
        sidebar: {
          DEFAULT: '#1A1A1A',
          hover:   '#2A2A2A',
          text:    '#E0E0E0',
        },
        ok:    { DEFAULT: '#16A34A', pale: '#DCFCE7' },
        warn:  { DEFAULT: '#D97706', pale: '#FEF3C7' },
        bad:   { DEFAULT: '#DC2626', pale: '#FEE2E2' },
        info:  { DEFAULT: '#2563EB', pale: '#DBEAFE' },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card:     '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        elevated: '0 4px 16px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)',
        focus:    '0 0 0 4px rgba(232,80,26,0.18)',
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
};
