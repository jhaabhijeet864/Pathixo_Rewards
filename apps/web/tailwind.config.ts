import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: {
          50: '#1e2638',
          100: '#141b2a',
          200: '#0f1523',
          300: '#0b0f1a',
        },
        border: 'rgba(255, 255, 255, 0.08)',
        brand: {
          cyan: '#06b6d4',
          indigo: '#6366f1',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        glow: '0 0 30px -5px rgba(6, 182, 212, 0.15)',
        'glow-indigo': '0 0 30px -5px rgba(99, 102, 241, 0.2)',
        'glow-emerald': '0 0 30px -5px rgba(16, 185, 129, 0.2)',
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15), transparent 70%)',
        'radial-cyan': 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.12), transparent 60%)',
      },
    },
  },
  plugins: [],
};

export default config;
