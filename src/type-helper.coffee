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
  ([a-z0-9_-]+)                                    #Match the typename
  ((\(([a-z0-9_-]+)\)+)|(\[([a-z0-9_-]+)\]+))      #Match an array or function
  $
///i

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
    parameter: result[4]
    arraySize: result[6]
    name: result[1]
    value: types[result[1]]

exports.isNumber = (number) ->
  not isNaN number

exports.getParameterFromResult = (value, result) ->
  if exports.isNumber value
    Number(value)
  else if result[value]?
    result[value]
  else
    throw new Error "#{value} is not a valid parameter"