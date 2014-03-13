# TODO use a better regexp
#
# twice(a) will result in
# [ 'twice(a)',
#   'twice',
#   '(a)',
#   '(a)',
#   'a',
#   undefined,
#   undefined,
#   index: 0,
#   input: 'twice(a)' ]
#

#
# twice[a] will result in
# [ 'twice[a]',
#   'twice',
#   '[a]',
#   undefined,
#   undefined,
#   '[a]',
#   'a',
#   index: 0,
#   input: 'twice(a)' ]
#

exp = ///
  ^
  ([a-zA-Z0-9_-]+)                                    #Match the typename
  ((\(([a-zA-Z0-9_-]+)\)+)|(\[([a-zA-Z0-9_-]+)\]+))   #Match an array or function
  $
///

exports.getTypeInfo = (typeName, types) ->
  result = typeName.match(exp)
  if not result
    isArray: false
    isFunction: false
    name: typeName
    value: types[typeName]
  else
    isArray: result[5]?
    isFunction: result[3]?
    parameter: if result[5]? then result[6] else result[4]
    name: result[1]
    value: types[result[1]]

exports.isNumber = (number) ->
  not isNaN number

exports.getParameterFromType = (type, result) ->
  if exports.isNumber type.parameter
    Number(type.parameter)
  else if result[type.parameter]?
    result[type.parameter]
  else
    throw new Error "#{type.parameter} is not a valid parameter"