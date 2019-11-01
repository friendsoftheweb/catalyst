import { exec } from 'child_process';

import getProjectDependencies from './getProjectDependencies';

export default async function installMissingDependencies(
  dependencies: string[],
  development: boolean = false
): Promise<number | void> {
  const projectDependencies = await getProjectDependencies();

  const missingDependencies = dependencies.filter((dependency) => {
    const parts = /^(@?[^@]+)@?([^@]+)?/.exec(dependency);

    if (parts == null) {
      throw new Error(`Invalid dependency: ${dependency}`);
    }

    return !projectDependencies.includes(parts[1]);
  });

  if (missingDependencies.length === 0) {
    return;
  }

  console.log(
    `\nInstalling missing dependencies: ${missingDependencies.join(', ')}\n`
  );

  const flags = ['color'];

  if (development) {
    flags.push('dev');
  }

  const command = `yarn add ${missingDependencies.join(' ')} ${flags
    .map((flag) => `--${flag}`)
    .join(' ')}`;

  return new Promise((resolve, reject) => {
    const yarnProcess = exec(command, (error) => {
      if (error != null) {
        return reject(error);
      }

      resolve();
    });

    if (yarnProcess.stdout) {
      yarnProcess.stdout.pipe(process.stdout);
    }
  });
}
