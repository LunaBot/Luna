module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        blurple: '#7289DA',
        greyple: '#99AAB5',
        quitedark: '#2C2F33',
        almostblack: '#23272A'
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
