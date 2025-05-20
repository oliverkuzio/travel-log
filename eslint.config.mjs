import antfu from "@antfu/eslint-config";

// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  antfu(
    {
      type: "dashboard",
      vue: true,
      typescript: true,
      formatters: true,
      stylistic: {
        indent: 2,
        semi: true,
        quotes: "double",
      },
      ignores: [
        "drizzle/**",
      ],
    },
    {
      rules: {
        "antfu/no-top-level-await": ["off"],
        "no-console": ["warn"],
        "node/prefer-global/process": ["off"],
        "node/no-process-env": ["error"],
        "perfectionist/sort-imports": [
          "error",
          {
            tsconfigRootDir: "./",
          },
        ],
        "ts/consistent-type-definitions": ["error", "type"],
        "ts/no-redeclare": "off",
        "unicorn/filename-case": [
          "error",
          {
            case: "kebabCase",
            ignore: ["README.md"],
          },
        ],
        "vue/max-attributes-per-line": [
          "error",
          {
            singleline: {
              max: 2,
            },
            multiline: {
              max: 1,
            },
          },
        ],
      },
    },
  ),
);
