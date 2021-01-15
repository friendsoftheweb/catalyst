import { Compiler, Compilation, WebpackPluginInstance } from 'webpack';
import { RawSource } from 'webpack-sources';
import Manifest from './Manifest';
import {
  nameForAsset,
  collectChunkAncestors,
  chunksReferenceAsset,
} from './utils';
import { Stats, Chunk, Module } from './types';
import { debugBuild } from '../../../debug';
import formatBytes from '../../../utils/formatBytes';
import { IMAGE_FILE_PATTERN } from '../../../patterns';

interface Options {
  maxPrefetchAssetSize: number;
}

/**
 * Generates a "catalyst.manifest.json" file with a list of files to preload
 * (via`<link rel="preload" />`) and prefetch (via`<link rel="prefetch" />`).
 */
export default class CatalystManifestPlugin implements WebpackPluginInstance {
  private readonly options: Options;

  constructor(options: Options) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    const { maxPrefetchAssetSize } = this.options;

    compiler.hooks.compilation.tap('CatalystManifestPlugin', (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: 'CatalystManifestPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        async (assets) => {
          if (Object.keys(assets).includes('*')) {
            // Skip every processAssets call except for the last one
            return;
          }

          const stats = compilation.getStats().toJson({
            source: true,
            publicPath: true,
          }) as Stats;

          if (stats.publicPath === 'auto') {
            throw new Error('Please configure webpack\'s "output.publicPath"');
          }

          const manifest = new Manifest(
            stats.assets.reduce(
              (reduction, asset) => ({
                ...reduction,
                [nameForAsset(asset)]: `${stats.publicPath}${asset.name}`,
              }),
              {}
            )
          );

          const initialChunks = stats.chunks.filter(({ initial }) => initial);

          for (const chunk of initialChunks) {
            const entrypoint = Object.values(
              stats.entrypoints
            ).find(({ chunks }) => chunks.includes(chunk.id));

            if (entrypoint == null) {
              continue;
            }

            const entrypointChunks = initialChunks.filter(({ id }) =>
              entrypoint.chunks.includes(id)
            );

            for (const asset of stats.assets) {
              const assetName = nameForAsset(asset);

              if (IMAGE_FILE_PATTERN.test(assetName)) {
                continue;
              }

              if (asset.size > maxPrefetchAssetSize) {
                debugBuild(
                  `Skipping asset "${assetName}" because it is larger than the size limit by ${formatBytes(
                    asset.size - maxPrefetchAssetSize
                  )}`
                );

                continue;
              }

              if (
                !/\.(js|css)(\.map)?$/.test(assetName) &&
                chunksReferenceAsset(entrypointChunks, asset)
              ) {
                // Fonts should almost always be preloaded
                if (/\.(woff2?|ttf|eot)$/.test(assetName)) {
                  manifest.addPreloadAsset(entrypoint, asset);
                } else {
                  manifest.addPrefetchAsset(entrypoint, asset);
                }
              }
            }
          }

          const prefetchChunks = collectPrefetchChunks(stats.chunks);

          for (const asset of stats.assets) {
            if (asset.chunkNames.length > 0) {
              continue;
            }

            const assetName = nameForAsset(asset);

            if (IMAGE_FILE_PATTERN.test(assetName)) {
              continue;
            }

            if (asset.size > maxPrefetchAssetSize) {
              debugBuild(
                `Skipping asset "${assetName}" because it is larger than the size limit by ${formatBytes(
                  asset.size - maxPrefetchAssetSize
                )}`
              );

              continue;
            }

            for (const chunk of prefetchChunks) {
              const ancestors = collectChunkAncestors(stats.chunks, chunk);

              if (ancestors.length === 0) {
                continue;
              }

              const entrypoint = Object.values(
                stats.entrypoints
              ).find(({ chunks }) =>
                chunks.some((chunkId) =>
                  ancestors.some(({ id }) => id === chunkId)
                )
              );

              if (entrypoint == null) {
                debugBuild(
                  `Skipping chunk ${chunk.id} (${chunk.files.join(
                    ', '
                  )}) because an entrypoint could not be found`
                );

                continue;
              }

              if (chunksReferenceAsset([chunk, ...ancestors], asset)) {
                manifest.addPrefetchAsset(entrypoint, asset);
              }
            }
          }

          compilation.emitAsset(
            'catalyst.manifest.json',
            new RawSource(manifest.toJSON())
          );
        }
      );
    });
  }
}

const collectPrefetchChunks = (chunks: Chunk[]) =>
  chunks.filter(
    (chunk) => !chunk.initial && chunk.modules.some(shouldPrefetchModule)
  );

const shouldPrefetchModule = (module: Module): boolean => {
  if (
    module.source != null &&
    /^\/\/\s+@catalyst-prefetch$/m.test(module.source)
  ) {
    return true;
  }

  if (module.modules != null) {
    return module.modules.some(shouldPrefetchModule);
  }

  return false;
};
