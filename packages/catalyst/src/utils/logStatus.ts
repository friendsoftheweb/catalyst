import chalk from 'chalk';
import stripANSI from 'strip-ansi';

export enum Status {
  Success,
  Warning,
  Error,
}

const TEXT_STYLES = {
  [Status.Warning]: chalk.yellow,
  [Status.Error]: chalk.red,
};

const LINE_STYLES = {
  [Status.Warning]: chalk.dim.yellow,
  [Status.Error]: chalk.dim.red,
};

const logStatus = (
  status: Status,
  message: string,
  location?: string
): void => {
  const heading = formatStatus(status);

  if (status === Status.Success) {
    console.log(`${heading} ${message}`);
    return;
  }

  console.log(
    formatSection({
      heading,
      message,
      location,
      textStyle: TEXT_STYLES[status],
      lineStyle: LINE_STYLES[status],
    })
  );
};

const formatStatus = (status: Status): string => {
  if (process.stdout.isTTY) {
    switch (status) {
      case Status.Success:
        return chalk.black.bgGreen(' DONE ');

      case Status.Warning:
        return chalk.black.bgYellow(' WARN ');

      case Status.Error:
        return chalk.black.bgRed(' ERROR ');
    }
  } else {
    switch (status) {
      case Status.Success:
        return '[DONE]';

      case Status.Warning:
        return '[WARN]';

      case Status.Error:
        return '[ERROR]';
    }
  }
};

const formatSection = (options: {
  heading: string;
  message: string;
  location?: string;
  textStyle(...text: unknown[]): string;
  lineStyle(...text: unknown[]): string;
}) => {
  const { message, heading, location, textStyle, lineStyle } = options;
  const headingLength = stripANSI(heading).length;

  if (!process.stdout.isTTY) {
    return `${heading}\n\n${message}\n\n`;
  }

  const formattedMessage = message
    .split('\n')
    .map((line) => `${' '.repeat(3)}${line}`)
    .join('\n');

  const lineLength =
    process.stdout.columns -
    headingLength -
    3 -
    (location != null ? location.length + 1 : 0);

  return `${lineStyle('⋯')} ${heading} ${lineStyle(
    '⋯'.repeat(lineLength)
  )}${textStyle(
    location != null ? ` ${location}` : ''
  )}\n\n${formattedMessage}\n\n`;
};

export default logStatus;
