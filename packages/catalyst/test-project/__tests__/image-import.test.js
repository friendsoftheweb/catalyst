const assertFileContains = require('../assertFileContains');

const content = `/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dimensions", function() { return dimensions; });
/* harmony default export */ __webpack_exports__["default"] = ("/assets/this-is-fine.jpeg");
const dimensions = {
  width: 300,
  height: 168
};`;

test('assets are required using ES module syntax', async () => {
  await assertFileContains({
    file: 'image-import.js',
    content,
  });
});
