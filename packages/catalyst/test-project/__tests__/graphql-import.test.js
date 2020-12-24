const assertFileContains = require('../assertFileContains');

test('transpiles graphql file imports', async () => {
  await assertFileContains({
    file: 'graphql-import.js',
    content: 'query HelloWorld',
  });

  await assertFileContains({
    file: 'graphql-import.js',
    content: 'module.exports.HelloWorld = oneQuery(doc, "HelloWorld");',
  });

  await assertFileContains({
    file: 'graphql-import.js',
    content:
      'var doc = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HelloWorld"},"variableDefinitions":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"helloWorld"},"arguments":[],"directives":[]}]}}],"loc":{"start":0,"end":34}};',
  });
});
