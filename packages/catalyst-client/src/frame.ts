import { h, render } from 'preact';

import Activity from './components/Activity';
import RuntimeErrors from './components/RuntimeErrors';
import CompilationError from './components/CompilationError';
import { FrameState } from './types';

let state: FrameState = null;

window.addEventListener('message', (event) => {
  state = JSON.parse(event.data);

  if (state != null) {
    switch (state.component) {
      case 'Activity':
        render(h(Activity, state.props), document.body);
        break;

      case 'CompilationError':
        render(h(CompilationError, state.props), document.body);
        break;

      case 'RuntimeErrors':
        render(h(RuntimeErrors, state.props), document.body);
        break;
    }
  } else {
    render(null, document.body);
  }
});
