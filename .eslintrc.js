module.exports = {
  "plugins": [
    "mocha"
  ],
  "rules": {
    "consistent-return": "off",
    "max-len": "off"
  },
  "overrides": [
    {
      "files": [
        "test/**/*.js"
      ],
      "env": {
        "mocha": true
      },
      "rules": {
        "no-undef": "off",
        "import/no-dynamic-require": "off",
        "no-unused-expressions": "off",
        "import/no-extraneous-dependencies": "off",
        "global-require": "off"
      }
    }
  ]
}
