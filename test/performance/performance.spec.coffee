should      = require 'should'
util        = require 'util'
Table       = require 'cli-table'
types       = require './performance-types'
Writer      = require "#{SRC}/writer"
Reader      = require "#{SRC}/reader"

describe 'Performance', ->

  it 'test', ->
    table = new Table
      head: ['Operation', 'time (ms)']
      colWidths: [20, 20]
    read 10000, table
    write 10000, table
    console.log ''
    console.log table.toString()

write = (count, table) ->
  json = jsonMessage()
  buf = new Buffer(64)
  buf.fill 0
  start = new Date()
  for i in [0...count]
    writer = new Writer buf, types
    writer.write 'complex-type', json
  end = new Date()
  table.push ["Write #{count}", end-start]

read = (count, table) ->
  binary = binaryMessage()
  start = new Date()
  for i in [0...count]
    reader = new Reader binary, types
    json = reader.read 'complex-type'
  end = new Date()
  table.push ["Read #{count}", end-start]


jsonMessage =  ->
  json =
    a: 123
    b: 12345
    c: 123456
    d: '4294967366'
    e: "hello world"
    arraySize: 1
    array: [
      f: "hello"
      g: 2
      h: 3
      i:
        j: 123
        k: 456789
        l: 123456789
        m: '4294967366'
        n: 1
    ]

binaryMessage =  ->
  new Buffer [
    0x7b,0x39,0x30,0x40,0xe2,0x01,0x00,0x46,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x0b,
    0x68,0x65,0x6c,0x6c,0x6f,0x20,0x77,0x6f,0x72,0x6c,0x64,0x01,0x68,0x65,0x6c,0x6c,
    0x6f,0x02,0x03,0x7b,0x55,0xf8,0x15,0xcd,0x5b,0x07,0x46,0x00,0x00,0x00,0x01,0x00,
    0x00,0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00
  ]




