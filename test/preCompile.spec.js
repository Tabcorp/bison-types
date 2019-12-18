/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const commonTypes = require(`${SRC}/types`);
const preCompile  = require(`${SRC}/preCompile`);

describe('PreCompile', function() {

  it('should pre compile the common types', function() {
    const typeSet = preCompile({});
    return typeSet.definitions['uint8'].should.eql({
      isArray: false,
      isFunction: false,
      isOverride: false,
      parameter: undefined,
      arraySize: undefined,
      name: 'uint8',
      value: commonTypes['uint8'],
      overrideValue: undefined
    });
  });

  it('should pre compile any passed in types', function() {
    const typeSet = preCompile({'my-type': 'uint8'});
    typeSet.definitions['uint8'].should.eql({
      isArray: false,
      isFunction: false,
      isOverride: false,
      parameter: undefined,
      arraySize: undefined,
      name: 'uint8',
      value: commonTypes['uint8'],
      overrideValue: undefined
    });
    return typeSet.definitions['my-type'].should.eql({
      isArray: false,
      isFunction: false,
      isOverride: false,
      name: 'my-type',
      value: 'uint8',
      parameter: undefined,
      arraySize: undefined,
      overrideValue: undefined
    });
  });

  it('should pre compile any passed in function types', function() {
    const typeSet = preCompile({'my-type': 'uint8(2)'});
    typeSet.definitions['uint8(2)'].should.eql({
      isArray: false,
      isFunction: true,
      isOverride: false,
      parameter: '2',
      arraySize: undefined,
      name: 'uint8',
      value: commonTypes['uint8'],
      overrideValue: undefined
    });
    return typeSet.definitions['my-type'].should.eql({
      isArray: false,
      isFunction: false,
      isOverride: false,
      name: 'my-type',
      value: 'uint8(2)',
      parameter: undefined,
      arraySize: undefined,
      overrideValue: undefined
    });
  });

  it('should pre compile any passed in array types', function() {
    const typeSet = preCompile({'my-type': 'uint8[2]'});
    typeSet.definitions['uint8[2]'].should.eql({
      isArray: true,
      isFunction: false,
      isOverride: false,
      parameter: undefined,
      arraySize: '2',
      name: 'uint8',
      value: commonTypes['uint8'],
      overrideValue: undefined
    });
    return typeSet.definitions['my-type'].should.eql({
      isArray: false,
      isFunction: false,
      isOverride: false,
      name: 'my-type',
      value: 'uint8[2]',
      parameter: undefined,
      arraySize: undefined,
      overrideValue: undefined
    });
  });

  return it('should pre compile any passed in override types', function() {
    const typeSet = preCompile({'my-type': 'uint8=2'});
    typeSet.definitions['uint8=2'].should.eql({
      isArray: false,
      isFunction: false,
      isOverride: true,
      parameter: undefined,
      arraySize: undefined,
      name: 'uint8',
      value: commonTypes['uint8'],
      overrideValue: '2'
    });
    return typeSet.definitions['my-type'].should.eql({
      isArray: false,
      isFunction: false,
      isOverride: false,
      name: 'my-type',
      value: 'uint8=2',
      parameter: undefined,
      arraySize: undefined,
      overrideValue: undefined
    });
  });
});
