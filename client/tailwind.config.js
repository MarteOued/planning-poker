/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette Bleu Professionnelle
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',  // Bleu principal
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        secondary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        // Ajout d'accents
        accent: {
          cyan: '#06B6D4',
          purple: '#8B5CF6',
          pink: '#EC4899',
        }
      },
      backgroundImage: {
        'gradient-blue': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-light': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        'gradient-ocean': 'linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)',
      },
      boxShadow: {
        'blue': '0 10px 40px rgba(59, 130, 246, 0.2)',
        'card': '0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 20px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 12px rgba(0, 0, 0, 0.1), 0 16px 32px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}