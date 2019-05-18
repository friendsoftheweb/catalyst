import { snakeCase } from 'lodash';

export default function dasherize(value: string) {
  return snakeCase(value).replace(/_/g, '-');
}
