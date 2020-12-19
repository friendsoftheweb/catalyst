# 🧪 Catalyst &middot; ![CI](https://github.com/friendsoftheweb/catalyst/workflows/CI/badge.svg)

Catalyst is an opinionated tool for creating and maintaining React applications. It sets up webpack, TypeScript, React, Apollo, SASS, Autoprefixer, and more!

## Starting a New Project

```
$ yarn add catalyst
$ yarn run catalyst init
```

## Starting the Development Server

You can start the development server with:

```
$ NODE_ENV=development yarn run catalyst server
```

By default, the server will be accessible at http://localhost:8080. You can override this by setting
`DEV_SERVER_PROTOCOL`, `DEV_SERVER_HOST` and/or `DEV_SERVER_PORT` environment variables.

If you want to be able to access your development server from other devices on your local network,
you can start it like this:

```
$ DEV_SERVER_HOST=`ipconfig getifaddr en0` yarn start
```

Where `en0` is the network device you're using.

## Integrating with Rails

See: https://github.com/friendsoftheweb/catalyst-rails

## Configuration

Certain aspects of Catalyst can be configured by editing the `catalyst.config.json` file in the root of your project. Some options can also be configured via environment variables (which take precedence over the value in `catalyst.config.json`). _The server must be restarted before any changes to the configuration will take effect._

| Key                              | Environment Variable  | Type                                                     | Description                                                                                                                                                                                |
| -------------------------------- | --------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **contextPath**                  | N/A                   | `string`                                                 | The path (relative to the root of your project) that webpack should treat as the [context](https://webpack.js.org/configuration/entry-context/#context) when requiring modules and assets. |
| **buildPath**                    | N/A                   | `string`                                                 | The path (relative to the root of your project) where _test_ and _production_ builds will be output.                                                                                       |
| **publicPath**                   | N/A                   | `string`                                                 | The the base URI used when generating paths for `<script />` and `<link />` tags.                                                                                                          |
| **overlayEnabled**               | N/A                   | `boolean`                                                | Display a custom overlay that shows build status, build errors, and runtime errors. This only applies to the _development_ environment.                                                    |
| **prebuiltPackages**             | N/A                   | `string[]`                                               | A list of npm packages which should be pre-built in the _development_ environment. This decreases the time spent on re-building entries by skipping the listed packages.                   |
| **transformedPackages**          | N/A                   | `string[]`                                               | A list of npm packages which should be [transformed and polyfilled via Babel](https://babeljs.io/docs/en/babel-preset-env).                                                                |
| **generateServiceWorker**        | N/A                   | `boolean`                                                | Generate a separate file which will be registered as a [SeviceWorker](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker) and preload JavaScript, CSS, and other assets.       |
| **checkForCircularDependencies** | N/A                   | `boolean`                                                | Show warnings in _development_ and errors in other in environments if a circular dependency is detected.                                                                                   |
| **checkForDuplicatePackages**    | N/A                   | `boolean`                                                | Show warnings if multiple versions of the same package are required in the webpack dependency tree.                                                                                        |
| **ignoredDuplicatePackages**     | N/A                   | `string[]`                                               | A list of npm packages to ignore when checking for duplicates. This has no effect if **checkForDuplicatePackages** is `false`.                                                             |
| **devServerHost**                | `DEV_SERVER_HOST`     | `string`                                                 | The host for the development server. Defaults to `"localhost"`.                                                                                                                            |
| **devServerPort**                | `DEV_SERVER_PORT`     | `number`                                                 | The port for the development server. Defaults to `8080`.                                                                                                                                   |
| **devServerProtocol**            | `DEV_SERVER_PROTOCOL` | `string`                                                 | The protocol (e.g. `"http"` or `"https"`) used for accessing the development server. Defaults to `"http"`.                                                                                 |
| **devServerCertificate**         | N/A                   | `{ keyPath: string; certPath: string; caPath: string; }` | The certificate file paths for running the server with SSL support.                                                                                                                        |

### Configuring Webpack

Catalyst automatically creates a webpack configuration that should
be sufficient for most projects. If a project does require manual webpack configuration, a `webpack.config.js` file can be added to the root of the project.

Catalyst exports a function which returns Catalyst's default webpack configuration as an object:

```javascript
const { webpackConfig } = require('catalyst');

const customConfig = webpackConfig();

customConfig.module.rules.push({
  loader: 'my-custom-loader',
});

module.exports = customConfig;
```

### Prefetching Important Assets

Catalyst has experimental support for generating a list of files to [prefetch](https://developer.mozilla.org/en-US/docs/Web/HTTP/Link_prefetching_FAQ) (via `<link rel="prefetch" />`). The files associated with any chunk which includes a JavaScript or TypeScript file with a `// @catalyst-prefetch` comment in it will be added to a `prefetch.json` file that's output during any non-development build.

This file can be used to generate link tags to allow important assets to be fetched before a user navigates to a part of the site that requires them. For example, to start loading the assets required for the checkout process before a user reaches the checkout process, a hypothetical "Checkout" component could be updated to include the `@catalyst-prefetch` directive:

```js
// @catalyst-prefetch

import React from 'react';

const Checkout = () => {
  return (
    // ...
  )
}
```

_NOTE:_ This will have no effect if the file is included in an "entry" chunk (i.e. the file is not part of a [dynamically imported](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Dynamic_Imports) chunk).

### Analyzing Webpack Output

The size of the bundles output by webpack can be visualized using [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer). You can open the analyzer by starting Catalyst server with the `--bundle-analyzer` option:

```
$ NODE_ENV=development yarn run catalyst server --bundle-analyzer
```
