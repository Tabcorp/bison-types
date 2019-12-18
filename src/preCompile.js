/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _           = require('lodash');
const commonTypes = require('./types');
const typeHelper  = require('./type-helper');

module.exports = function(types) {

  const allTypes = _.extend({}, commonTypes, types);
  return {
    types: allTypes,
    definitions: _.reduce(allTypes, (result, val, type) => {
      getTypeDefinition(type, allTypes, result);
      return result;
    }
    ,{})
  };
};

var getTypeDefinition = function(type, allTypes, result) {
  result[type] = typeHelper.getTypeInfo(type, allTypes);
  const {
    value
  } = result[type];
  if (typeof value === 'string') {
    getTypeDefinition(value, allTypes, result);
  }
  return result;
};