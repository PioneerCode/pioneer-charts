// @ts-check
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";

/**
 * Shared base config. Each project extends this and adds its own selector prefixes
 * (see each project's own eslint config), which is the rule that actually earns its keep here:
 * component selectors are published API surface.
 *
 * Deliberately NOT extended: `tseslint.configs.stylistic` (it wants the explicit types stripped
 * off the config classes in `*.model.ts`, where they're self-documenting public API) and the
 * `*TypeChecked` presets (tsconfig.json is already strict, with `strictTemplates` on top, so they
 * mostly duplicate the compiler at a large cost in lint time).
 */
export default defineConfig([
  {
    ignores: ["dist/**", "coverage/**"],
  },
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // D3's own typings hand back `any` in enough places (arc/pie generics, the `nodes` argument
      // of a selection callback) that the alternative to `any` here is a cast, not a real type.
      "@typescript-eslint/no-explicit-any": "off",

      // D3 callbacks are positional - `(d, i, nodes)` - so reaching the argument you need often
      // means naming ones you don't. Underscore-prefixed names opt out.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Builders alias `this` as `self` so D3's `function () { ... }` handlers - which need their
      // own `this` to be the DOM node - can still reach the builder instance.
      "@typescript-eslint/no-this-alias": [
        "error",
        { allowedNames: ["self"] },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  },
]);
