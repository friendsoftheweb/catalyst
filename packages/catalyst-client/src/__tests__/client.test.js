import 'regenerator-runtime';
import SockJS from 'sockjs-client';
import createOverlayFrame from '../utils/createOverlayFrame';

let mockFrame;

jest.mock('../utils/createOverlayFrame', () => {
  return async () => {
    return {
      frame: mockFrame,
    };
  };
});

beforeEach(() => {
  mockFrame = {
    style: {},
    contentWindow: {
      postMessage: jest.fn().mockName('postMessage'),
    },
  };
});

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

test('a message is displayed while building', async () => {
  window.__CATALYST_ENV__ = {
    devServerProtocol: 'https',
    devServerHost: 'localhost',
    devServerPort: '8080',
    contextPath: '/User/example/Projects/project/client',
  };

  require('../index');

  const { frame } = await createOverlayFrame();

  await delay(0);

  expect(frame.contentWindow.postMessage).not.toHaveBeenCalled();

  SockJS.message({
    type: 'invalid',
  });

  await delay(0);

  expect(frame.contentWindow.postMessage).toHaveBeenLastCalledWith(
    JSON.stringify({
      component: 'Activity',
      props: {
        message: 'Building...',
      },
    }),
    '*'
  );

  SockJS.message({
    type: 'still-ok',
  });

  await delay(0);

  expect(frame.contentWindow.postMessage).toHaveBeenLastCalledWith(
    JSON.stringify(null),
    '*'
  );
});

test('a compilation error is displayed', async () => {
  window.__CATALYST_ENV__ = {
    devServerProtocol: 'https',
    devServerHost: 'localhost',
    devServerPort: '8080',
    contextPath: '/User/example/Projects/project/client',
  };

  require('../index');

  const { frame } = await createOverlayFrame();

  await delay(0);

  expect(frame.contentWindow.postMessage).not.toHaveBeenCalled();

  SockJS.message({
    type: 'errors',
    data: [{ message: '/this/is/a/filepath.js' }],
  });

  await delay(0);

  expect(frame.contentWindow.postMessage).toHaveBeenLastCalledWith(
    JSON.stringify({
      component: 'CompilationError',
      props: {
        message: '/this/is/a/filepath.js',
        contextPath: '/User/example/Projects/project/client',
      },
    }),
    '*'
  );
});
