const _ = require('lodash');
const util = require('util');

module.exports = (type, lookup) => {
  if (util.isArray(lookup)) {
    return {
      _read() {
        const index = this.read(type);
        return lookup[index];
      },

      _write(value) {
        return this.write(type, lookup.indexOf(value));
      },
    };
  }
  return {
    _read() {
      const value = this.read(type);
      return _.findKey(lookup, (val) => val === value);
    },

    _write(key) {
      return this.write(type, lookup[key]);
    },
  };
};
