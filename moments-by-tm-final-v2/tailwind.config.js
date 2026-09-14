/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './assets/js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F8F5F0',
        taupe: '#DFD7CF',
        terracotta: '#BA5D40',
        ink: '#3B3330',
        sand: '#EEE7DE',
        cream: '#FBF8F4'
      },
      fontFamily: {
        display: ['"Playfair Display"', '"Noto Serif Georgian"', 'Georgia', 'serif'],
        body: ['"Plus Jakarta Sans"', '"Noto Sans Georgian"', 'Arial', 'sans-serif']
      },
      boxShadow: {
        soft: '0 18px 50px rgba(59, 51, 48, 0.10)'
      }
    }
  },
  plugins: []
};
