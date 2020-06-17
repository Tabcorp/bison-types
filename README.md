# bison-types

![logo](bison-types.png)

[![NPM](http://img.shields.io/npm/v/bison-types.svg?style=flat)](https://npmjs.org/package/bison-types)
[![License](http://img.shields.io/npm/l/bison-types.svg?style=flat)](https://github.com/Tabcorp/bison-types)

[![Build Status](http://img.shields.io/travis/Tabcorp/bison-types.svg?style=flat)](http://travis-ci.org/Tabcorp/bison-types)
[![Dependencies](http://img.shields.io/david/Tabcorp/bison-types.svg?style=flat)](https://david-dm.org/Tabcorp/bison-types)
[![Dev dependencies](http://img.shields.io/david/dev/Tabcorp/bison-types.svg?style=flat)](https://david-dm.org/Tabcorp/bison-types)

- Are you stuck with integrating with a system that only speaks binary?
- Are you sick of manually decoding and encoding from json to binary?
- Do you want an easy way to define your types in javascript?

If you answered yes to any of the above questions, then `bison-types` is for you

## How does it work?

`bison-types` allows you to define custom types.
With these custom types you can build up a message definition
Pass these types and the buffer to bison-types and it will do the rest.

*For example:*

```js
var bison = require('bison-types');

var types = bison.preCompile({
  'timeline': [
    { count: 'uint16' },
    { messages: 'message[count]' }
  ],
  'message': [
    { id: 'uint8' },
    { timestamp: 'uint16' },
    { length: 'uint16' },
    { text: 'utf-8(length)' }
  ]
});

// time to read!

var buf = Buffer.from([0x04, 0x92, 0x04, 0x3b, 0xf4, 0x2c]);
var reader = new bison.Reader(buf, types, { bigEndian: false });
var json = reader.read('timeline');

// or write !

var buf = Buffer.alloc(1024);
var writer = new bison.Writer(buf, types, { bigEndian: false });

writer.write('timeline', {
  count: 1,
  messages: [
    {
      id: 3,
      date: new Date().getTime(),
      length: 11,
      text: 'hello world'
    }
  ]
});

```

*Note:*  bison-types uses [clever-buffer](https://github.com/Tabcorp/clever-buffer) under the hood for all buffer manipulation.


## Provided types

The following types can be declared as a string, for example: `{timestamp: 'uint16'}`.

* `uint8`  - unsigned 8 bit integer
* `uint16` - unsigned 16 bit integer
* `uint32` - unsigned 32 bit integer
* `uint64` - unsigned 64 bit integer
* `int8`   - signed 8 bit integer
* `int16`  - signed 16 bit integer
* `int32`  - signed 32 bit integer
* `int64`  - signed 64 bit integer
* `utf-8`  - utf-8 encoded string
* `latin1` - latin1 encoded string
* `bool`   - boolean (stored as 8 bit integer)
* `skip`   - will skip specified bytes

There is also an `enumeration` type, which can be used to represent enums from arrays of objects:

```js
 will store the index in the array
var levelIndex = bison.enumeration('uint8', ['admin', 'reader', 'writer']);

// will store the value in the object
var levelCode = bison.enumeration('uint16', {
  'admin': 0xb8a3,
  'reader': 0xb90a,
  'writer': 0xf23c
});

bison.preCompile({
  'levelIndex': levelIndex,
  'levelCode': levelCode,
  'user': [
    { id: 'uint8' },
    { levelX: levelIndex },
    { levelY: levelCode }
  ]
});
```

## Creating your own custom types

There are 2 different ways that you can define a custom type

### By mapping it to another type
```js
var types = bison.preCompile({
  'my-other-type': [
    { a: 'uint8' },
    { b: 'uint16' }
  ],
  'my-type': [
    { c: 'my-other-type' },
    { d: 'uint8' }
  ]
});
```
would create an object like

```js
var myType = {c: {a: 12, b: 123}, d: 1234}
```

### By explicitly creating a _read function

We expose the underlying [clever-buffer](https://github.com/Tabcorp/clever-buffer) as @buffer.

You can call any of its methods

```js
var types = bison.preCompile({
  multiply: {
    _read: function(multiplier) {
      return this.buffer.getUint8() * multiplier;
    },
    _write: function(val, multiplier) {
      return this.buffer.writeUInt8(val * multiplier);
    }
  }
});
```
would multiply the value read from the buffer before returning it when reading
and multiply the value to be written when writing

## Reader

You need to pass in a buffer to read from, and any custom types that you may have. 

You can also pass in options, look at [clever-buffer](https://github.com/Tabcorp/clever-buffer) for a full list of options

### Reading some integers
```js
var bison = require('bison-types');
var buf = Buffer.from([0x01, 0x02, 0x03, 0x04]);
var types = bison.preCompile({
  'my-type': [
    { a: 'uint8' },
    { b: 'uint8' },
    { c: 'uint8' },
    { d: 'uint8' }
  ]
});

var reader = new bison.Reader(buf, types, { bigEndian: false });
var myType = reader.read('my-type');
```

### Reading a string
```js
var bison = require('bison-types');
var buf = Buffer.from([0x48, 0x45, 0x4C, 0x4C, 0x4F]);
var types = bison.preCompile({
  'my-type': [
    { a: 'utf-8(5)' }
  ]
});

var reader = new bison.Reader(buf, types, { bigEndian: false });
var myType = reader.read('my-type');
```

### Reading a string with latin1 encoding
```js
var bison = require('bison-types');
var buf = Buffer.from([0x48, 0xC9, 0x4C, 0x4C, 0x4F]);
var types = bison.preCompile({
  'my-type': [
    { a: 'latin1(5)' }
  ]
});

var reader = new bison.Reader(buf, types, { bigEndian: false });
var myType = reader.read('my-type');
```

### Reading a multi-byte string
```js
var bison = require('bison-types');
var buf = Buffer.from([0x48, 0xC3, 0x89, 0x4C, 0x4C, 0x4F]);
var types = bison.preCompile({
  'my-type': [
    { a: 'utf-8(6)' }
  ]
});

var reader = new bison.Reader(buf, types, { bigEndian: false });
var myType = reader.read('my-type');
// myType = { a: 'HÉLLO' }
```

### Complex types
The power of bison-types is evident as you define more complex types
```js
var bison = require('bison-types');
var buf = Buffer.from([0x01, 0x03, 0x04]);
var types = bison.preCompile({
  'my-type': [
    { a: 'uint8' },
    { b: 'my-other-type' }
  ],
  'my-other-type': [
    { c: 'uint8' },
    { d: 'uint8' }
  ]
});

var reader = new bison.Reader(buf, types, { bigEndian: false });
var myType = reader.read('my-type');
```

### Using previous values as parameters
You can use previously resolved values as parameters to types
The power of bison-types is evident as you define more complex types
```js
var bison = require('bison-types');
var buf = Buffer.from([0x04, 0x02]);
var types = bison.preCompile({
  mult: {
    _read: function(val) {
      return this.buffer.getUInt8() * val;
    }
  },
  'my-type': [
    { a: 'uint8' },
    { b: 'mult(a)' }
  ]
});

var reader = new bison.Reader(buf, types, { bigEndian: false });
var myType = reader.read('my-type');
```
### Arrays
You can specify arrays in a similar matter

```js
var bison = require('bison-types');
var buf = Buffer.from([0x03, 0x01, 0x02, 0x03]);
var types = bison.preCompile({
  object: [
    { c: 'uint8' }
  ],
  'my-type': [
    { a: 'uint8' },
    { b: 'object[a]' }
  ]
});

var reader = new bison.Reader(buf, types, { bigEndian: false });
var myType = reader.read('my-type');
// myType = { a: 3, b:[{c:1},{c:2},{c:3}] }
```

## Writer

You need to pass in a buffer to write to, and any custom types that you may have. 

You can also pass in options, look at [clever-buffer](https://github.com/Tabcorp/clever-buffer) for a full list of options

### Writing some integers
```js
var bison = require('bison-types');
var buf = Buffer.alloc(4);
var types = bison.preCompile({
  'my-type': [
    { a: 'uint8' },
    { b: 'uint8' },
    { c: 'uint8' },
    { d: 'uint8' }
  ]
});

var writer = new bison.Writer(buf, types, { bigEndian: false });
writer.write('my-type', { a: 1, b: 2, c: 3, d: 4 });
// buf will equal [ 0x01, 0x02, 0x03, 0x04 ]
```

### Writing a string
```js
var bison = require('bison-types');
var buf = Buffer.alloc(5);
var types = bison.preCompile({
  'my-type': [
    { a: 'utf-8' }
  ]
});

var writer = new bison.Writer(buf, types, { bigEndian: false });
writer.write('my-type', { a: 'HELLO' });
// buf will equal [0x48, 0x45, 0x4C, 0x4C, 0x4F]
```

### Writing a string with latin1 encoding
```js
var bison = require('bison-types');
var buf = Buffer.alloc(5);
var types = bison.preCompile({
  'my-type': [
    { a: 'latin1' }
  ]
});

var writer = new bison.Writer(buf, types, { bigEndian: false });
writer.write('my-type', { a: 'HÉLLO' });
// buf will equal [0x48, 0xC9, 0x4C, 0x4C, 0x4F]
```

### Only writing a certain length of string
```js
var bison = require('bison-types');
var buf = Buffer.alloc(10);
var types = bison.preCompile({
  'my-type': [
    { a: 'utf-8(5)' }
  ]
});

var writer = new bison.Writer(buf, types, { bigEndian: false });
writer.write('my-type', { a: 'HELLOWORLD' });
// buf will equal [0x48, 0x45, 0x4C, 0x4C, 0x4F, 0x00, 0x00, 0x00, 0x00, 0x00]
```

### Writing a multi-byte string
```js
var bison = require('bison-types');
var buf = Buffer.alloc(6);
var types = bison.preCompile({
  'my-type': [
    { a: 'utf-8' }
  ]
});

var writer = new bison.Writer(buf, types, { bigEndian: false });
writer.write('my-type', { a: 'HÉLLO' });
// buf will equal [0x48, 0xC3, 0x89, 0x4C, 0x4C, 0x4F]
```

### Complex types
The power of bison-types is evident as you define more complex types
```js
var bison = require('bison-types');
var buf = Buffer.alloc(4);
var types = bison.preCompile({
  'my-type': [
    { a: 'uint8' },
    { b: 'my-other-type' }
  ],
  'my-other-type': [
    { c: 'uint8' },
    { d: 'uint8' }
  ]
});

var writer = new bison.Writer(buf, types, { bigEndian: false });
writer.write('my-type', {
  a: 1,
  b: { c: 3, d: 4 }
});
//  buf will equal [ 0x01, 0x03, 0x04 ]
```

### Using other values as parameters
You can use other values as parameters to types
The power of bison-types is evident as you define more complex types
```js
var bison = require('bison-types');
var buf = Buffer.alloc(2);
var types = bison.preCompile({
  div: {
    _write: function(val, divider) {
      return this.buffer.writeUInt8(val / divider);
    }
  },
  'my-type': [
    { a: 'uint8' },
    { b: 'div(a)' }
  ]
});

var writer = new bison.Writer(buf, types, { bigEndian: false });
writer.write('my-type', { a: 4, b: 8 });
// buf will equal [ 0x04, 0x02 ]
```
### Overriding a value
You can specify a specific value using the following syntax
```js
var bison = require('bison-types');
var buf = Buffer.alloc(2);
var types = bison.preCompile({
  'my-type': [
    { a: 'uint8=1' },
    { b: 'uint8=2' }
  ]
});

var writer = new bison.Writer(buf, types, { bigEndian: false });
writer.write('my-type', {});

// buf will equal [ 0x01, 0x02 ]
```
### Arrays
You can specify arrays in a similar matter

```js
var bison = require('bison-types');
var buf = Buffer.alloc(4);
var types = bison.preCompile({
  object: [
    { c: 'uint8' }
  ],
  'my-type': [
    { a: 'uint8' },
    { b: 'object[a]' }
  ]
});

var writer = new bison.Writer(buf, types, { bigEndian: false });
writer.write('my-type', {
  a: 3,
  b: [
    { c: 1 },
    { c: 2 },
    { c: 3 }
  ]
});

// buf will equal [ 0x03, 0x01, 0x02, 0x03 ]
```
### Using an array length as a parameter
This is a shorthand of the above example

```js
var bison = require('bison-types');
var buf = Buffer.alloc(4);
var types = bison.preCompile({
  object: [
    { c: 'uint8' }
  ],
  'my-type': [
    { a: 'uint8=b.length' },
    { b: 'object[b.length]' }
  ]
});

var writer = new bison.Writer(buf, types, { bigEndian: false });
writer.write('my-type', {
  b: [
    { c: 1 },
    { c: 2 },
    { c: 3 }
  ]
});

// buf will equal [ 0x03, 0x01, 0x02, 0x03 ]
```

## Testing

```
npm test
```
