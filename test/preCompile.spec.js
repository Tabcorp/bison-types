commonTypes = require "#{SRC}/types"
preCompile  = require "#{SRC}/preCompile"

describe 'PreCompile', ->

  it 'should pre compile the common types', ->
    typeSet = preCompile {}
    typeSet.definitions['uint8'].should.eql
      isArray: false
      isFunction: false
      isOverride: false
      parameter: undefined
      arraySize: undefined
      name: 'uint8'
      value: commonTypes['uint8']
      overrideValue: undefined

  it 'should pre compile any passed in types', ->
    typeSet = preCompile {'my-type': 'uint8'}
    typeSet.definitions['uint8'].should.eql
      isArray: false
      isFunction: false
      isOverride: false
      parameter: undefined
      arraySize: undefined
      name: 'uint8'
      value: commonTypes['uint8']
      overrideValue: undefined
    typeSet.definitions['my-type'].should.eql
      isArray: false
      isFunction: false
      isOverride: false
      name: 'my-type'
      value: 'uint8'
      parameter: undefined
      arraySize: undefined
      overrideValue: undefined

  it 'should pre compile any passed in function types', ->
    typeSet = preCompile {'my-type': 'uint8(2)'}
    typeSet.definitions['uint8(2)'].should.eql
      isArray: false
      isFunction: true
      isOverride: false
      parameter: '2'
      arraySize: undefined
      name: 'uint8'
      value: commonTypes['uint8']
      overrideValue: undefined
    typeSet.definitions['my-type'].should.eql
      isArray: false
      isFunction: false
      isOverride: false
      name: 'my-type'
      value: 'uint8(2)'
      parameter: undefined
      arraySize: undefined
      overrideValue: undefined

  it 'should pre compile any passed in array types', ->
    typeSet = preCompile {'my-type': 'uint8[2]'}
    typeSet.definitions['uint8[2]'].should.eql
      isArray: true
      isFunction: false
      isOverride: false
      parameter: undefined
      arraySize: '2'
      name: 'uint8'
      value: commonTypes['uint8']
      overrideValue: undefined
    typeSet.definitions['my-type'].should.eql
      isArray: false
      isFunction: false
      isOverride: false
      name: 'my-type'
      value: 'uint8[2]'
      parameter: undefined
      arraySize: undefined
      overrideValue: undefined

  it 'should pre compile any passed in override types', ->
    typeSet = preCompile {'my-type': 'uint8=2'}
    typeSet.definitions['uint8=2'].should.eql
      isArray: false
      isFunction: false
      isOverride: true
      parameter: undefined
      arraySize: undefined
      name: 'uint8'
      value: commonTypes['uint8']
      overrideValue: '2'
    typeSet.definitions['my-type'].should.eql
      isArray: false
      isFunction: false
      isOverride: false
      name: 'my-type'
      value: 'uint8=2'
      parameter: undefined
      arraySize: undefined
      overrideValue: undefined
