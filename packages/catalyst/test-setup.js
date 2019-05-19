const fs = require('fs');

if (!fs.existsSync('test-project')) {
  fs.mkdirSync('test-project');
}
