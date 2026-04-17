/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        desksuite: {
          'primary': '#4B0082',
          'primary-content': '#ffffff',
          'secondary': '#FF8C00',
          'secondary-content': '#ffffff',
          'accent': '#D81B60',
          'accent-content': '#ffffff',
          'neutral': '#1e293b',
          'neutral-content': '#f8fafc',
          'base-100': '#ffffff',
          'base-200': '#f8fafc',
          'base-300': '#f1f5f9',
          'base-content': '#020617',
          'info': '#4f46e5',
          'success': '#10b981',
          'warning': '#f59e0b',
          'error': '#ef4444',
        },
        desksuitedark: {
          'primary': '#9c27b0',
          'primary-content': '#ffffff',
          'secondary': '#ff9800',
          'secondary-content': '#ffffff',
          'accent': '#e91e63',
          'accent-content': '#ffffff',
          'neutral': '#334155',
          'neutral-content': '#f8fafc',
          'base-100': '#020617',
          'base-200': '#0f172a',
          'base-300': '#1e293b',
          'base-content': '#f8fafc',
          'info': '#6366f1',
          'success': '#34d399',
          'warning': '#fbbf24',
          'error': '#f87171',
        },
      },
    ],
  },
};
