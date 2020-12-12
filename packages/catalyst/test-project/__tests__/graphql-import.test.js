const assertFileContains = require('../assertFileContains');

test('transpiles graphql file imports', async () => {
  await assertFileContains({
    file: 'graphql-import.js',
    content: 'query HelloWorld'
  });

  await assertFileContains({
    file: 'graphql-import.js',
    content: 'module.exports["HelloWorld"] = oneQuery(doc, "HelloWorld");'
  });
});
