import stripAnsi from 'strip-ansi';

function formatCompiliationError(message: string) {
  return message
    .split('\n')
    .map((line, index) => {
      if (index === 0) {
        return `<div class="file-path">${line}</div>`;
      }

      if (/^\s*$/.test(line)) {
        return '<br />';
      }

      // Remove ANSI color characters
      line = stripAnsi(line);

      // HTML escape less-than characters
      line = line.replace(/</g, '&lt;');

      // HTML escape greater-than characters
      line = line.replace(/([^^])(>)/g, '$1&gt;');

      // Remove stacktrace lines
      if (/^\s+at Object/.test(line)) {
        return null;
      }

      if (/^>\s+\d+?\s+\|/.test(line)) {
        line = line.replace(/^>/, ' ');

        return `<div class="code-line highlighted">${line}</div>`;
      }

      if (/^\s+|\s+\^/.test(line)) {
        line = line.replace('^', '<span class="code-line-indicator">^</span>');

        return `<div class="code-line">${line}</div>`;
      }

      if (/^\s+(\d+)?\s+\|/.test(line)) {
        return `<div class="code-line">${line}</div>`;
      }

      return `<div>${line}</div>`;
    })
    .filter((line) => line != null)
    .join('');
}

export default formatCompiliationError;
