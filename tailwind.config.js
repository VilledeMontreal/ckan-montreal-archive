const { spacing } = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
      spacing: {
        gutter: spacing[6]
      }
    },
    colors: {
      primary: '#097d6c',
      sarcelle: {
        dark: '#075b4f',
        surprise: '#0cb097',
        atmos: '#87dfd3',
        light: '#d0f3ee',
        lightest: '#eefaf8'
      
      },
      brand: '#e00000',
      black: '#000000',
      secondary: '#EF4123',
      white: '#fff',
      'white-75': 'rgba(255,255,255,0.75)',
      gray: {
        '100': '#f8f9fa',
        '200': '#e9ecef',
        '300': '#dee2e6',
        '400': '#ced4da',
        '500': '#adb5bd',
        '600': '#868e96',
        '700': '#495057',
        '800': '#343a40',
        '900': '#212529',
        'sky': '#f4f6f8',
        'ink': '#637381',
      },
      blue: '#0296c0',
      info: '#0296c0',
      green: '#0da566',
      success: '#0da566',
      yellow: '#fecc03',
      warning: '#fecc03',
      red: '#ff3200',
      danger: '#ff3200'
    },
    fontFamily: {
      'sans': ['Poppins', 'sans-serif']
    }
  }
}
