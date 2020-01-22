/* eslint-disable no-plusplus */
/* eslint-disable no-console */
should = require('should');
const Table = require('cli-table');

const types = require('./performance-types');

const Writer = require(`${SRC}/writer`);
const Reader = require(`${SRC}/reader`);

const jsonMessage = () => ({
  a: 123,
  b: 12345,
  c: 123456,
  d: '4294967366',
  e: 'hello world',
  arraySize: 1,
  array: [{
    f: 'hello',
    g: 2,
    h: 3,

    i: {
      j: 123,
      k: 65535,
      l: 123456789,
      m: '4294967366',
      n: 1,
    },
  }],
});

const binaryMessage = () => Buffer.from([
  0x7b,
  0x39,
  0x30,
  0x40,
  0xe2,
  0x01,
  0x00,
  0x46,
  0x00,
  0x00,
  0x00,
  0x01,
  0x00,
  0x00,
  0x00,
  0x0b,
  0x68,
  0x65,
  0x6c,
  0x6c,
  0x6f,
  0x20,
  0x77,
  0x6f,
  0x72,
  0x6c,
  0x64,
  0x01,
  0x68,
  0x65,
  0x6c,
  0x6c,
  0x6f,
  0x02,
  0x03,
  0x7b,
  0x55,
  0xf8,
  0x15,
  0xcd,
  0x5b,
  0x07,
  0x46,
  0x00,
  0x00,
  0x00,
  0x01,
  0x00,
  0x00,
  0x00,
  0x01,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
]);

const write = (count, table) => {
  const json = jsonMessage();
  const buf = Buffer.alloc(64);
  buf.fill(0);
  const start = new Date();
  for (let i = 0, end1 = count, asc = end1 >= 0; asc ? i < end1 : i > end1; asc ? i++ : i--) {
    const writer = new Writer(buf, types);
    writer.write('complex-type', json);
  }
  const end = new Date();
  return table.push([`Write ${count}`, end - start]);
};

const read = (count, table) => {
  const binary = binaryMessage();
  const start = new Date();
  for (let i = 0, end1 = count, asc = end1 >= 0; asc ? i < end1 : i > end1; asc ? i++ : i--) {
    const reader = new Reader(binary, types);
    reader.read('complex-type');
  }
  const end = new Date();
  return table.push([`Read ${count}`, end - start]);
};

describe('Performance', () => it('prints performance figures', () => {
  const table = new Table({
    head: ['Operation', 'time (ms)'],
    colWidths: [20, 20],
  });
  read(10000, table);
  write(10000, table);
  console.log('');
  console.log(table.toString());
}));
