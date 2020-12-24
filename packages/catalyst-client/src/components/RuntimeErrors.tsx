/** @jsx h */
import { h, FunctionalComponent, Fragment } from 'preact';
import classNames from 'classnames';
import './RuntimeErrors.scss';

export interface Props {
  count: number;
  location?: string;
  message?: string;
}

const RuntimeErrors: FunctionalComponent<Props> = (props) => {
  const { count, message, location } = props;

  return (
    <Fragment>
      {message ? (
        <div className="RuntimeErrors">
          <div className="RuntimeErrors-message">
            {location && (
              <Fragment>
                <b>{location}</b>
                {' - '}
              </Fragment>
            )}
            {message}
          </div>

          <RuntimeErrorsCount inline count={count} />
        </div>
      ) : (
        <RuntimeErrorsCount count={count} />
      )}
    </Fragment>
  );
};

const RuntimeErrorsCount: FunctionalComponent<{
  count: number;
  inline?: boolean;
}> = (props) => {
  const { count, inline } = props;

  return (
    <div
      className={classNames('RuntimeErrorsCount', {
        'RuntimeErrorsCount--inline': inline,
      })}
    >
      <span className="RuntimeErrorsCount-number">{count}</span>
      <span className="RuntimeErrorsCount-symbol">⛔️</span>
    </div>
  );
};

export default RuntimeErrors;
