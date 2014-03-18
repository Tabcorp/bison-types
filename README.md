# bison-types

![logo](bison-types.png)

- Are you stuck with integrating with a system that only speaks binary?
- Are you sick of manually decoding and encoding from json to binary?
- Do you want an easy way to define your types in javascript?

If you answered yes to any of the above questions, then `bison-types` is for you

## How does it work?

`bison-types` allows you to define custom types.
With these custom types you can build up a message definition
Pass these types and the buffer to bison-types and it will do the rest.

*For example:*

```coffee
bison = require 'bison-types'

types = 

  # top-level type
  'timeline': [
    {count: 'uint16'}
    {messages: 'message[count]'}
  ]

  # sub type
  'message': [
    {id: 'uint8'}
    {timestamp: 'uint16'}
    {length: 'uint16'}
    {text: 'utf-8(length)'}
  ]

# time to read!

buf = new Buffer [0x04, 0x92, 0x04, 0x3b, 0xf4, 0x2c, ...]
reader = new bison.Reader buf, types, {bigEndian: false}
json = reader.read 'timeline'

# or write !

buf = new Buffer(1024)
writer = new bison.Writer buf, types, {bigEndian: false}
writer.write 'timeline', {
  count: 1
  messages: [
    {
      id: 3
      date: new Date().getTime()
      length: 11
      text: 'hello world'
    }
  ]
}



```

*Note:*  bison-types uses [smart-buffer](https://github.com/TabDigital/smart-buffer) under the hood for all buffer manipulation.


## Provided simple types

* `uint8`  - unsigned 8 bit integer
* `uint16` - unsigned 16 bit integer
* `uint32` - unsigned 32 bit integer
* `uint64` - unsigned 64 bit integer
* `int8`   - signed 8 bit integer
* `int16`  - signed 16 bit integer
* `int32`  - signed 32 bit integer
* `int64`  - signed 64 bit integer
* `utf-8`  - utf-8 encoded string
* `skip`   - will skip specified bytes


## Creating your own custom types

*NOTE:* All examples are written in coffeescript

There are 2 different ways that you can define a custom type
### By mapping it to another type

``` coffee
  types = 
    my-other-type: [
      {a: 'uint8'}
      {b: 'uint16'}
    ]
    my-type: [
      {c: 'my-other-type'}
      {d: 'uint8'}
    ]
```
would create an object like

``` coffee
  myType = {c: {a: 12, b: 123}, d: 1234}
```

### By explicitly creating a _read function
We expose the underlying [smart-buffer](https://github.com/TabDigital/smart-buffer) as @buffer.

You can call any of it's methods

``` coffee
  types = 
    multiply:
      _read:  (multiplier) ->
        @buffer.getUint8() * multiplier
      _write: (val, multiplier) ->
        @buffer.writeUInt8(val * multiplier)
```
would multiply the value read from the buffer before returning it when reading
and multiply the value to be written when writing

## Reader

You need to pass in a buffer to read from, and any custom types that you may have. 

You can also pass in options, look at [smart-buffer](https://github.com/TabDigital/smart-buffer) for a full list of options

### Reading some integers
``` coffee
    bison = require 'bison-types'

    buf = new Buffer [ 0x01, 0x02, 0x03, 0x04 ]
    types = 
      my-type: [
        {a: 'uint8'}
        {b: 'uint8'}
        {c: 'uint8'}
        {d: 'uint8'}
      ]
    options = {bigEndian: false}
    reader = new bison.Reader buf, types, options
    myType = reader.read('my-type') # myType = { a: 1,  b: 2, c: 3, d: 4 }
```

### Reading a string
``` coffee
    bison = require 'bison-types'
    
    buf = new Buffer [0x48, 0x45, 0x4C, 0x4C, 0x4F]
    types =
      my-type: [
        a: 'utf-8(5)'
      ]
    options = {bigEndian: false}
    reader = new bison.Reader buf, types, options
    myType = reader.read('my-type') # myType = { a: 'HELLO' }
```

### Complex types
The power of bison-types is evident as you define more complex types
``` coffee
    bison = require 'bison-types'

    buf = new Buffer [ 0x01, 0x03, 0x04 ]
    types = 
      my-type: [
        {a: 'uint8'}
        {b: 'my-other-type'}
      ]
      my-other-type: [
        {c: 'uint8'}
        {d: 'uint8'}
      ]
    options = {bigEndian: false}
    reader = new bison.Reader buf, types, options
    myType = reader.read('my-type') # myType = { a: 1,  b: { c: 3, d: 4 }}
```

### Using previous values as parameters
You can use previously resolved values as parameters to types
The power of bison-types is evident as you define more complex types
``` coffee
    bison = require 'bison-types'

    buf = new Buffer [ 0x04, 0x02 ]
    types = 
      mult:
        _read: (val) -> @buffer.getUInt8() * val
      my-type: [
        {a: 'uint8'}
        {b: 'mult(a)'}
      ]
    options = {bigEndian: false}
    reader = new bison.Reader buf, types, options
    myType = reader.read('my-type') # myType = { a: 4,  b: 8}
```
### Arrays
You can specify arrays in a similar matter

``` coffee
    bison = require 'bison-types'
    buf = new Buffer [ 0x03, 0x01, 0x02, 0x03 ]
    types =
      object: [
        c: 'uint8'
      ]
      my-type: [
        {a: 'uint8'}
        {b: 'object[a]'}
      ]
    options = {bigEndian: false}
    reader = new bison.Reader buf, types, options
    myType = reader.read('my-type') 
    # myType = { a: 3, b:[{c:1},{c:2},{c:3}] }
```

## Writer

You need to pass in a buffer to write to, and any custom types that you may have. 

You can also pass in options, look at [smart-buffer](https://github.com/TabDigital/smart-buffer) for a full list of options

### Writing some integers
``` coffee
    bison = require 'bison-types'

    buf = new Buffer 4
    types = 
      my-type: [
        {a: 'uint8'}
        {b: 'uint8'}
        {c: 'uint8'}
        {d: 'uint8'}
      ]
    options = {bigEndian: false}
    writer = new bison.Writer buf, types, options
    writer.write 'my-type', { a: 1,  b: 2, c: 3, d: 4 }
    # buf will equal [ 0x01, 0x02, 0x03, 0x04 ]
```

### Writing a string
``` coffee
    bison = require 'bison-types'
    
    buf = new Buffer 5
    types =
      my-type: [
        a: 'utf-8'
      ]
    options = {bigEndian: false}
    writer = new bison.Writer buf, types, options
    writer.write 'my-type', { a: 'HELLO' }
    # buf will equal [0x48, 0x45, 0x4C, 0x4C, 0x4F]
```

### Only writing a certain length of string
``` coffee
    bison = require 'bison-types'
    
    buf = new Buffer 10
    types =
      my-type: [
        a: 'utf-8(5)'
      ]
    options = {bigEndian: false}
    writer = new bison.Writer buf, types, options
    writer.write 'my-type', { a: 'HELLOWORLD' }
    # buf will equal [0x48, 0x45, 0x4C, 0x4C, 0x4F, 0x00, 0x00, 0x00, 0x00, 0x00]
```

### Complex types
The power of bison-types is evident as you define more complex types
``` coffee
    bison = require 'bison-types'

    buf = new Buffer 4
    types = 
      my-type: [
        {a: 'uint8'}
        {b: 'my-other-type'}
      ]
      my-other-type: [
        {c: 'uint8'}
        {d: 'uint8'}
      ]
    options = {bigEndian: false}
    writer = new bison.Writer buf, types, options
    writer.write 'my-type', { a: 1,  b: { c: 3, d: 4 }}
    # buf will equal [ 0x01, 0x03, 0x04 ]
```

### Using other values as parameters
You can use other values as parameters to types
The power of bison-types is evident as you define more complex types
``` coffee
    bison = require 'bison-types'

    buf = new Buffer 2
    types = 
      div:
        _write: (val, divider) -> @buffer.writeUInt8(val/divider)
      my-type: [
        {a: 'uint8'}
        {b: 'div(a)'}
      ]
    options = {bigEndian: false}
    writer = new bison.Writer buf, types, options
    writer.write 'my-type', { a: 4,  b: 8}
    # buf will equal [ 0x04, 0x02 ]
```
### Overriding a value
You can specify a specific value using the following syntax
``` coffee
    bison = require 'bison-types'

    buf = new Buffer 2
    types = 
      my-type: [
        {a: 'uint8=1'}
        {b: 'uint8=2'}
      ]
    options = {bigEndian: false}
    writer = new bison.Writer buf, types, options
    writer.write 'my-type', {}
    # buf will equal [ 0x01, 0x02 ]
```
### Arrays
You can specify arrays in a similar matter

``` coffee
    bison = require 'bison-types'
    buf = new Buffer 4 
    types =
      object: [
        c: 'uint8'
      ]
      my-type: [
        {a: 'uint8'}
        {b: 'object[a]'}
      ]
    options = {bigEndian: false}
    writer = new bison.Writer buf, types, options
    writer.write 'my-type', { a: 3, b:[{c:1},{c:2},{c:3}] }
    # buf will equal [ 0x03, 0x01, 0x02, 0x03 ]
```
### Using an array length as a parameter
This is a shorthand of the above example

``` coffee
    bison = require 'bison-types'
    buf = new Buffer 4 
    types =
      object: [
        c: 'uint8'
      ]
      my-type: [
        {a: 'uint8=b.length'}
        {b: 'object[b.length]'}
      ]
    options = {bigEndian: false}
    writer = new bison.Writer buf, types, options
    writer.write 'my-type', { b:[{c:1},{c:2},{c:3}] }
    # buf will equal [ 0x03, 0x01, 0x02, 0x03 ]
```

## Testing

```
npm test
```
