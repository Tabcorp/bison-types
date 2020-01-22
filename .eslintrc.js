module.exports = {
  plugins: [
    'mocha',
  ],
  extends: ['airbnb-base'],
  rules: {
    'consistent-return': 'off',
    'max-len': 'off',
    'no-underscore-dangle': 0,
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/order': [
      'error',
      {
        'newlines-between': 'always-and-inside-groups',
        groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
      },
    ],
    'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
  },
  env: {
    node: true,
  },
  overrides: [
    {
      files: [
        'test/**/*.js',
      ],
      env: {
        mocha: true,
      },
      rules: {
        'no-undef': 'off',
        'import/no-dynamic-require': 'off',
        'no-unused-expressions': 'off',
        'import/no-extraneous-dependencies': 'off',
        'global-require': 'off',
      },
    },
  ],
};
