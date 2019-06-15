import path from 'path';
import chalk from 'chalk';
import webpack from 'webpack';
import Configuration from '../../Configuration';

export default async function prebuildVendorPackages() {
  const {
    rootPath,
    contextPath,
    tempPath,
    prebuiltModules
  } = new Configuration();

  return new Promise((resolve, reject) => {
    const { dependencies = {}, devDependencies = {} } = require(path.join(
      rootPath,
      'package.json'
    ));

    const projectDependencies = [
      ...Object.keys(dependencies),
      ...Object.keys(devDependencies)
    ];

    const modulesToPrebuild = prebuiltModules.filter((prebuiltModule) =>
      projectDependencies.includes(prebuiltModule)
    );

    if (modulesToPrebuild.length === 0) {
      return resolve();
    }

    console.log(`\nPrebuilding ${modulesToPrebuild.length} package(s)...\n`);

    const compiler = webpack({
      context: contextPath,
      mode: 'development',

      resolve: {
        modules: ['node_modules']
      },

      entry: {
        vendor: modulesToPrebuild
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

    compiler.run((err, stats) => {
      if (err != null) {
        reject(err);
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
