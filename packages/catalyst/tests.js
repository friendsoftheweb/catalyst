#!/usr/bin/env node

const { execSync } = require('child_process');
const { readFileSync } = require('fs');
const { join } = require('path');

execSync('yarn build', { stdio: 'inherit' });

execSync('yarn install', {
  stdio: 'inherit',
  cwd: join(process.cwd(), 'test-project')
});

execSync('rm -rf dist', {
  stdio: 'inherit',
  cwd: join(process.cwd(), 'test-project')
});

execSync('NODE_ENV=test yarn run catalyst build', {
  stdio: 'inherit',
  cwd: join(process.cwd(), 'test-project')
});

const assertFileContains = ({ path, content }) => {
  if (!readFileSync(path).includes(content)) {
    throw new Error('Assertion Failed');
  }
};

assertFileContains({
  path: './test-project/dist/graphql-tag.js',
  content: `
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
`
});

assertFileContains({
  path: './test-project/dist/symbol-polyfill.js',
  content:
    '__webpack_require__(/*! core-js/modules/es.symbol */ "../node_modules/core-js/modules/es.symbol.js");'
});

assertFileContains({
  path: './test-project/dist/symbol-polyfill.js',
  content: "var testSymbol = Symbol('testSymbol');"
});

assertFileContains({
  path: './test-project/dist/object-rest-spread.js',
  content: `
var _one$two$three = {
  one: 1,
  two: 2,
  three: 3
},
    one = _one$two$three.one,
    two = _one$two$three.two,
    three = _one$two$three.three;
`
});
