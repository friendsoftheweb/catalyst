import { Compiler, Compilation, WebpackPluginInstance } from 'webpack';
import { RawSource } from 'webpack-sources';

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
          }) as {
            entrypoints: Record<string, Entrypoint>;
            chunks: Chunk[];
            assets: Asset[];
            publicPath: string;
          };

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
              const assetName = asset.info.sourceFilename ?? asset.name;

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
            const parentChunk = findParentChunk(stats.chunks, chunk);

            if (parentChunk == null) {
              continue;
            }

            const entrypoint = Object.values(
              stats.entrypoints
            ).find(({ chunks }) => chunks.includes(parentChunk.id));

            if (entrypoint == null) {
              continue;
            }

            for (const asset of stats.assets) {
              const assetName = asset.info.sourceFilename ?? asset.name;

              if (
                manifest.preload[entrypoint.name]?.includes(assetName) ||
                manifest.prefetch[entrypoint.name]?.includes(assetName)
              ) {
                continue;
              }

              if (chunksReferenceAsset(prefetchChunks, asset)) {
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

interface Entrypoint {
  name: string;
  chunks: number[];
}

interface Asset {
  name: string;
  chunks: number[];
  chunkNames: string[];
  auxiliaryChunks: number[];
  info: {
    sourceFilename?: string;
  };
}

interface Chunk {
  id: number;
  initial: boolean;
  modules: Module[];
  parents: number[];
}

interface Module {
  id: number;
  chunks: number[];
  source?: string;
  modules?: Module[];
}

const nameForAsset = (asset: Asset) => {
  if (/\.js$/.test(asset.name) && asset.chunkNames.length === 1) {
    return `${asset.chunkNames[0]}.js`;
  }

  if (/\.css$/.test(asset.name) && asset.chunkNames.length === 1) {
    return `${asset.chunkNames[0]}.css`;
  }

  return asset.info.sourceFilename ?? asset.name;
};

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

const findParentChunk = (chunks: Chunk[], chunk: Chunk): Chunk | undefined => {
  if (chunk.parents.length === 0) {
    return chunk;
  }

  const parent = chunks.find(({ id }) => chunk.parents.includes(id));

  if (parent == null) {
    return;
  }

  return findParentChunk(chunks, parent);
};

const chunksReferenceAsset = (chunks: Chunk[], asset: Asset) => {
  return (
    asset.chunks.some((chunkId: number) =>
      chunks.find((chunk) => chunk.id === chunkId)
    ) ||
    asset.auxiliaryChunks.some((chunkId: number) =>
      chunks.find((chunk) => chunk.id === chunkId)
    )
  );
};
