import { Asset, Chunk } from './types';

export const nameForAsset = (asset: Asset): string => {
  if (/\.js$/.test(asset.name) && asset.chunkNames.length === 1) {
    return `${asset.chunkNames[0]}.js`;
  }

  if (/\.css$/.test(asset.name) && asset.chunkNames.length === 1) {
    return `${asset.chunkNames[0]}.css`;
  }

  return asset.info.sourceFilename?.replace(/^assets\//, '') ?? asset.name;
};

export const collectChunkParents = (
  allChunks: Chunk[],
  chunk: Chunk
): Chunk[] => {
  if (chunk.parents.length === 0) {
    return [];
  }

  return allChunks.filter(({ id }) => chunk.parents.includes(id));
};

export const collectChunkAncestors = (
  allChunks: Chunk[],
  chunk: Chunk,
  collection: Chunk[] = []
): Chunk[] => {
  const parents = collectChunkParents(allChunks, chunk);

  for (const parent of parents) {
    if (!collection.includes(parent)) {
      collection.push(parent);
      collectChunkAncestors(allChunks, parent, collection);
    }
  }

  return collection;
};

export const chunksReferenceAsset = (
  chunks: Chunk[],
  asset: Asset
): boolean => {
  return (
    asset.chunks.some((chunkId: number) =>
      chunks.find((chunk) => chunk.id === chunkId)
    ) ||
    asset.auxiliaryChunks.some((chunkId: number) =>
      chunks.find((chunk) => chunk.id === chunkId)
    )
  );
};
