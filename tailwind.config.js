import { defineConfig } from 'tailwindcss';

export default {
  content: ['./index.html', './src/frontend/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#0f172a'
        }
      },
      boxShadow: {
        panel: '0 10px 30px rgba(15, 23, 42, 0.35)'
      }
    }
  },
  plugins: []
};
