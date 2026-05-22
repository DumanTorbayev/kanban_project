export default {
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["**/coverage/**"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "tailwind",
          "apply",
          "theme",
          "source",
          "utility",
          "variant",
          "custom-variant",
        ],
      },
    ],
    "at-rule-empty-line-before": null,
    "hue-degree-notation": null,
    "import-notation": null,
    "lightness-notation": null,
    "rule-empty-line-before": null,
  },
};
