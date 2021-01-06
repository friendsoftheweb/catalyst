import { Compiler, WebpackPluginInstance } from 'webpack';
import { debugBuild } from '../../../debug';

export default class LogProgressPlugin implements WebpackPluginInstance {
  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap('LogProgressPlugin', (compilation) => {
      compilation.hooks.buildModule.tap('LogProgressPlugin', (module) => {
        // @ts-expect-error: Types are incorrect
        if (module.resource != null) {
          // @ts-expect-error: Types are incorrect
          debugBuild(`Building ${normalizePath(module.resource)}...`);
        }
      });
    });
  }
}

const normalizePath = (resource: string) => {
  return resource.replace(process.cwd(), '').replace(/^\//, '');
};
