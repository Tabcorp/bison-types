_                       = require 'lodash'
{ SmartBufferReader }   = require 'smart-buffer'
commonTypes             = require './types'
{ getTypeInfo,
  getParameterFromType} = require './type-helper'



class Reader

  constructor: (buffer, types, options={}) ->
    @buffer = new SmartBufferReader(buffer)
    @types = _.extend {}, commonTypes, types
    @typeMap = {}

  processObject: (object, parameter) =>
    return object._read.apply @, [parameter] if object.hasOwnProperty '_read'
    reduceObject = (result, value, key) =>
      result[key] = @read value, parameter, result
      result
    _.reduce object, reduceObject, {}

  read: (typeName, parameter, result={}) ->

    type = @typeMap[typeName]

    if not type
      type = @typeMap[typeName] = getTypeInfo typeName, @types

    if type.isFunction or type.isArray
      parameter = getParameterFromType type, result

    switch (typeof type.value)
      when 'undefined'
        throw new Error "#{type.name} isn't a valid type"
      when 'string'
        @read type.value, parameter
      when 'function'
        type.value.apply @, [parameter]
      when 'object'
        if type.isArray
          _.map [0...Math.floor(parameter)], =>
            @processObject type.value, parameter
        else
          @processObject type.value, parameter

module.exports = Reader