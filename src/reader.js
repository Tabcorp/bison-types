/* eslint-disable no-multi-assign */
/* eslint-disable no-prototype-builtins */
const _ = require('lodash');
const { CleverBufferReader } = require('clever-buffer');

const preCompile = require('./preCompile');
const typeHelper = require('./type-helper');

class Reader {
  constructor(buffer, typeSet, options) {
    let localOptions = options;
    this.processObject = this.processObject.bind(this);
    this.typeSet = typeSet;
    if (localOptions == null) { localOptions = {}; }
    this.buffer = new CleverBufferReader(buffer, localOptions);
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
    }), {});
  }

  read(typeName, parameter, result) {
    let localParameter = parameter;
    let localResult = result;

    if (localResult == null) { localResult = {}; }
    let type = this.typeSet.definitions[typeName];
    if (!type) {
      type = (this.typeSet.definitions[typeName] = typeHelper.getTypeInfo(typeName, this.typeSet.types));
    }

    if (type.isFunction) { localParameter = typeHelper.getParameterFromResult(type.parameter, localResult); }

    switch (typeof type.value) {
      case 'undefined':
        throw new Error(`${type.name} isn't a valid type`);
      case 'string':
        return this.read(type.value, localParameter);
      case 'function':
        return type.value.apply(this, [localParameter]);
      case 'object':
        if (type.isArray) {
          return _.map(_.range(0, Math.floor(typeHelper.getParameterFromResult(type.arraySize, localResult)), false), () => this.processObject(type.value, localParameter));
        }
        return this.processObject(type.value, localParameter);
      default:
    }
  }
}

module.exports = Reader;
