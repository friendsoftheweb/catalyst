const assertFileContains = require('../assertFileContains');

const content = `
var Button = _styledComponents.default.button.withConfig({
  displayName: "styled-components__Button",
  componentId: "wgv8be-0"
})(["background-color:yellow;"]);
`;

test('build process transpiles styled-components', async () => {
  await assertFileContains({
    file: 'styled-components.js',
    content
  });
});
