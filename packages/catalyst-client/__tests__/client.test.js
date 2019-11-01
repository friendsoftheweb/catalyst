import SockJS from "sockjs-client";

function value(predicate, expectedValue) {
  return new Promise((resolve, reject) => {
    const checkValue = () => {
      setTimeout(() => {
        const value = predicate();

        if (
          expectedValue === undefined ? value != null : value === expectedValue
        ) {
          resolve(value);
        } else {
          checkValue();
        }
      }, 0);
    };

    checkValue();
  });
}

test("a message is displayed while building", async () => {
  window.__CATALYST_ENV__ = {};

  require("../src/index");

  SockJS.message({
    type: "invalid"
  });

  const iframe = await value(() => document.querySelector("iframe"));

  const containerElement = await value(() =>
    iframe.contentDocument.querySelector("#container")
  );

  const messageElement = await value(() =>
    containerElement.querySelector(".activity-message")
  );

  const message = await value(() => messageElement.innerHTML);

  expect(message).toBe("Building...");

  SockJS.message({
    type: "still-ok"
  });

  await value(() => containerElement.innerHTML, "");
});

test("a compilation error is displayed", async () => {
  window.__CATALYST_ENV__ = {};

  require("../src/index");

  SockJS.message({
    type: "errors",
    data: ["/this/is/a/filepath.js"]
  });

  const iframe = await value(() => document.querySelector("iframe"));

  const containerElement = await value(() =>
    iframe.contentDocument.querySelector("#container")
  );

  const messageElement = await value(() =>
    containerElement.querySelector(".file-path")
  );

  const message = await value(() => messageElement.innerHTML);

  expect(message).toBe("/this/is/a/filepath.js");
});
