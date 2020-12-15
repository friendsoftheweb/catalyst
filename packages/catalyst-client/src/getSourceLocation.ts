import { NullableMappedPosition, SourceMapConsumer } from 'source-map';

const sourceMapPromises: Record<string, Promise<string>> = {};

export const getSourceLocation = async (
  errorEvent: ErrorEvent
): Promise<NullableMappedPosition> => {
  const sourceMapURI = `${errorEvent.filename}.map`;

  if (sourceMapPromises[sourceMapURI] == null) {
    sourceMapPromises[sourceMapURI] = fetch(sourceMapURI)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load source map: ${sourceMapURI}`);
        }

        return response;
      })
      .then((response) => response.json());
  }

  const sourceMap = await sourceMapPromises[sourceMapURI];

  let position;

  await SourceMapConsumer.with(sourceMap, null, (consumer) => {
    position = consumer.originalPositionFor({
      line: errorEvent.lineno,
      column: errorEvent.colno,
    });
  });

  // Allow source map content to be garbage-collected
  delete sourceMapPromises[sourceMapURI];

  if (position == null) {
    throw new Error('Failed to look up source map location');
  }

  return position;
};
