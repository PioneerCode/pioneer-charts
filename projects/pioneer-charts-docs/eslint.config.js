// @ts-check
import { defineConfig } from "eslint/config";
import rootConfig from "../../eslint.config.js";

export default defineConfig([
  ...rootConfig,
  {
    files: ["**/*.ts"],
    rules: {
      // The docs app uses two prefixes: `app-` for its own layout/chrome components and `pc-` for
      // the one-per-route page components.
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: ["app", "pc"],
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: ["app", "pc"],
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
