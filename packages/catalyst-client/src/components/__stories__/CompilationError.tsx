/** @jsx h */
import { h } from 'preact';

import CompilationError from '../CompilationError';

import {
  SASS_BUILD_ERROR,
  BABEL_BUILD_ERROR,
  WEBPACK_BUILD_ERROR,
} from '../../support/buildErrors';

export default {
  title: 'Compilation Error',
  component: CompilationError,
};

export const BabelBuildError = () => (
  <CompilationError
    message={BABEL_BUILD_ERROR}
    contextPath="/Users/dan/Projects/lboy-website/client"
  />
);

export const SassBuildError = () => (
  <CompilationError
    message={SASS_BUILD_ERROR}
    contextPath="/Users/dan/Projects/lboy-website/client"
  />
);

export const WebpackBuildError = () => (
  <CompilationError
    message={WEBPACK_BUILD_ERROR}
    contextPath="/Users/dan/Projects/lboy-website/client"
  />
);
