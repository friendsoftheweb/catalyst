# Catalyst &middot; [![Build Status](https://travis-ci.org/friendsoftheweb/catalyst.svg?branch=master)](https://travis-ci.org/friendsoftheweb/catalyst)

Catalyst is an opinionated tool for creating and maintaining React/Redux applications. It sets up Webpack, Flow, ESLint, React, Redux, Redux Saga, SASS, Autoprefixer, and more!

## Starting a New Project

```
$ yarn global add @ftw/catalyst
$ catalyst init
```

## Basic Project Structure

<pre>
├─ bundles
|  └─ application
|     ├─ <b>index.js</b>
|     ├─ <b>reducer.js</b>
|     ├─ <b>saga.js</b>
|     ├─ <b>store-provider.js</b>
|     └─ <b>styles.scss</b>
|
├─ components
|  ├─ __tests__
|  └─ component-name
|     ├─ <b>index.js</b>
|     ├─ styles.scss
|     └─ sub-component-name
|        ├─ <b>index.js</b>
|        └─ styles.scss
|
├─ modules
|  └─ module-name
|     ├─ __tests__
|     ├─ <b>index.js</b>
|     ├─ <b>reducer.js</b>
|     ├─ <b>action-creators.js</b>
|     ├─ saga.js
|     ├─ requests.js
|     └─ getters.js
|
├─ utils
|  └─ request.js
|
├─ config
|  └─ webpack.js
|
└─ styles
   └─ index.scss
</pre>

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