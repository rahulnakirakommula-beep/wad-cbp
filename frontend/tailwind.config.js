/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          navy: '#1B2A4A',
        },
        accent: {
          amber: '#E6A817',
        }
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        }
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite',
        shake: 'shake 0.4s ease-in-out',
      }
    },
  },
  plugins: [],
}
