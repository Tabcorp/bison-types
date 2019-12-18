/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const should       = require('should');
const enumeration  = require(`${SRC}/enum`);
const preCompile   = require(`${SRC}/preCompile`);
const Reader       = require(`${SRC}/reader`);
const Writer       = require(`${SRC}/writer`);

describe('Bison enum', function() {

  describe('arrays', function() {

    const levels = [ 'admin', 'reader', 'writer' ];

    const types = preCompile({
      'level': enumeration('uint8', levels),
      'level16': enumeration('uint16', levels)
    });

    it('should encode the enum as its index', function() {
      const writer = new Writer(emptyBuffer(), types);
      writer.write('level', 'reader');
      return writer.rawBuffer().should.eql(new Buffer([ 0x01, 0x00, 0x00, 0x00 ]));
  });

    it('should decode the index as the enum value', function() {
      const buf = new Buffer([ 0x02, 0x00, 0x00, 0x00 ]);
      const reader = new Reader(buf, types);
      return reader.read('level').should.eql('writer');
    });

    it('can encode to any given type', function() {
      const writer = new Writer(emptyBuffer(), types, {bigEndian: true});
      writer.write('level16', 'reader');
      return writer.rawBuffer().should.eql(new Buffer([ 0x00, 0x01, 0x00, 0x00 ]));
  });

    return it('can decode from any given type', function() {
      const buf = new Buffer([ 0x00, 0x02, 0x00, 0x00 ]);
      const reader = new Reader(buf, types, {bigEndian: true});
      return reader.read('level16').should.eql('writer');
    });
  });

  return describe('objects', function() {

    const levels = {
      'admin': 0xaa11,
      'reader': 0xbb22,
      'writer': 0xcc33
    };

    const types = preCompile({
      'level': enumeration('uint16', levels)});

    it('should encode the enum as the object value', function() {
      const writer = new Writer(emptyBuffer(), types);
      writer.write('level', 'reader');
      return writer.rawBuffer().should.eql(new Buffer([ 0x22, 0xbb, 0x00, 0x00 ]));
  });

    return it('should decode the index as the object key', function() {
      const buf = new Buffer([ 0x33, 0xcc, 0x00, 0x00 ]);
      const reader = new Reader(buf, types);
      return reader.read('level').should.eql('writer');
    });
  });
});


var emptyBuffer = function() {
  const buf = new Buffer(4);
  buf.fill(0);
  return buf;
};
