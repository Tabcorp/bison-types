should     = require 'should'
sinon      = require 'sinon'
preCompile = require "#{SRC}/preCompile"
Reader     = require "#{SRC}/reader"
typeHelper = require "#{SRC}/type-helper"

describe 'Bison Reader', ->

  beforeEach ->
    sinon.spy typeHelper, 'getTypeInfo'

  afterEach ->
    typeHelper.getTypeInfo.restore()

  it 'should create a reader with a default options', ->
    buf = new Buffer 8
    reader = new Reader buf
    reader.buffer.bigEndian.should.eql false
    reader.buffer.getOffset().should.eql 0
    reader.buffer.noAssert.should.eql true

  it 'should create a reader with a specified offset', ->
    buf = new Buffer 8
    reader = new Reader buf, null, {offset:4}
    reader.buffer.getOffset().should.eql 4

  it 'should create a reader with a specified endian-ness', ->
    buf = new Buffer 8
    reader = new Reader buf, null, {bigEndian:true}
    reader.buffer.bigEndian.should.eql true

  it 'should create a reader with a specified value for noAssert', ->
    buf = new Buffer 8
    reader = new Reader buf, null, {noAssert:false}
    reader.buffer.noAssert.should.eql false

  it 'should read a UInt8', ->
    buf = new Buffer [ 0x01 ]
    reader = new Reader buf
    reader.read('uint8').should.eql 1

  it 'should read a UInt16', ->
    buf = new Buffer [ 0x01, 0x02 ]
    reader = new Reader buf
    reader.read('uint16').should.eql 513

  it 'should read a UInt32', ->
    buf = new Buffer [ 0x01, 0x02, 0x03, 0x04 ]
    reader = new Reader buf
    reader.read('uint32').should.eql 67305985

  it 'should read a UInt64', ->
    buf = new Buffer [ 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08 ]
    reader = new Reader buf
    reader.read('uint64').should.eql '578437695752307201'

  it 'should read max UInt8', ->
    buf = new Buffer [ 0xFF ]
    reader = new Reader buf
    reader.read('uint8').should.eql 255

  it 'should read max UInt16', ->
    buf = new Buffer [ 0xFF, 0xFF ]
    reader = new Reader buf
    reader.read('uint16').should.eql 65535

  it 'should read max UInt32', ->
    buf = new Buffer [ 0xFF, 0xFF, 0xFF, 0xFF ]
    reader = new Reader buf
    reader.read('uint32').should.eql 4294967295

  it 'should read max UInt64', ->
    buf = new Buffer [ 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF ]
    reader = new Reader buf
    reader.read('uint64').should.eql '18446744073709551615'

  it 'should read Int8', ->
    buf = new Buffer [ 0xFF ]
    reader = new Reader buf
    reader.read('int8').should.eql -1

  it 'should read Int16', ->
    buf = new Buffer [ 0xFF, 0xFF ]
    reader = new Reader buf
    reader.read('int16').should.eql -1

  it 'should read Int32', ->
    buf = new Buffer [ 0xFF, 0xFF, 0xFF, 0xFF ]
    reader = new Reader buf
    reader.read('int32').should.eql -1

  it 'should read Int64', ->
    buf = new Buffer [ 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF ]
    reader = new Reader buf
    reader.read('int64').should.eql '-1'

  it 'should read Bool', ->
    new Reader(new Buffer [ 0x00 ]).read('bool').should.eql false
    new Reader(new Buffer [ 0x01 ]).read('bool').should.eql true
    new Reader(new Buffer [ 0x5a ]).read('bool').should.eql true

  it 'should read string', ->
    buf =  new Buffer [0x48, 0x45, 0x4C, 0x4C, 0x4F]
    reader = new Reader buf
    reader.read('utf-8', 5).should.eql 'HELLO'

  it 'should be able to define a simple type', ->
    buf = new Buffer [ 0x01 ]
    reader = new Reader buf, preCompile {'my-simple-type': 'uint8'}
    reader.read('my-simple-type').should.eql 1

  it 'should be able to define a complex type', ->
    buf = new Buffer [ 0x01 ]
    types = preCompile complex:
      _read: (val) -> @buffer.getUInt8() * val
    reader = new Reader buf, types

    reader.read('complex', 5).should.eql 5

  it 'should be able to define a custom type', ->
    buf = new Buffer [ 0x01, 0x02, 0x03, 0x04 ]
    types = preCompile custom: [
      {a: 'uint8'}
      {b: 'uint8'}
      {c: 'uint8'}
      {d: 'uint8'}
    ]
    reader = new Reader buf, types
    reader.read('custom').should.eql { a: 1,  b: 2, c: 3, d: 4 }

  it 'should be able to skip', ->
    buf = new Buffer [ 0x01, 0x02, 0x03, 0x04 ]
    types = preCompile custom: [
      {a: 'uint8'}
      {b: 'skip(2)'}
      {c: 'uint8'}
    ]

    reader = new Reader buf, types
    reader.read('custom').c.should.eql 4

  it 'should be able to read bytes', ->
    buf = new Buffer [ 0x01, 0x02, 0x03, 0x04 ]
    types = preCompile custom: [
      {a: 'bytes(2)'}
    ]

    reader = new Reader buf, types
    reader.read('custom').a.should.eql [ 0x01, 0x02 ]

  it 'should be able to define a custom embedded type', ->
    buf = new Buffer [ 0x01, 0x02, 0x03 ]
    types = preCompile
      custom: [
        {a: 'uint8'}
        {b: 'uint8'}
        {c: 'embedded-type'}
      ]
      'embedded-type': [
        d: 'uint8'
      ]

    reader = new Reader buf, types
    reader.read('custom').should.eql { a: 1,  b: 2, c: {d: 3} }

  it 'should be able to define a custom complex embedded type', ->
    buf = new Buffer [ 0x01, 0x02, 0x03, 0x04 ]
    types = preCompile
      custom: [
        {a: 'uint8'}
        {b: 'uint8'}
        {c: 'embedded-type'}
      ]
      'embedded-type': [
        {d: 'uint8'}
        {e: 'uint8'}
      ]

    reader = new Reader buf, types
    reader.read('custom').should.eql { a: 1,  b: 2, c: {d: 3, e:4} }

  it 'should be able to define a custom complex embedded type within an embedded type', ->
    buf = new Buffer [ 0x01, 0x02, 0x03, 0x04 ]
    types = preCompile
      custom: [
        {a: 'uint8'}
        {b: 'uint8'}
        {c: 'embedded-type'}
      ]
      'embedded-type': [
        {d: 'uint8'}
        {e: 'super-embedded-type'}
      ]
      'super-embedded-type': [
        f: 'uint8'
      ]

    reader = new Reader buf, types
    reader.read('custom').should.eql { a: 1,  b: 2, c: {d: 3, e: {f:4}} }

  it 'should be able to read a string of a certain length', ->
    buf = new Buffer [0x48, 0x45, 0x4C, 0x4C, 0x4F]
    types = preCompile
      custom: [
        a: 'utf-8(5)'
      ]

    reader = new Reader buf, types
    reader.read('custom').should.eql { a: 'HELLO' }

  it 'should be able to use specify a parameter', ->
    buf = new Buffer [ 0x02, 0x03 ]
    types = preCompile
      mult:
        _read: (val) -> @buffer.getUInt8() * val
      custom: [
        {a: 'uint8'}
        {b: 'mult(4)'}
      ]

    reader = new Reader buf, types
    reader.read('custom').should.eql { a: 2,  b: 12 }

  it 'should be able to use previously resolved value', ->
    buf = new Buffer [ 0x02, 0x03 ]
    types = preCompile
      mult:
        _read: (val) -> @buffer.getUInt8() * val
      custom: [
        {a: 'uint8'}
        {b: 'mult(a)'}
      ]

    reader = new Reader buf, types
    reader.read('custom').should.eql { a: 2,  b: 6 }

  it 'should be able to read an array', ->
    buf = new Buffer [ 0x03, 0x01, 0x02, 0x03 ]
    types = preCompile
      object: [
        c: 'uint8'
      ]
      custom: [
        {a: 'uint8'}
        {b: 'object[a]'}
      ]

    reader = new Reader buf, types
    reader.read('custom').should.eql
      a: 3,
      b: [
        {c:1},
        {c:2},
        {c:3}
      ]

  it 'should be able to read an array of type that is defined with _read function', ->
    buf = new Buffer [ 0x01, 0x02, 0x03 ]

    reader = new Reader buf
    reader.read('uint8[3]').should.eql [1,2,3]

  it 'should only create type definition once per type', ->
    buf = new Buffer [ 0x01, 0x02]
    types = preCompile
      custom: [
        {a: 'uint8'}
        {b: 'uint8'}
      ]

    reader = new Reader buf, types
    reader.read('custom').should.eql {a:1, b:2}
    typeHelper.getTypeInfo.withArgs('uint8').callCount.should.eql 1
