/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  rules: {
    "@next/next/no-img-element": "off",
    "react/jsx-props-no-spreading": "off",
    "react/no-unescaped-entities": "off"
  }
};

