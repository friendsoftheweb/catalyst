const assertFileContains = require('../assertFileContains');

const content = `/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "width", function() { return width; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "height", function() { return height; });
/* harmony default export */ __webpack_exports__["default"] = ("/assets/this-is-fine.jpeg");
const width = 300;
const height = 168;`;

test('assets are required using ES module syntax', async () => {
  await assertFileContains({
    file: 'image-import.js',
    content,
  });
});
