import { map } from 'lodash';

import { log, classify } from '../utils';

import generateComponent from './generate/component';
import generateModule from './generate/module';

export default function generate(type: string, moduleName: string) {
  type = type.replace(/\s/g, '');

  const moduleNameParts = map(moduleName.split(/[./]/), classify);

  switch (type) {
    case 'component':
      generateComponent(moduleNameParts);
      break;
    case 'module':
      generateModule(moduleNameParts);
      break;
    default:
      log.exitWithError(
        `Unknown type '${type}'. Options are 'component' and 'module'.`
      );
  }
}

module.exports = generate;
