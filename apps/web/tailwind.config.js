/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bro: {
          bg: '#0B0F19',
          card: '#121826',
          border: '#1E293B',
          blue: '#2563EB',
          cyan: '#06B6D4',
          coral: '#F43F5E',
          yellow: '#F59E0B',
          green: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        display: ['Space Grotesk', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 25px -5px rgba(37, 99, 235, 0.4)',
        coral: '0 0 25px -5px rgba(244, 63, 94, 0.4)',
      },
    },
  },
  plugins: [],
};
