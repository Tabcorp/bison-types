require('should');

const enumeration = require(`${SRC}/enum`);
const preCompile = require(`${SRC}/preCompile`);
const Reader = require(`${SRC}/reader`);
const Writer = require(`${SRC}/writer`);

const emptyBuffer = () => {
  const buf = Buffer.alloc(4);
  buf.fill(0);
  return buf;
};

describe('Bison enum', () => {
  describe('arrays', () => {
    const levels = ['admin', 'reader', 'writer'];

    const types = preCompile({
      level: enumeration('uint8', levels),
      level16: enumeration('uint16', levels),
    });

    it('should encode the enum as its index', () => {
      const writer = new Writer(emptyBuffer(), types);
      writer.write('level', 'reader');
      writer.rawBuffer().should.eql(Buffer.from([0x01, 0x00, 0x00, 0x00]));
    });

    it('should decode the index as the enum value', () => {
      const buf = Buffer.from([0x02, 0x00, 0x00, 0x00]);
      const reader = new Reader(buf, types);
      reader.read('level').should.eql('writer');
    });

    it('can encode to any given type', () => {
      const writer = new Writer(emptyBuffer(), types, { bigEndian: true });
      writer.write('level16', 'reader');
      writer.rawBuffer().should.eql(Buffer.from([0x00, 0x01, 0x00, 0x00]));
    });

    it('can decode from any given type', () => {
      const buf = Buffer.from([0x00, 0x02, 0x00, 0x00]);
      const reader = new Reader(buf, types, { bigEndian: true });
      reader.read('level16').should.eql('writer');
    });
  });

  describe('objects', () => {
    const levels = {
      admin: 0xaa11,
      reader: 0xbb22,
      writer: 0xcc33,
    };

    const types = preCompile({
      level: enumeration('uint16', levels),
    });

    it('should encode the enum as the object value', () => {
      const writer = new Writer(emptyBuffer(), types);
      writer.write('level', 'reader');
      writer.rawBuffer().should.eql(Buffer.from([0x22, 0xbb, 0x00, 0x00]));
    });

    it('should decode the index as the object key', () => {
      const buf = Buffer.from([0x33, 0xcc, 0x00, 0x00]);
      const reader = new Reader(buf, types);
      reader.read('level').should.eql('writer');
    });
  });
});
