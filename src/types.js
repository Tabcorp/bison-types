// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = {
  uint8: {
    _read() { return this.buffer.getUInt8(); },
    _write(val) { return this.buffer.writeUInt8(val); },
  },

  uint16: {
    _read() { return this.buffer.getUInt16(); },
    _write(val) { return this.buffer.writeUInt16(val); },
  },

  uint32: {
    _read() { return this.buffer.getUInt32(); },
    _write(val) { return this.buffer.writeUInt32(val); },
  },

  uint64: {
    _read() { return this.buffer.getUInt64(); },
    _write(val) { return this.buffer.writeUInt64(val); },
  },

  int8: {
    _read() { return this.buffer.getInt8(); },
    _write(val) { return this.buffer.writeInt8(val); },
  },

  int16: {
    _read() { return this.buffer.getInt16(); },
    _write(val) { return this.buffer.writeInt16(val); },
  },

  int32: {
    _read() { return this.buffer.getInt32(); },
    _write(val) { return this.buffer.writeInt32(val); },
  },

  int64: {
    _read() { return this.buffer.getInt64(); },
    _write(val) { return this.buffer.writeInt64(val); },
  },

  latin1: {
    _read(length) { return this.buffer.getString({ length, encoding: 'binary' }); },
    _write(val) { return this.buffer.writeString(val, { encoding: 'binary' }); },
  },

  'utf-8': {
    _read(length) { return this.buffer.getString({length}); },

    _write(val, length) {
      let count = this.buffer.writeString(val, {length});
      while (count < length) {
        this.buffer.writeUInt8(0x00);
        count++;
      }
      return length;
    },
  },

  bool: {
    _read() { if (this.buffer.getUInt8()) { return true; } else { return false; } },
    _write(val) { return this.buffer.writeUInt8(val ? 1 : 0); },
  },

  skip: {
    _read(len) { return this.buffer.skip(len); },
    _write(val, len) { return this.buffer.skip(len); },
  },

  bytes: {
    _read(length) { return this.buffer.getBytes({length}); },
    _write(val, length) { return this.buffer.writeBytes(val, {length}); },
  },
};
