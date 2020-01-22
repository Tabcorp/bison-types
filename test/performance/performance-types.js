const preCompile = require(`${SRC}/preCompile`);

module.exports = preCompile({
  'complex-type': [
    { a: 'uint8' },
    { b: 'uint16' },
    { c: 'uint32' },
    { d: 'uint64' },
    { e: 'string-with-length' },
    { arraySize: 'uint8' },
    { array: 'another-type[arraySize]' },
  ],

  'string-with-length': {
    _read() { return this.read(`utf-8(${this.buffer.getUInt8()})`); },

    _write(val) {
      this.write('uint8', val.length);
      return this.write('utf-8', val);
    },
  },

  'another-type': [
    { f: 'utf-8(5)' },
    { g: 'uint8=2' },
    { h: 'uint8=3' },
    { i: 'something-else' },
  ],

  'something-else': [
    { j: 'uint8' },
    { k: 'uint16' },
    { l: 'uint32' },
    { m: 'uint64' },
    { n: 'uint8' },
  ],
});
