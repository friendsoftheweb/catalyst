import { h, Component, Fragment } from 'preact';

interface Props {
  message?: string;
}

export default class CompilationError extends Component<Props> {
  render() {
    const { message } = this.props;

    return (
      <Fragment>
        <div className="compilation-error">
          <a
            className="compilation-error-brand"
            href="https://github.com/friendsoftheweb/catalyst"
            target="_blank"
            rel="noopener"
          >
            🧪 Catalyst
          </a>

          <h1>Failed to Compile</h1>

          <div
            className="compilation-error-message"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        </div>

        <style>
          {`
  h1 {
    color: #ffffff;
    font-size: 1.5em;
    background-color: #EC2F5D;
    margin-bottom: 2em;
    font-weight: normal;
    padding: 0.5em;
  }

  .compilation-error {
    position: fixed;
    box-sizing: border-box;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    color: #333333;
    background-color: #fafafa;
    font-size: 1em;
    font-family: Menlo, Consolas, monospace;
    line-height: 1.2em;
    padding: 2rem;
    overflow: auto;
  }

  .compilation-error-brand {
    display: block;
    color: #999999;
    text-decoration: none;
    margin-bottom: 2em;
  }

  .compilation-error-message {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .compilation-error-message > * {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-path {
    font-weight: bold;
    font-size: 1.25em;
    margin-bottom: 1em;
  }

  .code-line {
    white-space: pre;
    background-color: #eeeeee;
    line-height: 1.5em;
  }

  .code-line-indicator {
    color: #A92047;
  }

  .code-line.highlighted {
    background-color: #dddddd;
  }

  @media screen and (max-width: 600px) {
    .compilation-error {
      font-size: 0.8em;
    }
  }
  `}
        </style>
      </Fragment>
    );
  }
}
