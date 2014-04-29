_           = require 'lodash'
commonTypes = require './types'
typeHelper  = require './type-helper'

module.exports = (types) ->

  allTypes = _.extend {}, commonTypes, types
  types: allTypes
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