import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

export default function modifyResponsiveLoader(
  this: {
    async(): (error: Error | null, content?: string) => void;
  },
  source: string
): string | void {
  const ast = parse(source);

  traverse(ast, {
    enter(path) {
      if (path.node.type === 'ObjectExpression') {
        path.node.properties = path.node.properties.filter((property) => {
          if (property.type === 'ObjectProperty') {
            return (
              property.key.type === 'Identifier' &&
              ['src', 'srcSet', 'width', 'height'].includes(property.key.name)
            );
          }

          return true;
        });
      }
    },
  });

  return generate(ast).code;
}
