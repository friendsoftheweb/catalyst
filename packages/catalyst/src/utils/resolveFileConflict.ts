import inquirer from 'inquirer';
import chalk from 'chalk';
import diffExistingFile from './diffExistingFile';

export default async function resolveFileConflict(
  filePath: string,
  fileContent: string
): Promise<'overwrite' | 'skip'> {
  process.stderr.write('\n');

  const config = await inquirer.prompt<{
    resolution: 'overwrite' | 'skip' | 'diff';
  }>([
    {
      name: 'resolution',
      message: `File exists: '${filePath}'. Overwrite?`,
      type: 'expand',
      choices: [
        { name: 'Yes, Overwrite', key: 'y', value: 'overwrite' },
        { name: 'No, Skip', key: 'n', value: 'skip' },
        { name: 'Diff', key: 'd', value: 'diff' },
      ],
      default: 1,
    },
  ]);

  if (config.resolution === 'diff') {
    const diff = await diffExistingFile(filePath, fileContent);

    process.stderr.write('\n');

    diff.forEach((part) => {
      let value: string;

      if (part.added) {
        value = chalk.green(part.value);
      } else if (part.removed) {
        value = chalk.red(part.value);
      } else {
        value = chalk.white(part.value);
      }

      process.stderr.write(value);
    });

    return resolveFileConflict(filePath, fileContent);
  } else {
    return config.resolution;
  }
}
