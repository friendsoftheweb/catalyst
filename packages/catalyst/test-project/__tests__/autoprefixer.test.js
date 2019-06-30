const assertFileContains = require('../assertFileContains');

const content = `::-webkit-input-placeholder {
  color: gray; }
::-moz-placeholder {
  color: gray; }
:-ms-input-placeholder {
  color: gray; }
::-ms-input-placeholder {
  color: gray; }
::placeholder {
  color: gray; }
`;

test('build process transpiles dynamic import', async () => {
  await assertFileContains({
    file: 'autoprefixer.css',
    content
  });
});
