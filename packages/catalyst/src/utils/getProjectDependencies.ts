import fs from 'fs';
import path from 'path';

export default async function getProjectDependencies(): Promise<string[]> {
  const packageFilePath = path.join(process.cwd(), 'package.json');

  return new Promise((resolve) => {
    fs.exists(packageFilePath, (exists) => {
      if (!exists) {
        throw new Error(
          `Missing "package.json" in project root: ${process.cwd()}`
        );
      }

      fs.readFile(packageFilePath, (error, data) => {
        if (error) {
          throw new Error(`Invalid "package.json" file: ${packageFilePath}`);
        }

        const { dependencies = {}, devDependencies = {} } = JSON.parse(
          data.toString()
        );

        resolve([
          ...Object.keys(dependencies),
          ...Object.keys(devDependencies)
        ]);
      });
    });
  });
}
