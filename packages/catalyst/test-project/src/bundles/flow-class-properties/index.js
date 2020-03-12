// @flow

import * as React from 'react';

class FlowClassProperties extends React.Component<{}> {
  foo: () => null;

  constructor(props) {
    super(...arguments);
    this.foo = this.foo.bind(this);
  }

  foo() {
    return null;
  }

  render() {
    return null;
  }
}
