module.exports = {
  jscodeshiftScripts: [
    '../js-codemod/transforms/arrow-function-arguments.js',
    '../js-codemod/transforms/object-shorthand.js',
    '../js-codemod/transforms/arrow-function.js',
    '../js-codemod/transforms/outline-require.js',
    '../js-codemod/transforms/trailing-commas.js',
    '../js-codemod/transforms/expect.js',
    '../js-codemod/transforms/rm-copyProperties.js',
    '../js-codemod/transforms/unchain-variables.js',
    '../js-codemod/transforms/rm-merge.js',
    '../js-codemod/transforms/rm-object-assign.js',
    '../js-codemod/transforms/unquote-properties.js',
    '../js-codemod/transforms/invalid-requires.js',
    '../js-codemod/transforms/no-reassign-params.js',
    '../js-codemod/transforms/updated-computed-props.js',
    '../js-codemod/transforms/no-vars.js',
    '../js-codemod/transforms/template-literals.js',
  ]
};
 
// removing rm-requires because it will ruin your day
// see https://github.com/cpojer/js-codemod/pull/86/files
// '../js-codemod/transforms/rm-requires.js',
