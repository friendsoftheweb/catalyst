import chalk from 'chalk';

export enum Status {
  Success,
  Warning,
  Error,
}

const formatStatus = (status: Status): { text: string; length: number } => {
  if (process.stdout.isTTY) {
    switch (status) {
      case Status.Success:
        return { text: chalk.black.bgGreen(' DONE '), length: 6 };

      case Status.Warning:
        return { text: chalk.black.bgYellow(' WARN '), length: 6 };

      case Status.Error:
        return { text: chalk.black.bgRed(' ERROR '), length: 7 };
    }
  } else {
    switch (status) {
      case Status.Success:
        return { text: '[DONE]', length: 6 };

      case Status.Warning:
        return { text: '[WARN]', length: 6 };

      case Status.Error:
        return { text: '[ERROR]', length: 7 };
    }
  }
};

export default function logStatus(status: Status, message: string) {
  const { text, length } = formatStatus(status);

  message = message
    .split('\n')
    .map((line, index) => {
      return index === 0 ? line : `${' '.repeat(length + 1)}${line}`;
    })
    .join('\n');

  console.log(`${text} ${message}\n`);
}
