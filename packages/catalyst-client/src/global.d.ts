declare module '*.ejs' {
  export default function (context: Record<string, unknown>): string;
}
