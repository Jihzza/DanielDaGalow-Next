export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Keep if you plan to use src later, or remove
    "./app/**/*.{js,jsx,ts,tsx}", // Add this line
    "./components/**/*.{js,jsx,ts,tsx}", // Add if you create a root components folder
  ],
  theme: {
    extend: {
      colors: {
        oxfordBlue: '#002147',  // primary dark blue
        charcoalGray: '#333333',
        darkGold: '#BFA200',
        gentleGray: '#ECEBE5',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
