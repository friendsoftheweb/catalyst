import { collectChunkParents, collectChunkAncestors } from '../utils';

describe('collectChunkParents', () => {
  test('collects parent chunks', () => {
    const chunk1 = {
      id: 1,
      parents: [],
    };

    const chunk2 = { id: 2, parents: [1] };

    const chunks = [chunk1, chunk2];

    expect(collectChunkParents(chunks, chunk1)).toEqual([]);
    expect(collectChunkParents(chunks, chunk2)).toEqual([chunk1]);
  });
});

describe('collectChunkAncestors', () => {
  test('handles acyclic graphs', () => {
    const chunk1 = { id: 1, parents: [] };
    const chunk2 = { id: 2, parents: [1] };
    const chunk3 = { id: 3, parents: [2] };

    const chunks = [chunk1, chunk2, chunk3];

    expect(collectChunkAncestors(chunks, chunk1)).toEqual([]);
    expect(collectChunkAncestors(chunks, chunk2)).toEqual([chunk1]);
    expect(collectChunkAncestors(chunks, chunk3)).toEqual([chunk2, chunk1]);
  });

  test('handles cyclic graphs', () => {
    const chunk1 = { id: 1, parents: [3] };
    const chunk2 = { id: 2, parents: [1] };
    const chunk3 = { id: 3, parents: [2] };

    const chunks = [chunk1, chunk2, chunk3];

    expect(collectChunkAncestors(chunks, chunk1)).toEqual([
      chunk3,
      chunk2,
      chunk1,
    ]);

    expect(collectChunkAncestors(chunks, chunk2)).toEqual([
      chunk1,
      chunk3,
      chunk2,
    ]);

    expect(collectChunkAncestors(chunks, chunk3)).toEqual([
      chunk2,
      chunk1,
      chunk3,
    ]);
  });

  test('handles asymetrical graphs', () => {
    const chunk1 = { id: 1, parents: [] };
    const chunk2 = { id: 2, parents: [] };
    const chunk3 = { id: 3, parents: [2] };
    const chunk4 = { id: 4, parents: [1, 3] };
    const chunk5 = { id: 5, parents: [4] };
    const chunk6 = { id: 6, parents: [4, 3] };
    const chunk7 = { id: 7, parents: [6] };

    const chunks = [chunk1, chunk2, chunk3, chunk4, chunk5, chunk6, chunk7];

    expect(collectChunkAncestors(chunks, chunk7)).toEqual([
      chunk6,
      chunk3,
      chunk2,
      chunk4,
      chunk1,
    ]);
  });
});
