import path from 'path';
import fs from 'fs';
import semver from 'semver';
import { Environment, isEnvironment } from './Environment';
import logStatus, { Status } from './utils/logStatus';

export interface CustomConfiguration {
  environment?: Environment;
  rootPath?: string;
  contextPath: string;
  buildPath: string;
  publicPath: string;
  importAssetsAsESModules?: boolean;
  maxScriptAssetSizeKB?: number;
  maxImageAssetSizeKB?: number;
  overlayEnabled?: boolean;
  prebuiltPackages?: string[];
  transformedPackages?: string[];
  optimizeCommonMinChunks?: number;
  optimizeCommonExcludedChunks?: string[];
  generateServiceWorker?: boolean;
  checkForCircularDependencies?: boolean;
  checkForDuplicatePackages?: boolean;
  ignoredDuplicatePackages?: string[];
  devServerProtocol?: string;
  devServerHost?: string;
  devServerPort?: number;
  devServerCertificate?: DevServerCertificate;
  plugins?: string[];
}

interface DevServerCertificate {
  keyPath: string;
  certPath: string;
  caPath: string;
}

const defaultPrebuiltPackages = [
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
  'regenerator-runtime',
];

const defaultTransformedPackages = [
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
  'redux-saga',
];

const defaultIgnoredDuplicatePackages = [
  'hoist-non-react-statics',
  'prop-types',
  'react-is',
  'ts-invariant',
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
    'importAssetsAsESModules' in value &&
    typeof value.importAssetsAsESModules !== 'boolean'
  ) {
    return false;
  }

  if (
    'maxScriptAssetSizeKB' in value &&
    typeof value.maxScriptAssetSizeKB !== 'number'
  ) {
    return false;
  }

  if (
    'maxImageAssetSizeKB' in value &&
    typeof value.maxImageAssetSizeKB !== 'number'
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
    'transformedPackages' in value &&
    !Array.isArray(value.transformedPackages)
  ) {
    return false;
  }

  if (
    'optimizeCommonMinChunks' in value &&
    typeof value.optimizeCommonMinChunks !== 'number'
  ) {
    return false;
  }

  if (
    'optimizeCommonExcludedChunks' in value &&
    !Array.isArray(value.optimizeCommonExcludedChunks)
  ) {
    return false;
  }

  if (
    'generateServiceWorker' in value &&
    typeof value.generateServiceWorker !== 'boolean'
  ) {
    return false;
  }

  if (
    'checkForCircularDependencies' in value &&
    typeof value.checkForCircularDependencies !== 'boolean'
  ) {
    return false;
  }

  if (
    'checkForDuplicatePackages' in value &&
    typeof value.checkForDuplicatePackages !== 'boolean'
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

  // TODO: Validate "devServerCertificate" keys and values
  if (
    'devServerCertificate' in value &&
    typeof value.devServerCertificate !== 'object'
  ) {
    return false;
  }

  if ('plugins' in value && !Array.isArray(value.plugins)) {
    return false;
  }

  return true;
}

export default class Configuration {
  static fromFile(
    configurationPath = path.join(process.cwd(), 'catalyst.config.json')
  ): Configuration {
    if (!fs.existsSync(configurationPath)) {
      throw new Error(
        `Missing Catalyst configuration file. Expected it to be here: ${configurationPath}`
      );
    }

    const configuration = JSON.parse(
      fs.readFileSync(configurationPath).toString()
    );

    if (!isCustomConfiguration(configuration)) {
      throw new Error('Configuration is invalid.');
    }

    return new Configuration(configuration);
  }

  private readonly configuration: CustomConfiguration;

  constructor(configuration: CustomConfiguration) {
    this.configuration = configuration;
  }

  get environment(): Environment {
    const { environment } = this.configuration;
    const { NODE_ENV } = process.env;

    if (environment != null) {
      if (
        NODE_ENV === Environment.Production &&
        environment !== Environment.Production
      ) {
        throw new Error(
          `NODE_ENV is set to "production", but configuration environment is set to "${environment}"`
        );
      }

      return environment;
    }

    if (!isEnvironment(NODE_ENV)) {
      throw new Error(
        'NODE_ENV must be one of "development", "test", or "production".'
      );
    }

    return NODE_ENV;
  }

  /**
   * The working directory of the catalyst process. This should usually be the
   * root of the host project.
   */
  get rootPath(): string {
    return this.configuration.rootPath ?? process.cwd();
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
    if (this.environment === Environment.Development) {
      return `${this.devServerProtocol}://${this.devServerHost}:${this.devServerPort}/`;
    }

    return this.configuration.publicPath.replace(/\/*$/, '/');
  }

  get tempPath(): string {
    return path.join(this.rootPath, 'tmp', 'catalyst');
  }

  get importAssetsAsESModules(): boolean {
    return this.configuration.importAssetsAsESModules ?? true;
  }

  get maxScriptAssetSize(): number {
    return (this.configuration.maxScriptAssetSizeKB ?? 256) * 1024;
  }

  get maxImageAssetSize(): number {
    return (this.configuration.maxImageAssetSizeKB ?? 1024) * 1024;
  }

  get projectName(): string {
    return JSON.parse(
      fs.readFileSync(path.join(this.rootPath, 'package.json')).toString()
    )['name'];
  }

  get typeScriptEnabled(): boolean {
    return fs.existsSync(path.join(this.rootPath, 'tsconfig.json'));
  }

  get useReactJSXRuntime(): boolean {
    const { dependencies, devDependencies } = JSON.parse(
      fs.readFileSync(path.join(this.rootPath, 'package.json')).toString()
    );

    const reactVersion = dependencies.react ?? devDependencies.react;

    if (reactVersion == null) {
      logStatus(
        Status.Warning,
        'Could not automatically determine React version'
      );

      return false;
    }

    return semver.satisfies(reactVersion, '^15.7.0 || ^16.14.0 || >=17.0.0');
  }

  get optimizeCommonMinChunks(): number {
    return this.configuration.optimizeCommonMinChunks ?? 2;
  }

  get optimizeCommonExcludedChunks(): string[] {
    return (
      this.configuration.optimizeCommonExcludedChunks ?? [
        'admin',
        'administration',
        'management',
      ]
    );
  }

  get prebuiltPackages(): string[] {
    const { prebuiltPackages } = this.configuration;

    if (prebuiltPackages != null) {
      return prebuiltPackages;
    }

    return defaultPrebuiltPackages;
  }

  get transformedPackages(): string[] {
    const { transformedPackages } = this.configuration;

    if (transformedPackages != null) {
      return transformedPackages;
    }

    return defaultTransformedPackages;
  }

  get generateServiceWorker(): boolean {
    if (this.environment === Environment.Development) {
      return false;
    }

    const { generateServiceWorker } = this.configuration;

    return generateServiceWorker ?? false;
  }

  get checkForCircularDependencies(): boolean {
    const { checkForCircularDependencies } = this.configuration;

    if (checkForCircularDependencies != null) {
      return checkForCircularDependencies;
    }

    return true;
  }

  get checkForDuplicatePackages(): boolean {
    const { checkForDuplicatePackages } = this.configuration;

    if (checkForDuplicatePackages != null) {
      return checkForDuplicatePackages;
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

    if (this.devServerCertificate != null) {
      return 'https';
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

  get devServerCertificate(): DevServerCertificate | null {
    const { devServerCertificate } = this.configuration;

    return devServerCertificate || null;
  }

  get overlayEnabled(): boolean {
    const { overlayEnabled } = this.configuration;

    if (overlayEnabled == null) {
      return true;
    }

    return overlayEnabled;
  }

  get plugins(): string[] {
    const { plugins } = this.configuration;

    if (plugins == null) {
      return [];
    }

    return plugins;
  }
}
