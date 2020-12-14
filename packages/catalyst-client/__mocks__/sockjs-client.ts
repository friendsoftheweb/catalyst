import { EventEmitter } from 'events';

const emitter = new EventEmitter();

class SockJSMock {
  static message(data: Record<string, unknown>) {
    emitter.emit('message', JSON.stringify(data));
  }

  private callbacks: Array<(message: { data: string }) => void> = [];

  constructor() {
    emitter.on('message', (data) => {
      for (const callback of this.callbacks) {
        callback({ data });
      }
    });
  }

  set onmessage(callback: (message: { data: string }) => void) {
    this.callbacks.push(callback);
  }
}

export default SockJSMock;
