const assertFileContains = require('../assertFileContains');

const content = `module.exports = "/assets/this-is-fine.jpeg";`;

test('assets are required using CommonJS module syntax instead of ES module syntax', async () => {
  await assertFileContains({
    file: 'image-require.js',
    content
  });
});
