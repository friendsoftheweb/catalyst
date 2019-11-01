import { RuleSetRule, Plugin as WebpackPlugin } from 'webpack';

import Configuration from './Configuration';

interface Plugin {
  modifyBabelPlugins?(
    plugins: Array<string | [string, object]>,
    configuration: Configuration
  ): Array<string | [string, object]>;

  modifyBabelPresets?(
    presets: Array<string | [string, object]>,
    configuration: Configuration
  ): Array<string | [string, object]>;

  modifyWebpackRules?(
    rules: readonly RuleSetRule[],
    configuration: Configuration
  ): RuleSetRule[];

  modifyWebpackPlugins?(
    plugins: readonly WebpackPlugin[],
    configuration: Configuration
  ): WebpackPlugin[];

  modifyNodePackages?(packages: readonly string[]): string[];

  modifyNodePackagesDev?(packages: readonly string[]): string[];
}

export default Plugin;
