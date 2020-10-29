const assertFileContains = require('../assertFileContains');

const content = `.example {
  -webkit-user-select: none;
      -ms-user-select: none;
          user-select: none; }
`;

test('build process transpiles dynamic import', async () => {
  await assertFileContains({
    file: 'autoprefixer.css',
    content
  });
});
