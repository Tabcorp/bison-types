/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _                       = require('lodash');
const { CleverBufferReader }  = require('clever-buffer');
const preCompile              = require('./preCompile');
const typeHelper              = require('./type-helper');



class Reader {

  constructor(buffer, typeSet, options) {
    this.processObject = this.processObject.bind(this);
    this.typeSet = typeSet;
    if (options == null) { options = {}; }
    this.buffer = new CleverBufferReader(buffer, options);
    if (!this.typeSet) {
      this.typeSet = preCompile({});
    }
  }

  processObject(object, parameter) {
    if (object.hasOwnProperty('_read')) { return object._read.apply(this, [parameter]); }
    return _.reduce(object, ((res, value) => {
      const key = Object.keys(value)[0];
      res[key] = this.read(value[key], parameter, res);
      return res;
    }) , {});
  }

  read(typeName, parameter, result) {

    if (result == null) { result = {}; }
    let type = this.typeSet.definitions[typeName];
    if (!type) {
      type = (this.typeSet.definitions[typeName] = typeHelper.getTypeInfo(typeName, this.typeSet.types));
    }

    if (type.isFunction) { parameter = typeHelper.getParameterFromResult(type.parameter, result); }

    switch (typeof type.value) {
      case 'undefined':
        throw new Error(`${type.name} isn't a valid type`);
      case 'string':
        return this.read(type.value, parameter);
      case 'function':
        return type.value.apply(this, [parameter]);
      case 'object':
        if (type.isArray) {
          return _.map(__range__(0, Math.floor(typeHelper.getParameterFromResult(type.arraySize, result)), false), () => {
            return this.processObject(type.value, parameter);
          });
        } else {
          return this.processObject(type.value, parameter);
        }
    }
  }
}

module.exports = Reader;
function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}