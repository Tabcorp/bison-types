_                       = require 'lodash'
{ CleverBufferReader }  = require 'clever-buffer'
preCompile              = require './preCompile'
typeHelper              = require './type-helper'



class Reader

  constructor: (buffer, @typeSet, options={}) ->
    @buffer = new CleverBufferReader(buffer, options)
    if not @typeSet
      @typeSet = preCompile {}

  processObject: (object, parameter) =>
    return object._read.apply @, [parameter] if object.hasOwnProperty '_read'
    _.reduce object, ((res, value) =>
      key = Object.keys(value)[0]
      res[key] = @read value[key], parameter, res
      res) , {}

  read: (typeName, parameter, result={}) ->

    type = @typeSet.definitions[typeName]
    if not type
      type = @typeSet.definitions[typeName] = typeHelper.getTypeInfo(typeName, @typeSet.types)

    parameter = typeHelper.getParameterFromResult type.parameter, result if type.isFunction

    switch (typeof type.value)
      when 'undefined'
        throw new Error "#{type.name} isn't a valid type"
      when 'string'
        @read type.value, parameter
      when 'function'
        type.value.apply @, [parameter]
      when 'object'
        if type.isArray
          _.map [0...Math.floor(typeHelper.getParameterFromResult type.arraySize, result)], =>
            @processObject type.value, parameter
        else
          @processObject type.value, parameter

module.exports = Reader