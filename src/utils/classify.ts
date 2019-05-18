import { camelCase, upperFirst } from 'lodash';

export default function classify(value: string): string {
  return upperFirst(camelCase(value));
}
