const { spacing } = require("tailwindcss/defaultTheme");

module.exports = {
  theme: {
    extend: {
      spacing: {
        gutter: spacing[6],
      },
      boxShadow: {
        asc: "inset 0 2px 0 0 rgb(7, 125, 108)",
        desc: "inset 0 -2px 0 0 rgb(7, 125, 108)",
      },
      height: {
        table: "34rem",
        modal: "calc(100% - 3rem)",
      },
      maxHeight: {
        a4: "1024px",
      },
      width: {
        "3/10": "30%",
      },
      maxWidth: {
        modal: "calc(100% - 3rem)",
        "modal-sm": "640px",
        "modal-md": "768px",
        "modal-lg": "1024px",
        "modal-xl": "1280px",
      },
    },
    colors: {
      primary: "#097d6c",
      sarcelle: {
        dark: "#075b4f",
        surprise: "#0cb097",
        atmos: "#87dfd3",
        light: "#d0f3ee",
        lightest: "#eefaf8",
      },
      zambezi: "#605f5f",
      brand: "#e00000",
      black: "#000000",
      secondary: "#EF4123",
      white: "#fff",
      "white-75": "rgba(255,255,255,0.75)",
      gray: {
        min: "#0000001a",
        100: "#f8f9fa",
        200: "#e9ecef",
        300: "#dee2e6",
        400: "#ced4da",
        500: "#adb5bd",
        600: "#868e96",
        700: "#5A5A5A",
        800: "#343a40",
        900: "#212529",
        sky: "#f4f6f8",
        ink: "#637381",
      },
      blue: "#0296c0",
      info: "#0296c0",
      green: "#0da566",
      success: "#0da566",
      yellow: "#fecc03",
      warning: "#fecc03",
      red: "#ff3200",
      danger: "#ff3200",
    },
    fontFamily: {
      sans: ["Nunito Sans", "sans-serif"],
      "open-sans": ["Open Sans", "sans-serif"],
    },
    fontSize: {
      xs: ".75rem",
      sm: ".875rem",
      "sm-up": ".975rem",
      tiny: ".875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "4rem",
      "7xl": "5rem",
      "8xl": "6rem",
      "9xl": "7rem",
      "10xl": "8rem",
      "11xl": "9rem",
      "12xl": "10rem",
    },
    minHeight: {
      0: "0",
      "1/4": "25%",
      "1/2": "50%",
      "3/4": "75%",
      full: "100%",
      m: " 200",
    },
    borderWidth: {
      1: "1px",
      0: "0",
      2: "2px",
      3: "3px",
      4: "4px",
      6: "6px",
      8: "8px",
    },
  },
  variants: {
    visibility: ["responsive", "hover", "focus"],
    textColor: ["responsive", "hover", "focus", "group-hover"],
    borderStyle: ["hover", "focus"],
  },
  plugins: [
    function ({ addUtilities }) {
      const transition = {
        ".transition-3s": {
          transition: "0.3s",
        },
      };
      addUtilities(transition);
    },
  ],
};
