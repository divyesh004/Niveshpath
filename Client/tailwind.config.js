/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* Professional & Trustworthy Color Scheme */
        'primary-pro': '#1E2A38', /* Navy Blue (Trust) */
        'secondary-pro': '#2AB3A6', /* Teal/Mint Green (Fresh, Money-related) */
        'accent-pro': '#3EC1D3', /* Sky Blue (Clean, Open) */
        'background-pro': '#F8F9FA', /* Light Grey/Off White (Minimalism) */
        'text-pro': '#333333', /* Dark Grey/Charcoal (Easy Readability) */
        
        /* Modern & Youthful Color Scheme (Current) */
        primary: '#000000', /* Black */
        secondary: '#00B370', /* Green - Changed from white for better contrast in light mode */
        accent: '#0077FF', /* Electric Blue */
        background: '#FFFFFF', /* White */
        text: '#1A1A1A', /* Almost Black */
        'light-input': '#FFFFFF', /* White */
        'light-sidebar': '#F9F9F9', /* Light Gray */
        
        /* Dark Mode Colors */
        'dark-bg': '#121212',
        'dark-text': '#E0E0E0',
        'dark-input': '#1E1E1E',
        'dark-sidebar': '#0A0A0A'
      },
      fontFamily: {
        /* Professional Fonts */
        'heading-pro': ['Poppins', 'Montserrat', 'sans-serif'],
        'body-pro': ['Roboto', 'Open Sans', 'sans-serif'],
        
        /* Modern & Youthful Fonts (Current) */
        heading: ['Urbanist', 'Quicksand', 'sans-serif'],
        body: ['Inter', 'Nunito', 'sans-serif']
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 16px rgba(0, 0, 0, 0.12)'
      }
    },
  },
  plugins: [],
}