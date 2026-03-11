/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1e40af',
          light: '#3b82f6',
          dark: '#1e3a8a',
        },
        secondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        surface: '#f8fafc',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
        'glass': 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
      }
    }
  },
  plugins: [],
}
