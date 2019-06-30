const assertFileContains = require('../assertFileContains');

const content = `
Promise.all(/*! import() */[__webpack_require__.e("common"), __webpack_require__.e(0)]).then(__webpack_require__.t.bind(null, /*! ./HelloWorld */ "./bundles/dynamic-import/HelloWorld.ts", 7)).then(function (_ref) {
  var HelloWorld = _ref["default"];
  new HelloWorld();
});
`;

test('build process transpiles dynamic import', async () => {
  await assertFileContains({
    file: 'dynamic-import.js',
    content
  });
});
