import { EventEmitter } from 'events';

const emitter = new EventEmitter();

class SockJSMock {
  static message(data) {
    emitter.emit('message', JSON.stringify(data));
  }

  callbacks = [];

  constructor() {
    emitter.on('message', (data) => {
      for (const callback of this.callbacks) {
        callback({ data });
      }
    });
  }

  set onmessage(callback) {
    this.callbacks.push(callback);
  }
}

export default SockJSMock;
