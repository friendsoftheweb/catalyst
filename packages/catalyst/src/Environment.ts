export enum Environment {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

export function isEnvironment(value: unknown): value is Environment {
  return (
    typeof value === 'string' &&
    ['development', 'test', 'production'].includes(value)
  );
}
