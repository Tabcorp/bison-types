should     = require 'should'
sinon      = require 'sinon'
preCompile = require "#{SRC}/preCompile"
Writer     = require "#{SRC}/writer"
typeHelper = require "#{SRC}/type-helper"

describe 'Bison Writer', ->

  beforeEach ->
    sinon.spy typeHelper, 'getTypeInfo'

  afterEach ->
    typeHelper.getTypeInfo.restore()

  it 'should create a writer with a default options', ->
    buf = new Buffer 8
    writer = new Writer buf
    writer.buffer.bigEndian.should.eql false
    writer.buffer.getOffset().should.eql 0
    writer.buffer.noAssert.should.eql true

  it 'should create a writer with a specified offset', ->
    buf = new Buffer 8
    writer = new Writer buf, null, {offset:4}
    writer.buffer.getOffset().should.eql 4

  it 'should create a writer with a specified endian-ness', ->
    buf = new Buffer 8
    writer = new Writer buf, null, {bigEndian:true}
    writer.buffer.bigEndian.should.eql true

  it 'should create a writer with a specified value for noAssert', ->
    buf = new Buffer 8
    writer = new Writer buf, null, {noAssert:false}
    writer.buffer.noAssert.should.eql false

  it 'should write a UInt8', ->
    buf = new Buffer 1
    writer = new Writer buf
    writer.write 'uint8', 5
    writer.rawBuffer().should.eql new Buffer [ 0x05 ]

  it 'should write a UInt16', ->
    buf = new Buffer 2
    writer = new Writer buf
    writer.write 'uint16', 513
    writer.rawBuffer().should.eql new Buffer [ 0x01, 0x02 ]

  it 'should write a UInt32', ->
    buf = new Buffer 4
    writer = new Writer buf
    writer.write 'uint32', 67305985
    writer.rawBuffer().should.eql new Buffer [ 0x01, 0x02, 0x03, 0x04 ]

  it 'should write a UInt64', ->
    buf = new Buffer 8
    writer = new Writer buf
    writer.write 'uint64', '578437695752307201'
    writer.rawBuffer().should.eql new Buffer [ 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08 ]

  it 'should write max UInt8', ->
    buf = new Buffer 1
    writer = new Writer buf
    writer.write 'uint8', 255
    writer.rawBuffer().should.eql new Buffer [0xFF]

  it 'should write max UInt16', ->
    buf = new Buffer 2
    writer = new Writer buf
    writer.write 'uint16', 65535
    writer.rawBuffer().should.eql new Buffer [0xFF, 0xFF]

  it 'should write max UInt32', ->
    buf = new Buffer 4
    writer = new Writer buf
    writer.write 'uint32', 4294967295
    writer.rawBuffer().should.eql new Buffer [0xFF, 0xFF, 0xFF, 0xFF]

  it 'should write max UInt64', ->
    buf = new Buffer 8
    writer = new Writer buf
    writer.write 'uint64', '18446744073709551615'
    writer.rawBuffer().should.eql new Buffer [ 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF ]

  it 'should write Int8', ->
    buf = new Buffer 1
    writer = new Writer buf
    writer.write 'int8', -1
    writer.rawBuffer().should.eql new Buffer [0xFF]

  it 'should write Int16', ->
    buf = new Buffer 2
    writer = new Writer buf
    writer.write 'uint16', -1
    writer.rawBuffer().should.eql new Buffer [0xFF, 0xFF]

  it 'should write Int32', ->
    buf = new Buffer 4
    writer = new Writer buf
    writer.write 'uint32', -1
    writer.rawBuffer().should.eql new Buffer [0xFF, 0xFF, 0xFF, 0xFF]

  it 'should write Int64', ->
    buf = new Buffer 8
    writer = new Writer buf
    writer.write 'uint64', '-1'
    writer.rawBuffer().should.eql new Buffer [ 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF ]

  it 'should write Bool', ->
    buf = new Buffer 5
    writer = new Writer buf
    # falsy
    writer.write 'bool', false
    writer.write 'bool', 0
    # truthy
    writer.write 'bool', true
    writer.write 'bool', 1
    writer.write 'bool', 'hi'
    writer.rawBuffer().should.eql new Buffer [ 0x00, 0x00, 0x01, 0x01, 0x01 ]

  it 'should write string', ->
    buf =  new Buffer 5
    writer = new Writer buf
    writer.write 'utf-8', 'HELLO'
    writer.rawBuffer().should.eql new Buffer [0x48, 0x45, 0x4C, 0x4C, 0x4F]

  it 'should write multi-byte string', ->
    buf =  new Buffer 6
    writer = new Writer buf
    writer.write 'utf-8', 'HÉLLO'
    writer.rawBuffer().should.eql new Buffer [0x48, 0xC3, 0x89, 0x4C, 0x4C, 0x4F]

  it 'should write string with latin1 encoding', ->
    buf =  new Buffer 5
    writer = new Writer buf
    writer.write 'latin1', 'HÉLLO'
    writer.rawBuffer().should.eql new Buffer [0x48, 0xC9, 0x4C, 0x4C, 0x4F]

  it 'should be able to write bytes', ->
    buf =  new Buffer 5
    writer = new Writer buf
    writer.write 'bytes', [0x48, 0x45, 0x4C, 0x4C, 0x4F]
    writer.rawBuffer().should.eql new Buffer [0x48, 0x45, 0x4C, 0x4C, 0x4F]

  it 'should be able to define a simple type', ->
    buf = new Buffer 1
    writer = new Writer buf, preCompile {'my-simple-type': 'uint8'}
    writer.write 'my-simple-type', 5
    writer.rawBuffer().should.eql new Buffer [0x05]

  it 'should be able to define a complex type', ->
    buf = new Buffer 1
    types = preCompile
      complex:
        _write: (val, multiplier) -> @buffer.writeUInt8 val*multiplier
    writer = new Writer buf, types
    writer.write 'complex', 1, 5
    writer.rawBuffer().should.eql new Buffer [0x05]

  it 'should be able to define a custom type', ->
    buf = new Buffer 4
    types = preCompile
      custom: [
        {a: 'uint8'}
        {b: 'uint8'}
        {c: 'uint8'}
        {d: 'uint8'}
      ]
    writer = new Writer buf, types
    writer.write 'custom', { a: 1,  b: 2, c: 3, d: 4 }
    writer.rawBuffer().should.eql new Buffer [ 0x01, 0x02, 0x03, 0x04 ]

  it 'should be able to skip', ->
    buf = new Buffer 4
    buf.fill 0
    types = preCompile
      custom: [
        {a: 'uint8'}
        {b: 'skip(2)'}
        {c: 'uint8'}
      ]
    writer = new Writer buf, types
    writer.write 'custom', {a: 1, c: 4}
    writer.rawBuffer().should.eql new Buffer [ 0x01, 0x00, 0x00, 0x04 ]

  it 'should be able to define a custom embedded type', ->
    buf = new Buffer 3
    types = preCompile
      custom: [
        {a: 'uint8'}
        {b: 'uint8'}
        {c: 'embedded-type'}
      ]
      'embedded-type': [
        d: 'uint8'
      ]

    writer = new Writer buf, types
    writer.write 'custom', { a: 1,  b: 2, c: {d: 3} }
    writer.rawBuffer().should.eql new Buffer [ 0x01, 0x02, 0x03 ]

  it 'should be able to define a custom complex embedded type', ->
    buf = new Buffer 4
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

    writer = new Writer buf, types
    writer.write 'custom', { a: 1,  b: 2, c: {d: 3, e:4} }
    writer.rawBuffer().should.eql new Buffer [ 0x01, 0x02, 0x03, 0x04 ]

  it 'should be able to define a custom complex embedded type within an embedded type', ->
    buf = new Buffer 4
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

    writer = new Writer buf, types
    writer.write 'custom', { a: 1,  b: 2, c: {d: 3, e: {f:4}} }
    writer.rawBuffer().should.eql new Buffer [ 0x01, 0x02, 0x03, 0x04 ]

  it 'should be able to write a string of a certain length', ->
    buf = new Buffer 10
    buf.fill 0
    types = preCompile
      custom: [
        a: 'utf-8(5)'
      ]

    writer = new Writer buf, types
    writer.write 'custom', { a: 'HELLOWORLD' }
    writer.rawBuffer().should.eql new Buffer [0x48, 0x45, 0x4C, 0x4C, 0x4F, 0x00, 0x00, 0x00, 0x00, 0x00] #Only writes hello

  it 'should be able to write an undersized string of a certain length', ->
    buf = new Buffer 14
    buf.fill 0xff
    types = preCompile
      custom: [
        {a: 'utf-8(6)'}
        {b: 'utf-8(7)'}
      ]

    writer = new Writer buf, types
    writer.write 'custom', { a: 'HELLO', b: 'WORLD' }
    writer.rawBuffer().should.eql new Buffer [0x48, 0x45, 0x4C, 0x4C, 0x4F, 0x00, 0x57, 0x4F, 0x52, 0x4C, 0x44, 0x00, 0x00, 0xff] # pads end with NUL

  it 'should be able to specify a parameter', ->
    buf = new Buffer 2
    types = preCompile
      divide:
        _write: (val, divider) -> @buffer.writeUInt8(val / divider)
      custom: [
        {a: 'uint8'}
        {b: 'divide(4)'}
      ]

    writer = new Writer buf, types
    writer.write 'custom', { a: 2,  b: 12 }
    writer.rawBuffer().should.eql new Buffer [ 0x02, 0x03 ]

  it 'should be able to use previously resolved value', ->
    buf = new Buffer 2
    types = preCompile
      divide:
        _write: (val, divider) -> @buffer.writeUInt8(val / divider)
      custom: [
        {a: 'uint8'}
        {b: 'divide(a)'}
      ]

    writer = new Writer buf, types
    writer.write 'custom', { a: 2,  b: 6 }
    writer.rawBuffer().should.eql new Buffer [ 0x02, 0x03 ]

  it 'should be able to write an array', ->
    buf = new Buffer 4
    types = preCompile
      object: [
        c: 'uint8'
      ]
      custom: [
        {a: 'uint8'}
        {b: 'object[a]'}
      ]

    writer = new Writer buf, types
    writer.write 'custom',
      a: 3,
      b: [
        {c:1},
        {c:2},
        {c:3}
      ]
    writer.rawBuffer().should.eql new Buffer [ 0x03, 0x01, 0x02, 0x03 ]

  it 'should only write specified amount in array', ->
    buf = new Buffer 5
    buf.fill 0
    types = preCompile
      object: [
        c: 'uint8'
      ]
      custom: [
        b: 'object[3]'
      ]

    writer = new Writer buf, types
    writer.write 'custom',
      b: [
        {c:1},
        {c:2},
        {c:3},
        {c:4}
      ]
    writer.rawBuffer().should.eql new Buffer [ 0x01, 0x02, 0x03, 0x00, 0x00 ] #Doesn't write last 2 values

  it 'should write a UInt8 with an override value', ->
    buf = new Buffer 1
    writer = new Writer buf
    writer.write 'uint8=3', 5
    writer.rawBuffer().should.eql new Buffer [ 0x03 ]

  it 'should be able to write an array of type that is defined with _write function', ->
    buf = new Buffer 3

    writer = new Writer buf
    writer.write 'uint8[3]', [1,2,3]
    writer.rawBuffer().should.eql new Buffer [ 0x01, 0x02, 0x03 ]

  it 'should be able to write array and size', ->
    buf = new Buffer 4
    buf.fill 0
    types = preCompile
      custom: [
        {a: 'uint8=b.length'}
        {b: 'uint8[b.length]'}
      ]

    writer = new Writer buf, types
    writer.write 'custom', {b: [1,2,3]}
    writer.rawBuffer().should.eql new Buffer [ 0x03, 0x01, 0x02, 0x03 ]

  it 'should only create type definition once per type', ->
    buf = new Buffer 2
    buf.fill 0
    types = preCompile
      custom: [
        {a: 'uint8'}
        {b: 'uint8'}
      ]

    writer = new Writer buf, types
    writer.write 'custom', {a: 1, b: 2}
    writer.rawBuffer().should.eql new Buffer [ 0x01, 0x02]
    typeHelper.getTypeInfo.withArgs('uint8').callCount.should.eql 1

  it 'throws exceptions for invalid types in objects', (done) ->
    buf = new Buffer 1
    buf.fill 0
    types = preCompile
      object: [
        broken_key: 'my-type'
      ]

    writer = new Writer buf, types

    try
      writer.write('object', {broken_key: 1})
      done(new Error('should not be called'))
    catch ex
      ex.message.should.eql "'broken_key': my-type isn't a valid type"
      done()
