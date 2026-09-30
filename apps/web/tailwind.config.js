/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4EFD9',
        cream: '#FFF7DC',
        ink: '#111522',
        cabinet: '#161616',
        navy: '#11182A',
        slateNavy: '#151C30',
        mutedBlue: '#43566B',
        arcadeRed: '#E84A4A',
        pixelPink: '#F04D8A',
        crtCyan: '#49B8D1',
        cartridgeYellow: '#F4D35E',
        gameboyGreen: '#67B85A',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        arcade: ['Silkscreen', 'monospace'],
        mono: ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        'pixel': '3px 3px 0px #111522',
        'pixel-sm': '2px 2px 0px #111522',
        'pixel-lg': '4px 4px 0px #111522',
        'pixel-light': '3px 3px 0px #F4EFD9',
        'pixel-red': '3px 3px 0px #E84A4A',
        'pixel-cyan': '3px 3px 0px #49B8D1',
        'pixel-yellow': '3px 3px 0px #F4D35E',
      },
    },
  },
  plugins: [],
};
