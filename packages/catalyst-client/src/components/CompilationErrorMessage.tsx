/** @jsx h */
import { h, FunctionalComponent, Fragment } from 'preact';
import { parseBuildError } from '../utils/parseBuildError';
import { SourceCode } from './SourceCode';
import './CompilationErrorMessage.scss';

interface Props {
  message: string;
  contextPath: string;
}

export const CompilationErrorMessage: FunctionalComponent<Props> = (props) => {
  const { message, sourcePath, sourceCode } = parseBuildError(props.message, {
    contextPath: props.contextPath,
  });

  return (
    <div className="CompilationErrorMessage">
      {sourcePath && (
        <div className="CompilationErrorMessage-location">
          Error in <b>{sourcePath}</b>
        </div>
      )}

      {message && (
        <div className="CompilationErrorMessage-message">{message}</div>
      )}

      {sourceCode.length > 0 && (
        <Fragment>
          <h2>Source</h2>

          <SourceCode lines={sourceCode} />
        </Fragment>
      )}
    </div>
  );
};

export default CompilationErrorMessage;
