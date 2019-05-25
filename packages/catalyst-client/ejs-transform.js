const ejs = require('ejs');

module.exports = {
  process(templateText) {
    return `
      ${ejs.compile(templateText, {
        client: true,
        _with: false
      })};

      module.exports = anonymous;
    `;
  }
};
