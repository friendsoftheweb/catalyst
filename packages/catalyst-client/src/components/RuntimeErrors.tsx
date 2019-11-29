import { h, Component, Fragment } from 'preact';

export interface Props {
  count: number;
  message?: string;
}

interface State {
  updated: boolean;
}

export default class RuntimeErrors extends Component<Props, State> {
  state = {
    updated: false
  };

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.count !== this.props.count) {
      this.setState({ updated: true });
    }

    if (!prevState.updated && this.state.updated) {
      setTimeout(() => {
        this.setState({
          updated: false
        });
      }, 500);
    }
  }

  render() {
    const { count, message } = this.props;
    const { updated } = this.state;

    return (
      <Fragment>
        {message && (
          <div
            style={{
              boxSizing: 'border-box',
              width: '100%',
              padding: '1em 5em 1em 1em',
              fontFamily: 'Menlo, Consolas, monospace',
              fontSize: '14px',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#fff2f5',
              color: '#b8000b',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              animation: 'slide 150ms'
            }}
          >
            {message}
          </div>
        )}

        <div
          className="runtime-errors"
          style={
            updated
              ? {
                  animation: 'flash 500ms 1'
                }
              : undefined
          }
        >
          <span
            style={{
              fontWeight: 'bold',
              padding: '0.05em 0.4em 0'
            }}
          >
            {count}
          </span>

          <span
            style={{
              paddingBottom: '0.05em'
            }}
          >
            ⛔️
          </span>
        </div>

        <style>
          {`
          @keyframes flash {
            0% {
              opacity: 1;
            }

            50% {
              opacity: 0.25;
            }

            100% {

              opacity: 1;
            }
          }

          @keyframes slide {
            0% {
              opacity: 0;
              bottom: -3em;
            }

            100% {
              opacity: 0.95;
              bottom: 0;
            }
          }

          .runtime-errors {
            background-color: rgba(255, 0, 0, 0.7);
            color: white;
            font-size: 14px;
            height: 1.5em;
            padding: 0.25em 0.5em;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Menlo, Consolas, monospace;
            position: absolute;
            right: 10px;
            bottom: 8px;
            border-radius: 1.25em;
            box-shadow: 0 0 0.25em 0 rgba(0,0,0,0.4);
          }`}
        </style>
      </Fragment>
    );
  }
}
