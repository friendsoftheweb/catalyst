/** @jsx h */
import { h } from 'preact';

import RuntimeErrors from '../RuntimeErrors';

export default {
  title: 'Runtime Errors',
  component: RuntimeErrors,
};

export const Count = () => <RuntimeErrors count={42} />;

export const CountMessage = () => (
  <RuntimeErrors count={42} message="Danger Will Robinson. Danger." />
);

export const CountMessageLocation = () => (
  <RuntimeErrors
    count={42}
    message="Danger Will Robinson. Danger."
    location="./self-destruct.js"
  />
);
