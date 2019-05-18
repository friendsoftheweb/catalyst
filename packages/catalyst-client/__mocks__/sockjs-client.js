const { EventEmitter } = require("events");

const emitter = new EventEmitter();

class SockJSMock {
  static message(data) {
    emitter.emit("message", JSON.stringify(data));
  }

  constructor() {
    emitter.on("message", data => {
      this.onmessage({ data });
    });
  }
}

module.exports = SockJSMock;
