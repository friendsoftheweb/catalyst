/** @jsx h */
import { h } from 'preact';

import CompilationError from '../CompilationError';

export default {
  title: 'Compilation Error',
  component: CompilationError,
};

const javaScriptMessage = `
./this/is/the/filepath.js

  57 | for (let line of message.split('\\n')) {
  58 | // Skip JavaScript stacktrace lines
> 59 | if (/^\\s+at Object/.test(line)) {
  60 |   continue;
  61 | }
`;

export const JavaScript = () => (
  <CompilationError message={javaScriptMessage} />
);

const sassMessage = `
./this/is/the/filepath.scss
    ╷
123 │ .CompilationErrorMessage {
124 │   box-sizing: border-box;
125 │   flex: 1;
126 │   width: 100%;
    ╵

hello.lkjdslkfjs 33:43
`;

export const Sass = () => <CompilationError message={sassMessage} />;
