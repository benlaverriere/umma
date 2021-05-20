module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "promise"],
  extends: [
    "standard-with-typescript",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
    "plugin:promise/recommended",
  ],
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    "@typescript-eslint/strict-boolean-expressions": [
      "error",
      { allowNullableObject: true },
    ],
  },
};
