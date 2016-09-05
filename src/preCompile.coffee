_           = require 'lodash'
commonTypes = require './types'
typeHelper  = require './type-helper'

util = require 'util'
module.exports = (types) ->

  # console.log "precompile #{util.inspect(types, false, 10)}"

  allTypes = _.extend {}, commonTypes, types
  types: allTypes
  # keys: _.reduce(allTypes, (result, val, type) =>
  #   getTypeKeys(type, allTypes, result)
  #   result
  definitions: _.reduce(allTypes, (result, val, type) =>
    getTypeDefinition(type, allTypes, result)
    result
  ,{})

getTypeDefinition = (type, allTypes, result) ->
  result[type] = typeHelper.getTypeInfo(type, allTypes)
  value = result[type].value
  if typeof value is 'string'
    getTypeDefinition(value, allTypes, result)
  result

# getTypeKeys = (type, allTypes, result) ->
#   type
