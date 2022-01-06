function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

module.exports = {
  prefix: "tw-",
  content: ["./src/**/*.{html,ts}"],
  safelist: [
    {
      pattern: /tw-(border|bg)-(primary|secondary)/,
    },
    {
      pattern: /tw-text-(primary|secondary)-btn-text/,
    },
    {
      pattern: /tw-bg-(primary|secondary)/,
      variants: ["hover"],
    },
  ],
  theme: {
    colors: {
      primary: withOpacityValue("--color-primary"),
      "primary-btn-hover": "var(--color-primary-btn-hover)",
      "primary-btn-text": "var(--color-primary-btn-text)",
      secondary: withOpacityValue("--color-secondary"),
      "secondary-btn-hover": "var(--color-secondary-btn-hover)",
      "secondary-btn-text": "var(--color-secondary-btn-text)",
      success: withOpacityValue("--color-success"),
      danger: withOpacityValue("--color-danger"),
      warning: withOpacityValue("--color-warning"),
      info: withOpacityValue("--color-info"),

      "text-body": withOpacityValue("--color-text-body"),
      "text-muted": withOpacityValue("--color-text-muted"),
      "text-black50": withOpacityValue("--color-text-black50"),
      "text-white50": withOpacityValue("--color-text-white50"),
    },
  },
  plugins: [],
};
