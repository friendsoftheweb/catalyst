import path from 'path';
import fs from 'fs';

type Environment = 'development' | 'test' | 'production';

function isEnvironment(value: any): value is Environment {
  return ['development', 'test', 'production'].includes(value);
}

interface CustomConfiguration {
  contextPath: string;
  buildPath: string;
  publicPath: string;
  overlayEnabled?: boolean;
  prebuiltModules?: string[];
  transformedModules?: string[];
  generateServiceWorker?: boolean;
  warnAboutDuplicatePackages?: boolean;
  ignoredDuplicatePackages?: string[];
  devServerProtocol?: string;
  devServerHost?: string;
  devServerPort?: number;
}

const defaultPrebuiltModules = [
  '@reach/router',
  'apollo-cache-inmemory',
  'apollo-client',
  'apollo-link',
  'apollo-link-http',
  'axios',
  'catalyst-client',
  'classnames',
  'lodash',
  'react',
  'react-apollo',
  'react-dom',
  'react-router',
  'react-router-dom',
  'react-redux',
  'redux',
  'redux-logger',
  'redux-saga',
  'regenerator-runtime'
];

const defaultTransformedModules = [
  '@reach/router',
  'apollo-cache-inmemory',
  'apollo-client',
  'apollo-link',
  'apollo-link-http',
  'axios',
  'luxon',
  'react',
  'react-apollo',
  'react-dom',
  'react-router',
  'react-router-dom',
  'react-transition-group',
  'redux',
  'redux-saga'
];

const defaultIgnoredDuplicatePackages = [
  'prop-types',
  'hoist-non-react-statics'
];

function isCustomConfiguration(value: any): value is CustomConfiguration {
  if (value == null) {
    return false;
  }

  if (typeof value !== 'object') {
    return false;
  }

  // TODO: Validate custom root path
  if (typeof value.contextPath !== 'string') {
    return false;
  }

  if (typeof value.buildPath !== 'string') {
    return false;
  }

  // TODO: Validate custom public path
  if (typeof value.publicPath !== 'string') {
    return false;
  }

  if (
    'webpack' in value &&
    (value.webpack == null || typeof value.webpack !== 'object')
  ) {
    return false;
  }

  if ('overlayEnabled' in value && typeof value.overlayEnabled !== 'boolean') {
    return false;
  }

  if ('prebuiltPackages' in value && !Array.isArray(value.prebuiltPackages)) {
    return false;
  }

  if (
    'generateServiceWorker' in value &&
    typeof value.generateServiceWorker !== 'boolean'
  ) {
    return false;
  }

  if (
    'warnAboutDuplicatePackages' in value &&
    typeof value.warnAboutDuplicatePackages !== 'boolean'
  ) {
    return false;
  }

  if (
    'ignoredDuplicatePackages' in value &&
    !Array.isArray(value.ignoredDuplicatePackages)
  ) {
    return false;
  }

  if (
    'devServerProtocol' in value &&
    typeof value.devServerProtocol !== 'string'
  ) {
    return false;
  }

  if ('devServerHost' in value && typeof value.devServerHost !== 'string') {
    return false;
  }

  if ('devServerPort' in value && typeof value.devServerHost !== 'number') {
    return false;
  }

  return true;
}

export default class Configuration {
  private configuration: CustomConfiguration;

  constructor() {
    const configurationPath = path.join(this.rootPath, 'catalyst.config.json');

    if (!fs.existsSync(configurationPath)) {
      throw new Error(
        `Missing Catalyst configuration file. Expected it to be here: ${configurationPath}`
      );
    }

    const configuration = require(configurationPath);

    if (!isCustomConfiguration(configuration)) {
      throw new Error('Configuration is invalid.');
    }

    this.configuration = configuration;
  }

  get environment(): Environment {
    const { NODE_ENV } = process.env;

    if (!isEnvironment(NODE_ENV)) {
      throw new Error(
        'NODE_ENV must be one of "development", "test", or "production".'
      );
    }

    return NODE_ENV;
  }

  get rootPath(): string {
    return process.cwd();
  }

  get contextPath(): string {
    return path.resolve(this.rootPath, this.configuration.contextPath);
  }

  get bundlesPath(): string {
    return path.join(this.contextPath, 'bundles');
  }

  get buildPath(): string {
    return path.resolve(this.rootPath, this.configuration.buildPath);
  }

  get publicPath(): string {
    if (this.environment === 'development') {
      return `${this.devServerProtocol}://${this.devServerHost}:${
        this.devServerPort
      }/`;
    }

    return this.configuration.publicPath.replace(/\/*$/, '/');
  }

  get tempPath(): string {
    return path.join(this.rootPath, 'tmp', 'catalyst');
  }

  get typeScriptEnabled(): boolean {
    return fs.existsSync(path.join(this.rootPath, 'tsconfig.json'));
  }

  get flowEnabled(): boolean {
    return fs.existsSync(path.join(this.rootPath, '.flowconfig'));
  }

  get prebuiltModules(): string[] {
    const { prebuiltModules } = this.configuration;

    if (prebuiltModules != null) {
      return prebuiltModules;
    }

    return defaultPrebuiltModules;
  }

  get transformedModules(): string[] {
    const { transformedModules } = this.configuration;

    if (transformedModules != null) {
      return transformedModules;
    }

    return defaultTransformedModules;
  }

  get generateServiceWorker(): boolean {
    const { generateServiceWorker } = this.configuration;

    if (generateServiceWorker != null) {
      return generateServiceWorker;
    }

    return this.environment === 'production' || this.environment === 'test';
  }

  get warnAboutDuplicatePackages(): boolean {
    const { warnAboutDuplicatePackages } = this.configuration;

    if (warnAboutDuplicatePackages != null) {
      return warnAboutDuplicatePackages;
    }

    return true;
  }

  get ignoredDuplicatePackages(): string[] {
    const { ignoredDuplicatePackages } = this.configuration;

    if (ignoredDuplicatePackages != null) {
      return ignoredDuplicatePackages;
    }

    return defaultIgnoredDuplicatePackages;
  }

  get devServerProtocol(): string {
    const { DEV_SERVER_PROTOCOL } = process.env;

    if (DEV_SERVER_PROTOCOL != null) {
      return DEV_SERVER_PROTOCOL;
    }

    const { devServerProtocol } = this.configuration;

    if (devServerProtocol != null) {
      return devServerProtocol;
    }

    return 'http';
  }

  get devServerHost(): string {
    const { DEV_SERVER_HOST } = process.env;

    if (DEV_SERVER_HOST != null) {
      return DEV_SERVER_HOST;
    }

    const { devServerHost } = this.configuration;

    if (devServerHost != null) {
      return devServerHost;
    }

    return 'localhost';
  }

  get devServerPort(): number {
    const { DEV_SERVER_PORT } = process.env;

    if (DEV_SERVER_PORT != null) {
      return parseInt(DEV_SERVER_PORT);
    }

    const { devServerPort } = this.configuration;

    if (devServerPort != null) {
      return devServerPort;
    }

    return 8080;
  }

  get overlayEnabled(): boolean {
    const { overlayEnabled } = this.configuration;

    if (overlayEnabled == null) {
      return true;
    }

    return overlayEnabled;
  }
}
