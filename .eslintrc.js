/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    project: "./tsconfig.json"
  },
  extends: ["next/core-web-vitals", "next/typescript"],
  rules: {
    "@next/next/no-img-element": "off",
    "react/jsx-props-no-spreading": "off",
    "react/no-unescaped-entities": "off"
  }
};

