import {
  WebpackModuleNotFound,
  BabelBuildError,
  SassBuildError,
  parseBuildError,
} from '../parseBuildError';

import {
  WEBPACK_BUILD_ERROR,
  BABEL_BUILD_ERROR,
  SASS_BUILD_ERROR,
} from '../../support/buildErrors';

test('parsing a Webpack build error', () => {
  const result = parseBuildError(WEBPACK_BUILD_ERROR, {
    contextPath: '/Users/dan/Projects/lboy-website',
  });

  expect(result).toBeInstanceOf(WebpackModuleNotFound);

  expect(result.message).toEqual('Module not found: missing-package');

  expect(result.sourcePath).toEqual('client/bundles/application');

  expect(result.sourceCode).toEqual([]);

  expect(result.stackTrace).toEqual([]);
});

test('parsing a Babel build error', () => {
  const result = parseBuildError(BABEL_BUILD_ERROR, {
    contextPath: '/Users/dan/Projects/lboy-website',
  });

  expect(result).toBeInstanceOf(BabelBuildError);

  expect(result.message).toEqual(
    'JSX value should be either an expression or a quoted JSX text'
  );

  expect(result.sourcePath).toEqual('client/components/PosterCheckout.tsx');

  expect(result.sourceCode).toEqual([
    { number: 11, text: '   return (' },
    {
      number: 12,
      text: '     <ApolloProvider client={apolloClient}>',
    },
    {
      number: 13,
      text: '       <Router basename=*"/checkout/poster">',
      highlight: true,
    },
    {
      number: 14,
      text: '         <Switch>',
    },
    {
      number: 15,
      text: '           <Route path="/" exact>',
    },
    {
      number: 16,
      text: '             <PosterBuilder />',
    },
  ]);

  expect(result.stackTrace).toEqual([]);
});

test('parsing a SASS build error', () => {
  const result = parseBuildError(SASS_BUILD_ERROR, {
    contextPath: '/Users/dan/Projects/lboy-website',
  });

  expect(result).toBeInstanceOf(SassBuildError);

  expect(result.message).toEqual('Undefined variable: $missing-color');

  expect(result.sourcePath).toEqual('client/components/PosterPreview.scss');

  expect(result.sourceCode).toEqual([
    { number: 7, text: '   color: $missing-color;' },
  ]);

  expect(result.stackTrace).toEqual([]);
});
