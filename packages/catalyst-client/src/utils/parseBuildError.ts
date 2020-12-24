interface Options {
  contextPath: string;
}

export const parseBuildError = (
  error: string,
  options: Options
): BuildError => {
  if (/SyntaxError/.test(error)) {
    return new BabelBuildError(error, options);
  }

  if (/SassError/.test(error)) {
    return new SassBuildError(error, options);
  }

  if (/^ModuleNotFoundError/m.test(error)) {
    return new WebpackModuleNotFound(error, options);
  }

  if (/^Module build failed/m.test(error)) {
    return new WebpackModuleBuildFailed(error, options);
  }

  throw new Error('Failed to parse build error');
};

export interface Line {
  number?: number;
  text: string;
  highlight?: boolean;
}

export abstract class BuildError {
  protected readonly error: string;
  protected readonly contextPath: string;

  constructor(error: string, options: Options) {
    this.error = error;
    this.contextPath = options.contextPath;
  }

  abstract get message(): string | null;
  abstract get sourcePath(): string | null;

  get stackTrace(): Line[] {
    return [];
  }

  get sourceCode(): Line[] {
    const lines: Line[] = [];

    for (const line of this.error.split('\n')) {
      let matches;

      if ((matches = /^\s*(\d+)\s+[|│](.*)/.exec(line))) {
        const number = parseInt(matches[1], 10);
        const text = matches[2];

        lines.push({
          text,
          number,
        });

        continue;
      }

      if ((matches = /^>\s*(\d+)\s+[|│](.*)/.exec(line))) {
        const number = parseInt(matches[1], 10);
        const text = matches[2];

        lines.push({
          text,
          number,
          highlight: true,
        });

        continue;
      }
    }

    return lines;
  }
}

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export class BabelBuildError extends BuildError {
  get message() {
    const match = /^SyntaxError: [^:]+:\s*([^(]+)/m.exec(this.error);

    if (match == null) {
      return null;
    }

    return match[1].replace(/\s+$/, '');
  }

  get sourcePath() {
    const match = /SyntaxError: ([^:]+)/.exec(this.error);

    if (match == null) {
      throw new Error('Could not extract source path from build error');
    }

    return match[1].replace(this.contextPath, '').replace(/^\//, '');
  }

  get stackTrace() {
    return [];
  }
}

export class SassBuildError extends BuildError {
  get message() {
    const match = /^SassError: ([^.\n]+)/im.exec(this.error);

    if (match == null) {
      return null;
    }

    if (match[1] === 'Undefined variable') {
      const match2 = /^\s*\d+\s*│[^$]+([^;\n]+)/im.exec(this.error);

      if (match2 == null) {
        return 'Undefined variable';
      }

      return `Undefined variable: ${match2[1]}`;
    }

    return match[1];
  }

  get sourcePath() {
    const match = /^\s+([a-z0-9\-_/]+\.scss)\s+\d+:\d+\s+root stylesheet/im.exec(
      this.error
    );

    if (match == null) {
      throw new Error('Could not extract source path from build error');
    }

    return match[1];
  }

  get stackTrace() {
    return [];
  }
}

export class WebpackModuleNotFound extends BuildError {
  get message() {
    const match = /^ModuleNotFoundError: ([^:\n]+)/im.exec(this.error);

    if (match == null) {
      return null;
    }

    if (match[1] === 'Module not found') {
      const match2 = /can't resolve '([^']+)/i.exec(this.error);

      if (match2 == null) {
        return 'Module not found';
      }

      return `Module not found: ${match2[1]}`;
    }

    return match[1];
  }

  get sourcePath() {
    const match = /Can't resolve '[a-z0-9\-_]+' in '\.*([a-z0-9\-_/.]+)'$/im.exec(
      this.error
    );

    if (match == null) {
      throw new Error('Could not extract source path from build error');
    }

    return match[1].replace(this.contextPath, '').replace(/^\//, '');
  }

  get stackTrace() {
    return [];
  }
}

export class WebpackModuleBuildFailed extends BuildError {
  get message() {
    const match = /^Module build failed: ([^\n]+)/im.exec(this.error);

    if (match == null) {
      return null;
    }

    return match[1];
  }

  get sourcePath() {
    const match = /^\s+@ \.*\/?([a-z0-9\-_/.]+)$/im.exec(this.error);

    if (match == null) {
      throw new Error('Could not extract source path from build error');
    }

    return match[1].replace(this.contextPath, '');
  }

  get stackTrace() {
    return [];
  }
}
/* eslint-enable @typescript-eslint/explicit-module-boundary-types */
