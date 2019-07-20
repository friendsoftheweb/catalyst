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
    rules: RuleSetRule[],
    configuration: Configuration
  ): RuleSetRule[];

  modifyWebpackPlugins?(
    plugins: WebpackPlugin[],
    configuration: Configuration
  ): WebpackPlugin[];
}

export default Plugin;
