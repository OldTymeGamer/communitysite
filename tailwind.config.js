module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'trail-brown': '#1a1008',
        'parchment': '#2a1a0a',
        'amber-200': '#d4af37',
        'amber-100': '#f1e5ac',
        'dust': '#e8d9c5',
      },
      backgroundImage: {
        'parchment-pattern': "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"400\" viewBox=\"0 0 400 400\"><rect width=\"400\" height=\"400\" fill=\"%232a1a0a\" opacity=\"0.95\"/><path d=\"M0,0 L400,400 M400,0 L0,400\" stroke=\"%23654321\" stroke-width=\"0.5\" opacity=\"0.2\"/></svg>')",
      },
    },
  },
  plugins: [],
};