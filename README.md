# Catalyst

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
