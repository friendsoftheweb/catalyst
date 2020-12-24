/** @jsx h */
import { Fragment, h } from 'preact';
import classNames from 'classnames';
import './SourceCode.scss';

import { Line } from '../utils/parseBuildError';

export const SourceCode: React.FC<{ lines: Line[] }> = (props) => {
  const { lines } = props;

  return (
    <div className="SourceCode">
      {lines.map((line) => (
        <Fragment key={line.number}>
          <div
            className={classNames('SourceCode-number', {
              'is-highlight': line.highlight,
            })}
          >
            {line.number}
          </div>

          <div
            className={classNames('SourceCode-text', {
              'is-highlight': line.highlight,
            })}
          >
            {line.text}
          </div>
        </Fragment>
      ))}
    </div>
  );
};
