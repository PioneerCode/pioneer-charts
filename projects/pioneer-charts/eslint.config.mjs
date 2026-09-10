// @ts-check
import { defineConfig } from "eslint/config";
import rootConfig from "../../eslint.config.js";

export default defineConfig([
  ...rootConfig,
  {
    files: ["**/*.ts"],
    rules: {
      // Everything the library exports is `pcac-` prefixed. This is the published API surface, so
      // a stray prefix would ship to consumers - hence `error`, not a style preference.
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "pcac",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "pcac",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    rules: {},
  }
]);
