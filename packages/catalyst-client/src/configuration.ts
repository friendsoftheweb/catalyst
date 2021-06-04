if (window.__CATALYST__ == null) {
  throw new Error(
    'Catalyst client configuration is missing. Make sure the major version of "catalyst-client" matches the major version of "catalyst".'
  );
}

const { contextPath, devServerProtocol, devServerHost, devServerPort } =
  window.__CATALYST__;

const ignoredRuntimeErrors = (
  window.__CATALYST__.ignoredRuntimeErrors ?? []
).map((pattern) => new RegExp(pattern, 'u'));

export {
  contextPath,
  devServerProtocol,
  devServerHost,
  devServerPort,
  ignoredRuntimeErrors,
};
