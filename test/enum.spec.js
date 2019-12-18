should       = require 'should'
enumeration  = require "#{SRC}/enum"
preCompile   = require "#{SRC}/preCompile"
Reader       = require "#{SRC}/reader"
Writer       = require "#{SRC}/writer"

describe 'Bison enum', ->

  describe 'arrays', ->

    levels = [ 'admin', 'reader', 'writer' ]

    types = preCompile
      'level': enumeration('uint8', levels)
      'level16': enumeration('uint16', levels)

    it 'should encode the enum as its index', ->
      writer = new Writer emptyBuffer(), types
      writer.write 'level', 'reader'
      writer.rawBuffer().should.eql new Buffer [ 0x01, 0x00, 0x00, 0x00 ]

    it 'should decode the index as the enum value', ->
      buf = new Buffer [ 0x02, 0x00, 0x00, 0x00 ]
      reader = new Reader buf, types
      reader.read('level').should.eql 'writer'

    it 'can encode to any given type', ->
      writer = new Writer emptyBuffer(), types, {bigEndian: true}
      writer.write 'level16', 'reader'
      writer.rawBuffer().should.eql new Buffer [ 0x00, 0x01, 0x00, 0x00 ]

    it 'can decode from any given type', ->
      buf = new Buffer [ 0x00, 0x02, 0x00, 0x00 ]
      reader = new Reader buf, types, {bigEndian: true}
      reader.read('level16').should.eql 'writer'

  describe 'objects', ->

    levels =
      'admin': 0xaa11
      'reader': 0xbb22
      'writer': 0xcc33

    types = preCompile
      'level': enumeration('uint16', levels)

    it 'should encode the enum as the object value', ->
      writer = new Writer emptyBuffer(), types
      writer.write 'level', 'reader'
      writer.rawBuffer().should.eql new Buffer [ 0x22, 0xbb, 0x00, 0x00 ]

    it 'should decode the index as the object key', ->
      buf = new Buffer [ 0x33, 0xcc, 0x00, 0x00 ]
      reader = new Reader buf, types
      reader.read('level').should.eql 'writer'


emptyBuffer = ->
  buf = new Buffer 4
  buf.fill 0
  buf
