/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4EBD0',
        cream: '#FFF7DC',
        ink: '#171A1F',
        darkNavy: '#18243A',
        mutedNavy: '#24334E',
        arcadeRed: '#E84B4B',
        cartridgeYellow: '#EAB308',
        crtCyan: '#42B8C7',
        gameboyGreen: '#69B85A',
        pixelPink: '#E95A8A',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        arcade: ['Silkscreen', 'monospace'],
        mono: ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        'pixel': '3px 3px 0px #171A1F',
        'pixel-sm': '2px 2px 0px #171A1F',
        'pixel-lg': '5px 5px 0px #171A1F',
        'pixel-red': '3px 3px 0px #E84B4B',
        'pixel-navy': '3px 3px 0px #18243A',
        'pixel-cream': '3px 3px 0px #F4EBD0',
      },
    },
  },
  plugins: [],
};
