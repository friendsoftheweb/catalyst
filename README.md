# 🧪 Catalyst &middot; [![Build Status](https://travis-ci.org/friendsoftheweb/catalyst.svg?branch=master)](https://travis-ci.org/friendsoftheweb/catalyst)

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

Certain aspects of Catalyst can be configured by editing the `catalyst.config.json` file in the root of your project. Some options can also be configured via environment variables (which take precedence over the value in `catalyst.config.json`).

| Key                            | Environment Variable  | Type       | Description                                                                                                                                                                                |
| ------------------------------ | --------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **contextPath**                | N/A                   | `string`   | The path (relative to the root of your project) that webpack should treat as the [context](https://webpack.js.org/configuration/entry-context/#context) when requiring modules and assets. |
| **buildPath**                  | N/A                   | `string`   | The path (relative to the root of your project) where _test_ and _production_ builds will be output.                                                                                       |
| **publicPath**                 | N/A                   | `string`   | The the base URI used when generating paths for `<script />` and `<link />` tags.                                                                                                          |
| **overlayEnabled**             | N/A                   | `boolean`  | Display a custom overlay that shows build status, build errors, and runtime errors. This only applies to the _development_ environment.                                                    |
| **prebuiltModules**            | N/A                   | `string[]` | A list of modules which should be pre-built in the _development_ environment. This decreases the time spent on re-building entries by skipping the listed modules.                         |
| **transformedModules**         | N/A                   | `string[]` | A list of modules which should be [transformed and polyfilled via Babel](https://babeljs.io/docs/en/babel-preset-env).                                                                     |
| **generateServiceWorker**      | N/A                   | `boolean`  | Generate a separate file which will be registered as a [SeviceWorker](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker) and preload JavaScript, CSS, and other assets.       |
| **warnAboutDuplicatePackages** | N/A                   | `boolean`  | Log warnings if mulitple versions of the same package are required in the webpack dependency tree.                                                                                         |
| **ignoredDuplicatePackages**   | N/A                   | `string[]` | A list of modules to ignore when checking for duplicates. This has no effect if **warnAboutDuplicatePackages** is `false`.                                                                 |
| **devServerProtocol**          | `DEV_SERVER_PROTOCOL` | `string`   | The protocol (e.g. `"http"` or `"https"`) used for accessing the development server. Defaults to `"http"`.                                                                                 |
| **devServerHost**              | `DEV_SERVER_HOST`     | `string`   | The host for the development server. Defaults to `"localhost"`.                                                                                                                            |
| **devServerPort**              | `DEV_SERVER_PORT`     | `number`   | The port for the development server. Defaults to `8080`.                                                                                                                                   |

### Configuring Webpack

Catalyst automatically creates a webpack configuration that should
be sufficient for most projects. If a project does require manual webpack configuration, a `webpack.config.js` file can be added to the root of the project.

Catalyst exports function which returns Catalyst's default webpack configuration as an object:

```javascript
const { webpackConfig } = require('catalyst');

const customConfig = webpackConfig();

customConfig.module.rules.push({
  loader: 'my-custom-loader'
});

module.exports = customConfig;
```
