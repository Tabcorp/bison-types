module.exports =
  'uint8' :
    _read : -> @buffer.getUInt8()
    _write: (val) -> @buffer.writeUInt8(val)

  'uint16':
    _read : -> @buffer.getUInt16()
    _write: (val) -> @buffer.writeUInt16(val)

  'uint32':
    _read : -> @buffer.getUInt32()
    _write: (val) -> @buffer.writeUInt32(val)

  'uint64':
    _read : -> @buffer.getUInt64()
    _write: (val) -> @buffer.writeUInt64(val)

  'int8' :
    _read : -> @buffer.getInt8()
    _write: (val) -> @buffer.writeInt8(val)

  'int16':
    _read : -> @buffer.getInt16()
    _write: (val) -> @buffer.writeInt16(val)

  'int32':
    _read : -> @buffer.getInt32()
    _write: (val) -> @buffer.writeInt32(val)

  'int64':
    _read : -> @buffer.getInt64()
    _write: (val) -> @buffer.writeInt64(val)

  'utf-8' :
    _read : (length) -> @buffer.getString {length}
    _write: (val, length) -> @buffer.writeString val, {length}

  'bool' :
    _read : -> if @buffer.getUInt8() then true else false
    _write: (val) -> @buffer.writeUInt8(if val then 1 else 0)

  'skip'  :
    _read : (len) ->
      @buffer.skip len
      return
    _write: (val, len) -> @buffer.skip len

  'bytes' :
    _read : (length) -> @buffer.getBytes {length}
    _write: (val, length) -> @buffer.writeBytes val, {length}
