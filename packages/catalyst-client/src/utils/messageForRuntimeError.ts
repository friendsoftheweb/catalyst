export const messageForRuntimeError = (error: Error): string | undefined => {
  if (error.name === 'TypeError') {
    return error.message;
  }

  if (error.name === 'ReferenceError') {
    return error.message;
  }

  if (error.message.startsWith('Element type is invalid')) {
    return error.message;
  }

  if (error.message.endsWith('is not a function')) {
    return error.message;
  }
};
