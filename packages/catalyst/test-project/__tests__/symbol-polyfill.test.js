const assertFileContains = require('../assertFileContains');

test('build process polyfills symbols', async () => {
  await assertFileContains({
    file: 'symbol-polyfill.js',
    content:
      '__webpack_require__(/*! core-js/modules/es.symbol.js */ "../node_modules/core-js/modules/es.symbol.js");',
  });

  await assertFileContains({
    file: 'symbol-polyfill.js',
    content: "var testSymbol = Symbol('testSymbol');",
  });
});
