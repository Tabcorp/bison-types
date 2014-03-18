exp = ///
  ^
  ([a-z0-9_-]+)                                      #Match the typename
  ((\(([a-z0-9._-]*)\)+)|(\[([a-z0-9._-]*)\]+))?     #Match an array or function
  (\=([a-z0-9._-]*))?                                #Match an override value
  $
///i

exports.getTypeInfo = (typeName, types) ->
  result = typeName.match(exp)
  if not result
    throw new Error "#{typeName} is not a valid type"
  else
    isArray: result[5]?
    isFunction: result[3]? and result[4] isnt ''
    isOverride: result[7]?
    parameter: result[4]
    arraySize: result[6]
    name: result[1]
    value: types[result[1]]
    overrideValue: result[8]

exports.isNumber = (number) ->
  not isNaN number

exports.getParameterFromResult = (value, result) ->
  if exports.isNumber value
    Number(value)
  else if typeof value is 'string' and value.indexOf('.length') isnt -1
    split = value.split('.length')
    if result[split[0]]?
      result[split[0]].length
    else
      throw new Error "#{value} is not a valid parameter"
  else if result[value]?
    result[value]
  else
    throw new Error "#{value} is not a valid parameter"