module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/node_modules/**/*",
  ],
  plugins: [
    "@typescript-eslint",
  ],
  rules: {
    "quotes": ["error", "single"],
    "no-unused-vars": "off", // TypeScript handles this
  },
};
