import chalk from 'chalk';

const STATUS_TEXT = {
  SUCCESS: chalk.black.bgGreen(' DONE '),
  WARNING: chalk.black.bgYellow(' WARN '),
  ERROR: chalk.black.bgRed(' ERROR ')
};

type Status = 'SUCCESS' | 'WARNING' | 'ERROR';

export default function logStatus(status: Status, message: string) {
  console.log(`\n${STATUS_TEXT[status]} ${message}`);
}
