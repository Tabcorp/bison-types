_                       = require 'lodash'
{ CleverBufferWriter }   = require 'clever-buffer'
commonTypes             = require './types'
{ getTypeInfo,
  getParameterFromResult} = require './type-helper'



class Writer

  constructor: (buffer, types, options={}) ->
    @buffer = new CleverBufferWriter(buffer)
    @types = _.extend {}, commonTypes, types
    @typeMap = {}

  processObject: (definition, valueToWrite, parameter) =>
    return definition._write.apply @, [valueToWrite, parameter] if definition.hasOwnProperty '_write'
    _.each definition, (value) =>
      key = Object.keys(value)[0]
      @write value[key], valueToWrite[key], parameter, valueToWrite

  write: (typeName, valueToWrite, parameter, result={}) ->

    type = @typeMap[typeName] ? getTypeInfo(typeName, @types) if not type

    parameter = getParameterFromResult type.parameter, result if type.isFunction
    valueToWrite = getParameterFromResult type.overrideValue, result if type.isOverride

    switch (typeof type.value)
      when 'undefined'
        throw new Error "#{type.name} isn't a valid type"
      when 'string'
        @write type.value, valueToWrite, parameter, result
      when 'function'
        type.value.apply @, [parameter]
      when 'object'
        if type.isArray
          _.each [0...Math.floor(getParameterFromResult type.arraySize, result)], (value, key) =>
            @processObject type.value, valueToWrite[key], parameter
        else
          @processObject type.value, valueToWrite, parameter

  rawBuffer: ->
    @buffer.buffer

module.exports = Writer