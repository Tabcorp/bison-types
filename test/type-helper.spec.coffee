typeHelper = require "#{SRC}/type-helper"

describe 'GetTypeInfo', ->
  it 'should correctly parse a normal type', ->
    type = typeHelper.getTypeInfo 'my-type', {'my-type': 'uint8'}
    type.should.eql
      isArray: false
      isFunction: false
      name: 'my-type'
      value: 'uint8'

  it 'should correctly parse a function type with an integer parameter', ->
    type = typeHelper.getTypeInfo 'my-type(3)', {'my-type': 'uint8'}
    type.should.eql
      isArray: false
      isFunction: true
      name: 'my-type'
      value: 'uint8'
      parameter: '3'
      arraySize: undefined

  it 'should correctly parse a function type with an variable parameter', ->
    type = typeHelper.getTypeInfo 'my-type(another-value)', {'my-type': 'uint8'}
    type.should.eql
      isArray: false
      isFunction: true
      name: 'my-type'
      value: 'uint8'
      parameter: 'another-value'
      arraySize: undefined

  it 'should correctly parse a array type with an integer parameter', ->
    type = typeHelper.getTypeInfo 'my-type[3]', {'my-type': 'uint8'}
    type.should.eql
      isArray: true
      isFunction: false
      name: 'my-type'
      value: 'uint8'
      parameter: undefined
      arraySize: '3'

  it 'should correctly parse a array type with an variable parameter', ->
    type = typeHelper.getTypeInfo 'my-type[another-value]', {'my-type': 'uint8'}
    type.should.eql
      isArray: true
      isFunction: false
      name: 'my-type'
      value: 'uint8'
      parameter: undefined
      arraySize: 'another-value'

describe 'GetParameterFromResult', ->
  it 'should correctly get an integer parameter', ->
    typeHelper.getParameterFromResult('4').should.equal 4

  it 'should get a fixed point parameter', ->
    typeHelper.getParameterFromResult('5.6').should.equal 5.6

  it 'should correctly get a previously resolved integer value', ->
    typeHelper.getParameterFromResult('a', {a: 6}).should.equal 6

  it 'should correctly get a previously resolved string value', ->
    typeHelper.getParameterFromResult('a', {a: 'yo'}).should.equal 'yo'

  it 'should throw error if the parameter is invalid', ->
    (-> typeHelper.getParameterFromResult('a', {}))
    .should.throwError "a is not a valid parameter"


