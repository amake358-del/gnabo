/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          50: '#EEF0F3',
          100: '#D0D5DE',
          200: '#A1ABB9',
          300: '#738095',
          400: '#445670',
          500: '#0F1A2E',
          600: '#0C1525',
          700: '#09101C',
          800: '#060B14',
          900: '#03050B',
        },
        accent: {
          50: '#FEF8EC',
          100: '#FDEFCE',
          200: '#FBE09D',
          300: '#F9D06C',
          400: '#F7C13B',
          500: '#C4820E',
          600: '#9D680B',
          700: '#764E09',
          800: '#4E3406',
          900: '#271A03',
        },
        surface: {
          50: '#FAFAF8',
          100: '#F5F4F0',
          200: '#E2DDD4',
          300: '#CEC6B8',
          400: '#BAAF9C',
          500: '#A69880',
        },
        aluminium: '#A8B5B8',
        metallique: '#7F8C8D',
        electronique: '#2980B9',
      },
      boxShadow: {
        'warm': '0 1px 3px rgba(15,26,46,0.06), 0 1px 2px rgba(15,26,46,0.04)',
        'warm-md': '0 4px 12px rgba(15,26,46,0.08)',
        'warm-lg': '0 8px 24px rgba(15,26,46,0.10)',
        'soft': '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)',
        'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.05), 0 12px 24px rgba(0,0,0,0.05)',
        'modal': '0 0 0 1px rgba(0,0,0,0.04), 0 8px 16px rgba(0,0,0,0.08), 0 24px 48px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-left': 'slideLeft 0.2s ease-out',
        'slide-right': 'slideRight 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        slideLeft: { '0%': { opacity: '0', transform: 'translateX(8px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        slideRight: { '0%': { opacity: '0', transform: 'translateX(-8px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      },
    }
  },
  plugins: []
}
