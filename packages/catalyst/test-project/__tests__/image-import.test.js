const assertFileContains = require('../assertFileContains');

const content = `/* harmony default export */ __webpack_exports__["default"] = ({
        srcSet:"/assets/assets/this-is-fine-100.jpeg",
        images:[{path:"/assets/assets/this-is-fine-100.jpeg",width:100,height:100}],
        src: "/assets/assets/this-is-fine-100.jpeg",
        toString:function(){return "/assets/assets/this-is-fine-100.jpeg"}
      });`;

test('assets are required using ES module syntax', async () => {
  await assertFileContains({
    file: 'image-import.js',
    content,
  });
});
