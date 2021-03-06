module.exports = {
  parserOptions: {
    "sourceType": "module",
  },
  env: {
    browser: true,
    es6: true,
    'jest/globals': true,
  },
  globals: {
    miqAjaxButton: true,
    miqSparkleOff: true,
    miqSparkleOn: true,
    add_flash: true,
  },
  extends: ['airbnb', 'plugin:jest/recommended'],
  plugins: ['jest', 'react'],
  rules: {
    "react/jsx-filename-extension": "off",
    "max-len": ["error", {
      code: 150,
      ignoreComments: true
    }],
    "no-use-before-define": ["error", { "functions": false, "classes": false }],
    "no-underscore-dangle": "off",
    "import/prefer-default-export": "off"
  },
};
