const { camelCase, snakeCase, upperFirst } = require('lodash');

function classify(string) {
  return upperFirst(camelCase(string));
}

function dasherize(string) {
  return snakeCase(string).replace(/_/g, '-');
}

module.exports = {
  classify,
  dasherize
};
