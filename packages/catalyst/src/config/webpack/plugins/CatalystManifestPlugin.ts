import { Compiler, Compilation, WebpackPluginInstance } from 'webpack';
import { RawSource } from 'webpack-sources';
import {
  nameForAsset,
  collectChunkAncestors,
  chunksReferenceAsset,
} from './utils';
import { Stats, Chunk, Module } from './types';

interface Manifest {
  assets: Record<string, string>;
  preload: Record<string, string[]>;
  prefetch: Record<string, string[]>;
}

/**
 * Generates a "catalyst.manifest.json" file with a list of files to preload
 * (via`<link rel="preload" />`) and prefetch (via`<link rel="prefetch" />`).
 */
export default class CatalystManifestPlugin implements WebpackPluginInstance {
  apply(compiler: Compiler): void {
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

          const initialChunks = stats.chunks.filter(({ initial }) => initial);

          const manifest: Manifest = {
            assets: stats.assets.reduce(
              (reduction, asset) => ({
                ...reduction,
                [nameForAsset(asset)]: `${stats.publicPath}${asset.name}`,
              }),
              {}
            ),
            preload: {},
            prefetch: {},
          };

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

              if (
                !/\.(js|css)(\.map)?$/.test(assetName) &&
                chunksReferenceAsset(entrypointChunks, asset)
              ) {
                // Fonts should almost always be preloaded
                if (/\.(woff2?|ttf|eot)$/.test(assetName)) {
                  if (manifest.preload[entrypoint.name] == null) {
                    manifest.preload[entrypoint.name] = [];
                  }

                  manifest.preload[entrypoint.name].push(assetName);
                } else {
                  if (manifest.prefetch[entrypoint.name] == null) {
                    manifest.prefetch[entrypoint.name] = [];
                  }

                  manifest.prefetch[entrypoint.name].push(assetName);
                }
              }
            }
          }

          const prefetchChunks = collectPrefetchChunks(stats.chunks);

          for (const chunk of prefetchChunks) {
            const ancestors = collectChunkAncestors(stats.chunks, chunk);

            if (ancestors.length === 0) {
              continue;
            }

            const entrypoint = Object.values(
              stats.entrypoints
            ).find(({ chunks }) =>
              chunks.includes(ancestors[ancestors.length - 1].id)
            );

            if (entrypoint == null) {
              continue;
            }

            for (const asset of stats.assets) {
              const assetName = nameForAsset(asset);

              if (
                manifest.preload[entrypoint.name]?.includes(assetName) ||
                manifest.prefetch[entrypoint.name]?.includes(assetName)
              ) {
                continue;
              }

              if (chunksReferenceAsset([chunk, ...ancestors], asset)) {
                if (manifest.prefetch[entrypoint.name] == null) {
                  manifest.prefetch[entrypoint.name] = [];
                }

                manifest.prefetch[entrypoint.name].push(assetName);
              }
            }
          }

          compilation.emitAsset(
            'catalyst.manifest.json',
            new RawSource(JSON.stringify(manifest, null, 2))
          );

          // Also generate a "manifest.json" for backwards compatibility
          compilation.emitAsset(
            'manifest.json',
            new RawSource(JSON.stringify(manifest.assets, null, 2))
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
