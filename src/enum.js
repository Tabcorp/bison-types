_    = require 'lodash'
util = require 'util'

module.exports = (type, lookup) ->

  if util.isArray lookup
    _read: ->
      index = @read type
      lookup[index]
    _write: (value) ->
      @write type, lookup.indexOf(value)

  else
    _read: ->
      value = @read type
      _.findKey lookup, (val) -> val == value
    _write: (key) ->
      @write type, lookup[key]
