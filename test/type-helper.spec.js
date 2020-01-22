const typeHelper = require(`${SRC}/type-helper`);

describe('GetTypeInfo', () => {
  it('should correctly parse a normal type', () => {
    const type = typeHelper.getTypeInfo('my-type', { 'my-type': 'uint8' });
    type.should.eql({
      isArray: false,
      isFunction: false,
      isOverride: false,
      name: 'my-type',
      value: 'uint8',
      parameter: undefined,
      arraySize: undefined,
      overrideValue: undefined,
    });
  });

  it('should correctly parse a function type with an integer parameter', () => {
    const type = typeHelper.getTypeInfo('my-type(3)', { 'my-type': 'uint8' });
    type.should.eql({
      isArray: false,
      isFunction: true,
      isOverride: false,
      name: 'my-type',
      value: 'uint8',
      parameter: '3',
      arraySize: undefined,
      overrideValue: undefined,
    });
  });

  it('should correctly parse a function type with an variable parameter', () => {
    const type = typeHelper.getTypeInfo('my-type(another-value)', { 'my-type': 'uint8' });
    type.should.eql({
      isArray: false,
      isFunction: true,
      isOverride: false,
      name: 'my-type',
      value: 'uint8',
      parameter: 'another-value',
      arraySize: undefined,
      overrideValue: undefined,
    });
  });

  it('should correctly parse a array type with an integer parameter', () => {
    const type = typeHelper.getTypeInfo('my-type[3]', { 'my-type': 'uint8' });
    type.should.eql({
      isArray: true,
      isFunction: false,
      isOverride: false,
      name: 'my-type',
      value: 'uint8',
      parameter: undefined,
      arraySize: '3',
      overrideValue: undefined,
    });
  });

  it('should correctly parse a array type with an variable parameter', () => {
    const type = typeHelper.getTypeInfo('my-type[another-value]', { 'my-type': 'uint8' });
    type.should.eql({
      isArray: true,
      isFunction: false,
      isOverride: false,
      name: 'my-type',
      value: 'uint8',
      parameter: undefined,
      arraySize: 'another-value',
      overrideValue: undefined,
    });
  });

  it('should correctly parse an override value', () => {
    const type = typeHelper.getTypeInfo('my-type=4', { 'my-type': 'uint8' });
    type.should.eql({
      isArray: false,
      isFunction: false,
      isOverride: true,
      name: 'my-type',
      value: 'uint8',
      parameter: undefined,
      arraySize: undefined,
      overrideValue: '4',
    });
  });

  it('should correctly parse an override value and parameter', () => {
    const type = typeHelper.getTypeInfo('my-type(5)=4', { 'my-type': 'uint8' });
    type.should.eql({
      isArray: false,
      isFunction: true,
      isOverride: true,
      name: 'my-type',
      value: 'uint8',
      parameter: '5',
      arraySize: undefined,
      overrideValue: '4',
    });
  });

  it('should throw error if the type is invalid', () => ((() => typeHelper.getTypeInfo('a^')))
    .should.throwError('a^ is not a valid type'));
});

describe('GetParameterFromResult', () => {
  it('should correctly get an integer parameter', () => typeHelper.getParameterFromResult('4').should.equal(4));

  it('should get a fixed point parameter', () => typeHelper.getParameterFromResult('5.6').should.equal(5.6));

  it('should correctly get a previously resolved integer value', () => typeHelper.getParameterFromResult('a', { a: 6 }).should.equal(6));

  it('should correctly get a previously resolved string value', () => typeHelper.getParameterFromResult('a', { a: 'yo' }).should.equal('yo'));

  it('should correctly get a length of an array', () => typeHelper.getParameterFromResult('a.length', { a: [1, 2, 3] }).should.equal(3));

  it('should throw error if the parameter is invalid', () => ((() => typeHelper.getParameterFromResult('a', {})))
    .should.throwError('a is not a valid parameter'));
});
