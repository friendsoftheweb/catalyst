import './CompilationError.scss';

/** @jsx h */
import { h, FunctionalComponent } from 'preact';
import CompilationErrorMessage from './CompilationErrorMessage';

export interface Props {
  message?: string;
  contextPath: string;
}

const CompilationError: FunctionalComponent<Props> = (props) => {
  const { message, contextPath } = props;

  return (
    <div className="CompilationError">
      <h1 className="CompilationError-heading">⛔️ Build Failed</h1>

      {message && (
        <CompilationErrorMessage message={message} contextPath={contextPath} />
      )}

      <div className="CompilationError-footer">
        <a
          className="CompilationError-link"
          href="https://github.com/friendsoftheweb/catalyst"
          target="_blank"
          rel="noopener"
        >
          🧪 Catalyst
        </a>
      </div>
    </div>
  );
};

export default CompilationError;
