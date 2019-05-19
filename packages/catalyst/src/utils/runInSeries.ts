export default async function runInSeries(
  functions: Array<() => Promise<any>>
) {
  for (const func of functions) {
    await func();
  }
}
