_                       = require 'lodash'
{ CleverBufferWriter }  = require 'clever-buffer'
preCompile              = require './preCompile'
typeHelper              = require './type-helper'

util = require 'util'

class Writer

  constructor: (buffer, @typeSet, options={}) ->
    @buffer = new CleverBufferWriter(buffer, options)
    if not @typeSet
      @typeSet = preCompile {}

  processObject: (definition, valueToWrite, parameter) =>
    return definition._write.apply @, [valueToWrite, parameter] if definition.hasOwnProperty '_write'
    _.each definition, (value) =>
      key = Object.keys(value)[0]
      @write value[key], valueToWrite[key], parameter, valueToWrite

  write: (typeName, valueToWrite, parameter, result={}) ->

    type = @typeSet.definitions[typeName]
    if not type
      type = @typeSet.definitions[typeName] = typeHelper.getTypeInfo(typeName, @typeSet.types)

    # console.log util.inspect(@typeSet.types, false, 10)

    parameter = typeHelper.getParameterFromResult type.parameter, result if type.isFunction
    valueToWrite = typeHelper.getParameterFromResult type.overrideValue, result if type.isOverride

    #console.log "#{typeName}: #{valueToWrite}" unless typeName is 'utf-8'

    switch (typeof type.value)
      when 'undefined'
        throw new Error "#{type.name} isn't a valid type"
      when 'string'
        @write type.value, valueToWrite, parameter, result
      when 'function'
        type.value.apply @, [parameter]
      when 'object'
        if type.isArray
          _.each [0...Math.floor(typeHelper.getParameterFromResult type.arraySize, result)], (value, key) =>
            @processObject type.value, valueToWrite[key], parameter
        else
          @processObject type.value, valueToWrite, parameter

  rawBuffer: ->
    @buffer.buffer

module.exports = Writer
