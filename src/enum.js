// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _    = require('lodash');
const util = require('util');

module.exports = function(type, lookup) {

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

  } else {
    return {
      _read() {
        const value = this.read(type);
        return _.findKey(lookup, val => val === value);
      },

      _write(key) {
        return this.write(type, lookup[key]);
      },
    };
  }
};
