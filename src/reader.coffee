_                       = require 'lodash'
{ CleverBufferReader }   = require 'clever-buffer'
commonTypes             = require './types'
{ getTypeInfo,
  getParameterFromResult} = require './type-helper'



class Reader

  constructor: (buffer, types, options={}) ->
    @buffer = new CleverBufferReader(buffer)
    @types = _.extend {}, commonTypes, types
    @typeMap = {}

  processObject: (object, parameter) =>
    return object._read.apply @, [parameter] if object.hasOwnProperty '_read'
    _.reduce object, ((res, value) =>
      key = Object.keys(value)[0]
      res[key] = @read value[key], parameter, res
      res) , {}

  read: (typeName, parameter, result={}) ->

    type = @typeMap[typeName] ? getTypeInfo(typeName, @types) if not type

    parameter = getParameterFromResult type.parameter, result if type.isFunction

    switch (typeof type.value)
      when 'undefined'
        throw new Error "#{type.name} isn't a valid type"
      when 'string'
        @read type.value, parameter
      when 'function'
        type.value.apply @, [parameter]
      when 'object'
        if type.isArray
          _.map [0...Math.floor(getParameterFromResult type.arraySize, result)], =>
            @processObject type.value, parameter
        else
          @processObject type.value, parameter

module.exports = Reader