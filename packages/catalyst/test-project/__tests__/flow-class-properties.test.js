const assertFileContains = require('../assertFileContains');

const content = `
  function FlowClassProperties(props) {
    var _this;

    (0, _classCallCheck2.default)(this, FlowClassProperties);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(FlowClassProperties).apply(this, arguments));
    _this.foo = _this.foo.bind((0, _assertThisInitialized2.default)(_this));
    return _this;
  }
`;

// This is for testing the combination of
// `@babel/plugin-proposal-class-properties` and
// `@babel/plugin-transform-flow-strip-types`. If they are in the wrong order,
// then `this.foo` will be set to `void 0` before it is set to the bound
// function.
test('build process transpiles class properties', async () => {
  await assertFileContains({
    file: 'flow-class-properties.js',
    content
  });
});
