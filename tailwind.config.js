const colors = require("tailwindcss/colors");

module.exports = {
  prefix: "tw-",
  content: ["./src/**/*.{html,ts}", "./jslib/components/src/**/*.{html,ts}"],
  safelist: [],
  corePlugins: { preflight: false },
  theme: {
    colors: {
      transparent: colors.transparent,
      current: colors.current,
      white: colors.white,
      primary: {
        300: "var(--color-primary-300)",
        500: "var(--color-primary-500)",
        700: "var(--color-primary-700)",
      },
      secondary: {
        200: "var(--color-secondary-200)",
        300: "var(--color-secondary-300)",
        500: "var(--color-secondary-500)",
        700: "var(--color-secondary-700)",
        900: "var(--color-secondary-900)",
      },
      success: "--color-success",
      danger: "--color-danger",
      warning: "--color-warning",
      info: "--color-info",

      "text-body": "--color-text-body",
      "text-muted": "--color-text-muted",
      "text-black50": "--color-text-black50",
      "text-white50": "--color-text-white50",
    },
  },
  plugins: [],
};
