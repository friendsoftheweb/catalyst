# Catalyst &middot; [![Build Status](https://travis-ci.org/friendsoftheweb/catalyst.svg?branch=master)](https://travis-ci.org/friendsoftheweb/catalyst)

Catalyst is an opinionated tool for creating and maintaining React/Redux applications. It sets up Webpack, Flow, ESLint, React, Redux, Redux Saga, SASS, Autoprefixer, and more!

## Starting a New Project

```
$ yarn add catalyst
$ yarn run catalyst init
```

## Configuring Webpack

Catalyst provides a function which produces a webpack configuration that should
be sufficient for most projects. There some options which can be configured
by passing an object into the `config()` function call in
`client/config/webpack.js`:

```javascript
const config = require('catalyst/lib/config/webpack');

module.exports = config({
  transformModules: ['react', 'react-dom']
});
```

### Available Options

#### `transformModules`

An array of names for modules which should be transformed and polyfilled via
[Babel](https://babeljs.io/). If you are using modules which require polyfills
to work in all of your targeted browsers, you should include them in this array.
The appropriate polyfills will then be imported from core-js via
@babel/preset-env.

## Starting the Development Server

You can start the Webpack server with:

```
$ yarn start
```

By default, the server will be accessible at http://localhost:8080. You can override this by setting
`DEV_SERVER_HOST` and/or `DEV_SERVER_PORT` environment variables.

If you want to be able to access your development server from other devices on your local network,
you can start it like this:

```
$ DEV_SERVER_HOST=`ipconfig getifaddr en0` yarn start
```

Where `en0` is the network device you're using.

## Integrating with Rails

See: https://github.com/friendsoftheweb/catalyst-rails
