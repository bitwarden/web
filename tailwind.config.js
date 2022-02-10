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
      success: {
        300: "var(--color-success-300)",
        500: "var(--color-success-500)",
        700: "var(--color-success-700)",
      },
      danger: {
        300: "var(--color-danger-300)",
        500: "var(--color-danger-500)",
        700: "var(--color-danger-700)",
      },
      warning: {
        300: "var(--color-warning-300)",
        500: "var(--color-warning-500)",
        700: "var(--color-warning-700)",
      },
      info: {
        300: "var(--color-info-300)",
        500: "var(--color-info-500)",
        700: "var(--color-info-700)",
      },

      "text-body": "--color-text-body",
      "text-muted": "--color-text-muted",
      "text-black50": "--color-text-black50",
      "text-white50": "--color-text-white50",
    },
  },
  plugins: [],
};
