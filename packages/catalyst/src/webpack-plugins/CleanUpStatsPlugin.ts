import { Compiler } from 'webpack';

/**
 * Removes excessive output from mini-css-extract-plugin.
 * See: https://github.com/webpack-contrib/mini-css-extract-plugin/issues/168#issuecomment-420095982
 */
export default class CleanUpStatsPlugin {
  shouldPickStatChild(child: { name: string }) {
    return child.name.indexOf('mini-css-extract-plugin') !== 0;
  }

  apply(compiler: Compiler) {
    compiler.hooks.done.tap('CleanUpStatsPlugin', (stats) => {
      const { children } = stats.compilation;

      if (Array.isArray(children)) {
        // eslint-disable-next-line no-param-reassign
        stats.compilation.children = children.filter((child) =>
          this.shouldPickStatChild(child)
        );
      }
    });
  }
}
