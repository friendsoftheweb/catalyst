import path from 'path';
import chalk from 'chalk';
import webpack from 'webpack';
import getProjectDependencies from '../../utils/getProjectDependencies';
import Configuration from '../../Configuration';

export default async function prebuildVendorPackages() {
  const { contextPath, tempPath, prebuiltPackages } = new Configuration();
  const projectDependencies = await getProjectDependencies();

  const packagesToPrebuild = prebuiltPackages.filter((prebuiltPackage) =>
    projectDependencies.includes(prebuiltPackage)
  );

  if (packagesToPrebuild.length === 0) {
    return;
  }

  console.log(`\nPrebuilding packages: ${packagesToPrebuild.join(', ')}\n`);

  const compiler = webpack({
    context: contextPath,
    mode: 'development',

    resolve: {
      modules: ['node_modules']
    },

    entry: {
      vendor: packagesToPrebuild
    },

    plugins: [
      new webpack.DllPlugin({
        name: '[name]',
        path: path.join(tempPath, '[name].json')
      })
    ],

    output: {
      filename: '[name]-dll.js',
      path: tempPath,
      library: '[name]'
    }
  });

  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error != null) {
        reject(error);
      } else {
        const { errors, warnings } = stats.toJson({
          all: false,
          warnings: true,
          errors: true
        });

        if (errors.length > 0) {
          reject(new Error(errors[0]));
        } else {
          if (warnings.length > 0) {
            console.log(chalk.yellow(warnings.join('\n\n')));
          }

          resolve({ stats });
        }
      }
    });
  });
}
