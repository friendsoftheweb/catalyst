import { nameForAsset } from './utils';
import { Entrypoint, Asset } from './types';

export default class Manifest {
  private assets: Record<string, string> = {};
  private preload: Record<string, Set<string>> = {};
  private prefetch: Record<string, Set<string>> = {};

  constructor(assets?: Record<string, string>) {
    if (assets != null) {
      this.assets = assets;
    }
  }

  addPreloadAsset(entrypoint: Entrypoint, asset: Asset): void {
    const key = entrypoint.name;

    if (this.preload[key] == null) {
      this.preload[key] = new Set();
    }

    const assetName = nameForAsset(asset);

    this.prefetch[key]?.delete(assetName);
    this.preload[key].add(assetName);
  }

  addPrefetchAsset(entrypoint: Entrypoint, asset: Asset): void {
    const key = entrypoint.name;

    if (this.prefetch[key] == null) {
      this.prefetch[key] = new Set();
    }

    const assetName = nameForAsset(asset);

    if (this.preload[key]?.has(assetName)) {
      return;
    }

    this.prefetch[key].add(assetName);
  }

  toJSON(): string {
    const preload = Object.entries(this.preload).reduce(
      (reduction, [key, value]) => {
        return {
          ...reduction,
          [key]: Array.from(value),
        };
      },
      {}
    );

    const prefetch = Object.entries(this.prefetch).reduce(
      (reduction, [key, value]) => {
        return {
          ...reduction,
          [key]: Array.from(value),
        };
      },
      {}
    );

    return JSON.stringify(
      {
        assets: this.assets,
        preload,
        prefetch,
      },
      null,
      2
    );
  }
}
