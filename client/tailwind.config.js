/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0a0d14',
          panel: '#0f1422',
          border: '#1e293b',
          accent: '#10b981',
          cyan: '#06b6d4',
          purple: '#8b5cf6',
          yellow: '#f59e0b',
          dim: '#64748b'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
