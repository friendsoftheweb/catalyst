const assertFileContains = require('../assertFileContains');

const content = `
var _one$two$three = {
  one: 1,
  two: 2,
  three: 3
},
    one = _one$two$three.one,
    two = _one$two$three.two,
    three = _one$two$three.three;
`;

test('build process transpiles object rest spread syntax', async () => {
  await assertFileContains({
    file: 'object-rest-spread.js',
    content
  });
});
