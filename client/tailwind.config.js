/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        corporate: {
          dark: '#0A1E31',     // Deepest navy for header backgrounds
          blue: '#0F2942',     // Brand Deep Blue
          blueLight: '#1E3E62',// Lighter corporate blue for headers / buttons
          blueSoft: '#E6ECF4', // Soft blue-tinted gray for card background accents
          gray: '#F8F9FA',     // Content area background
          grayBorder: '#E2E8F0', // Border colors
          orange: '#F26822',   // Corporate Orange (Primary accent)
          orangeHover: '#D9520F', // Darker orange for hovers
          orangeLight: '#FFF2EB', // Very soft orange for highlights
          textDark: '#1E293B', // Main text gray
          textMuted: '#64748B' // Muted subtitle text
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(15, 41, 66, 0.08), 0 2px 8px -1px rgba(15, 41, 66, 0.04)',
        'premium-hover': '0 10px 30px -4px rgba(15, 41, 66, 0.12), 0 4px 12px -2px rgba(15, 41, 66, 0.06)'
      }
    },
  },
  plugins: [],
}
