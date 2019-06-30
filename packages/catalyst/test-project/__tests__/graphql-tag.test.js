const assertFileContains = require('../assertFileContains');

const content = `
var QUERY = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
      "kind": "Name",
      "value": "HelloWorld"
    },
    "variableDefinitions": [],
    "directives": [],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "helloWorld"
        },
        "arguments": [],
        "directives": []
      }]
    }
  }],
  "loc": {
    "start": 0,
    "end": 41,
    "source": {
      "body": "\\n  query HelloWorld {\\n    helloWorld\\n  }\\n",
      "name": "GraphQL request",
      "locationOffset": {
        "line": 1,
        "column": 1
      }
    }
  }
};
`;

test('transpiles graphql tags', async () => {
  await assertFileContains({
    file: 'graphql-tag.js',
    content
  });
});
