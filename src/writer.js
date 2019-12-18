/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _                       = require('lodash');
const { CleverBufferWriter }  = require('clever-buffer');
const preCompile              = require('./preCompile');
const typeHelper              = require('./type-helper');



class Writer {

  constructor(buffer, typeSet, options) {
    this.processObject = this.processObject.bind(this);
    this.typeSet = typeSet;
    if (options == null) { options = {}; }
    this.buffer = new CleverBufferWriter(buffer, options);
    if (!this.typeSet) {
      this.typeSet = preCompile({});
    }
  }

  processObject(definition, valueToWrite, parameter) {
    if (definition.hasOwnProperty('_write')) { return definition._write.apply(this, [valueToWrite, parameter]); }
    return _.each(definition, value => {
      const key = Object.keys(value)[0];
      try {
        return this.write(value[key], valueToWrite[key], parameter, valueToWrite);
      } catch (err) {
        throw new Error(`'${key}': ${err.message}`);
      }
    });
  }

  write(typeName, valueToWrite, parameter, result) {

    if (result == null) { result = {}; }
    let type = this.typeSet.definitions[typeName];
    if (!type) {
      type = (this.typeSet.definitions[typeName] = typeHelper.getTypeInfo(typeName, this.typeSet.types));
    }

    if (type.isFunction) { parameter = typeHelper.getParameterFromResult(type.parameter, result); }
    if (type.isOverride) { valueToWrite = typeHelper.getParameterFromResult(type.overrideValue, result); }

    switch (typeof type.value) {
      case 'undefined':
        throw new Error(`${type.name} isn't a valid type`);
      case 'string':
        return this.write(type.value, valueToWrite, parameter, result);
      case 'function':
        return type.value.apply(this, [parameter]);
      case 'object':
        if (type.isArray) {
          return _.each(__range__(0, Math.floor(typeHelper.getParameterFromResult(type.arraySize, result)), false), (value, key) => {
            return this.processObject(type.value, valueToWrite[key], parameter);
          });
        } else {
          return this.processObject(type.value, valueToWrite, parameter);
        }
    }
  }

  rawBuffer() {
    return this.buffer.buffer;
  }
}

module.exports = Writer;

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}