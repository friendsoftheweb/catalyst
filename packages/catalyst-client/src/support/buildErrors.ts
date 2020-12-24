export const WEBPACK_BUILD_ERROR = `ModuleNotFoundError: Module not found: Error: Can't resolve 'missing-package' in '/Users/dan/Projects/lboy-website/client/bundles/application'
at /Users/dan/Projects/catalyst/packages/catalyst/node_modules/webpack/lib/Compilation.js:925:10
at /Users/dan/Projects/catalyst/packages/catalyst/node_modules/webpack/lib/NormalModuleFactory.js:401:22
at /Users/dan/Projects/catalyst/packages/catalyst/node_modules/webpack/lib/NormalModuleFactory.js:130:21
at /Users/dan/Projects/catalyst/packages/catalyst/node_modules/webpack/lib/NormalModuleFactory.js:224:22
at /Users/dan/Projects/catalyst/packages/catalyst/node_modules/neo-async/async.js:2830:7
at /Users/dan/Projects/catalyst/packages/catalyst/node_modules/neo-async/async.js:6877:13
at /Users/dan/Projects/catalyst/packages/catalyst/node_modules/webpack/lib/NormalModuleFactory.js:214:25
at /Users/dan/Projects/catalyst/packages/catalyst/node_modules/enhanced-resolve/lib/Resolver.js:213:14
at /Users/dan/Projects/catalyst/packages/catalyst/node_modules/enhanced-resolve/lib/Resolver.js:285:5
at eval (eval at create (/Users/dan/Projects/catalyst/packages/catalyst/node_modules/tapable/lib/HookCodeFactory.js:33:10), <anonymous>:15:1)`;

// export const WEBPACK_BUILD_ERROR = `ERROR in ../node_modules/react-stripe-elements/es/index.js
// Module build failed: Error: ENOENT: no such file or directory, open '/Users/dan/Projects/lboy-website/node_modules/react-stripe-elements/es/index.js'
//  @ ./components/PosterPayment.tsx 27:0-49 124:42-50
//  @ ./components/PosterCheckout.tsx
//  @ ./bundles/application/index.tsx
//  @ multi /Users/dan/Projects/catalyst/packages/catalyst/lib/dev-environment catalyst-client ./bundles/application/index.tsx`;

export const BABEL_BUILD_ERROR = `ERROR in ./components/PosterCheckout.tsx
Module build failed (from /Users/dan/Projects/catalyst/packages/catalyst/node_modules/babel-loader/lib/index.js):
SyntaxError: /Users/dan/Projects/lboy-website/client/components/PosterCheckout.tsx: JSX value should be either an expression or a quoted JSX text (13:23)

  11 |   return (
  12 |     <ApolloProvider client={apolloClient}>
> 13 |       <Router basename=*"/checkout/poster">
     |                        ^
  14 |         <Switch>
  15 |           <Route path="/" exact>
  16 |             <PosterBuilder />
    at Object._raise (/Users/dan/Projects/catalyst/packages/catalyst/node_modules/@babel/parser/lib/index.js:748:17)
    at Object.raiseWithData (/Users/dan/Projects/catalyst/packages/catalyst/node_modules/@babel/parser/lib/index.js:741:17)
    at Object.raise (/Users/dan/Projects/catalyst/packages/catalyst/node_modules/@babel/parser/lib/index.js:735:17)
    at Object.jsxParseAttributeValue (/Users/dan/Projects/catalyst/packages/catalyst/node_modules/@babel/parser/lib/index.js:4593:20)
    at Object.jsxParseAttribute (/Users/dan/Projects/catalyst/packages/catalyst/node_modules/@babel/parser/lib/index.js:4632:44)
    at Object.jsxParseOpeningElementAfterName (/Users/dan/Projects/catalyst/packages/catalyst/node_modules/@babel/parser/lib/index.js:4652:28)
    at Object.jsxParseOpeningElementAfterName (/Users/dan/Projects/catalyst/packages/catalyst/node_modules/@babel/parser/lib/index.js:7315:18)
    at Object.jsxParseOpeningElementAt (/Users/dan/Projects/catalyst/packages/catalyst/node_modules/@babel/parser/lib/index.js:4645:17)
    at Object.jsxParseElementAt (/Users/dan/Projects/catalyst/packages/catalyst/node_modules/@babel/parser/lib/index.js:4677:33)
    at Object.jsxParseElementAt (/Users/dan/Projects/catalyst/packages/catalyst/node_modules/@babel/parser/lib/index.js:4693:32)
 @ ./bundles/application/index.tsx 13:0-55 60:38-52
 @ multi /Users/dan/Projects/catalyst/packages/catalyst/lib/dev-environment catalyst-client ./bundles/application/index.tsx`;

export const SASS_BUILD_ERROR = `ERROR in ./components/PosterPreview.scss (/Users/dan/Projects/catalyst/packages/catalyst/node_modules/css-loader/dist/cjs.js??ref--4-1!/Users/dan/Projects/catalyst/packages/catalyst/node_modules/postcss-loader/dist/cjs.js??ref--4-2!/Users/dan/Projects/catalyst/packages/catalyst/lib/config/webpack/loaders/checkUrlPathsLoader.js!/Users/dan/Projects/catalyst/packages/catalyst/node_modules/sass-loader/dist/cjs.js??ref--4-4!./components/PosterPreview.scss)
Module build failed (from /Users/dan/Projects/catalyst/packages/catalyst/node_modules/sass-loader/dist/cjs.js):
SassError: Undefined variable.
  ╷
7 │   color: $missing-color;
  │          ^^^^^^^^^^^^^^
  ╵
  client/components/PosterPreview.scss 7:10  root stylesheet
 @ ./components/PosterPreview.scss 2:12-394 9:17-24 13:7-14 45:20-27 47:4-60:5 49:6-59:7 50:38-45 56:26-33 58:21-28 68:15-22
 @ ./components/PosterPreview.tsx
 @ ./components/PosterBuilder.tsx
 @ ./components/PosterCheckout.tsx
 @ ./bundles/application/index.tsx
 @ multi /Users/dan/Projects/catalyst/packages/catalyst/lib/dev-environment catalyst-client ./bundles/application/index.tsx`;
