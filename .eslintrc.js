module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "promise", "functional"],
  extends: [
    "standard-with-typescript",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
    "plugin:promise/recommended",
    "plugin:functional/all",
  ],
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    "@typescript-eslint/strict-boolean-expressions": [
      "error",
      { allowNullableObject: true },
    ],
    "functional/no-expression-statement": [
      "error",
      { ignorePattern: "^console" },
    ],
    "functional/immutable-data": ["error", { IgnorePattern: "^process" }],
  },
};
