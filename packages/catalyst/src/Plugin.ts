import { RuleSetRule, WebpackPluginInstance } from 'webpack';

import Configuration from './Configuration';

interface Plugin {
  modifyBabelPlugins?(
    plugins: Array<string | [string, Record<string, unknown>]>,
    configuration: Configuration
  ): Array<string | [string, Record<string, unknown>]>;

  modifyBabelPresets?(
    presets: Array<string | [string, Record<string, unknown>]>,
    configuration: Configuration
  ): Array<string | [string, Record<string, unknown>]>;

  modifyWebpackRules?(
    rules: readonly RuleSetRule[],
    configuration: Configuration
  ): RuleSetRule[];

  modifyWebpackPlugins?(
    plugins: readonly WebpackPluginInstance[],
    configuration: Configuration
  ): WebpackPluginInstance[];

  modifyNodePackages?(packages: readonly string[]): string[];

  modifyNodePackagesDev?(packages: readonly string[]): string[];
}

export default Plugin;
