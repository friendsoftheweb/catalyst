/** @jsx h */
import { h, FunctionalComponent, Fragment } from 'preact';
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

          <div className="RuntimeErrorsCount">
            <span className="RuntimeErrorsCount-number">{count}</span>
            <span className="RuntimeErrorsCount-symbol">⛔️</span>
          </div>
        </div>
      ) : (
        <div className="RuntimeErrorsCount">
          <span className="RuntimeErrorsCount-number">{count}</span>

          <span className="RuntimeErrorsCount-symbol">⛔️</span>
        </div>
      )}
    </Fragment>
  );
};

export default RuntimeErrors;
