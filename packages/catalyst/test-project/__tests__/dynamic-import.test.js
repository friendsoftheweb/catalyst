const assertFileContains = require('../assertFileContains');

const content = `
Promise.resolve().then(function () {
  return (0, _interopRequireWildcard2.default)(__webpack_require__(/*! ./HelloWorld */ "./bundles/dynamic-import/HelloWorld.ts"));
}).then(function (_ref) {
  var HelloWorld = _ref.default;
  new HelloWorld();
});
`;

test('build process transpiles dynamic import', async () => {
  await assertFileContains({
    file: 'dynamic-import.js',
    content
  });
});
