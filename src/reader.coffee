_                       = require 'lodash'
{ SmartBufferReader }   = require 'smart-buffer'
commonTypes             = require './types'
{ getTypeInfo,
  getParameterFromType} = require './type-helper'



class Reader

  constructor: (buffer, types, options={}) ->
    @buffer = new SmartBufferReader(buffer)
    @types = _.extend {}, commonTypes, types


  processObject: (collection, parameter) =>
    reduceObject = (result, value, key) =>
      result[key] = @read value, parameter, result
      result
    _.reduce collection, reduceObject, {}

  read: (typeName, parameter, result={}) ->

    type = getTypeInfo typeName, @types

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
        if type.value.hasOwnProperty '_read'
          type.value._read.apply @, [parameter]
        else if type.isArray
          _.map [0...parameter], =>
            @processObject type.value, parameter
        else
          @processObject type.value, parameter

module.exports = Reader