export interface Stats {
  entrypoints: Record<string, Entrypoint>;
  chunks: Chunk[];
  assets: Asset[];
  publicPath: string;
}

export interface Entrypoint {
  name: string;
  chunks: number[];
}

export interface Asset {
  name: string;
  chunks: number[];
  chunkNames: string[];
  auxiliaryChunks: number[];
  info: {
    sourceFilename?: string;
  };
}

export interface Chunk {
  id: number;
  initial: boolean;
  modules: Module[];
  files: string[];
  parents: number[];
}

export interface Module {
  id: number;
  chunks: number[];
  source?: string;
  modules?: Module[];
}
