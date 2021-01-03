import { getOptions } from 'loader-utils';
import { validate } from 'schema-utils';
import sizeOf from 'image-size';
import { IMAGE_FILE_PATTERN } from '../../../patterns';

const OPTIONS_SCHEMA = {
  properties: {
    esModule: {
      type: 'boolean' as const,
    },
  },
  type: 'object' as const,
};

/**
 * Add a "dimensions" object export to any image imported into a JavaScript
 * file. Must be run after "file-loader".
 */
export default function imageDimensionsLoader(
  this: {
    resourcePath: string;
    async(): (error: Error | null, content?: string) => void;
  },
  content: string
): string | void {
  if (!IMAGE_FILE_PATTERN.test(this.resourcePath)) {
    return content;
  }

  const options = getOptions(this as any);

  validate(OPTIONS_SCHEMA, options, {
    name: 'image-dimensions-loader',
    baseDataPath: 'options',
  });

  const esModule =
    typeof options.esModule !== 'undefined' ? options.esModule : true;

  const callback = this.async();

  if (
    esModule
      ? !/^export default ".+";$/.test(content)
      : !/^module\.exports = ".+";$/.test(content)
  ) {
    callback(
      new Error(
        'Received unexpected content from previous loader. ' +
          'Make sure "file-loader" runs before "image-dimensions-loader" and ' +
          'both have the same "esModules" option value.'
      )
    );

    return;
  }

  sizeOf(this.resourcePath, (error, dimensions) => {
    if (error != null || dimensions == null) {
      callback(error);
      return;
    }

    if (esModule) {
      callback(
        null,
        [
          content,
          `export const dimensions = {`,
          `  width: ${dimensions.width},`,
          `  height: ${dimensions.height}`,
          `};`,
        ].join('\n')
      );
    } else {
      callback(
        null,
        [
          content,
          `module.exports.dimensions = {`,
          `  width: ${dimensions.width},`,
          `  height: ${dimensions.height}`,
          `};`,
        ].join('\n')
      );
    }
  });
}
