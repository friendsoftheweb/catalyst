import chalk from 'chalk';
import { padStart } from 'lodash';

export default function logAction(action: string, filePath: string) {
  let color;

  switch (action) {
    case 'create':
    case 'identical':
      color = chalk.green;
      break;
    case 'skip':
      color = chalk.blue;
      break;
    case 'overwrite':
      color = chalk.red;
      break;
    default:
      color = chalk.grey;
  }

  console.log(`${color(padStart(action, 10))} ${filePath}`);
}
