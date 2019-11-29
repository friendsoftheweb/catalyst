import { h, Component, Fragment } from 'preact';

export interface Props {
  message?: string;
}

export default class Activity extends Component<Props> {
  state = {
    updated: false
  };

  render() {
    const { message } = this.props;

    return (
      <Fragment>
        <div
          style={{
            position: 'fixed',
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: '0.5rem',
            fontFamily: 'Menlo, Consolas, monospace',
            padding: '0.75em 1em',
            textAlign: 'center',
            verticalAlign: 'middle',
            boxShadow: '0 0 20px rgba(0,0,0,0.45)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div
            style={{
              display: 'inline-block',
              animation: 'rotation 1000ms infinite linear',
              verticalAlign: 'middle',
              fontSize: '17px',
              width: '1em',
              height: '1em',
              border: '3px solid rgba(255,255,255,0.25)',
              borderTopColor: 'rgba(255,255,255,0.7)',
              borderRadius: '50%'
            }}
          ></div>

          <div
            style={{
              color: 'rgba(255,255,255,0.5)',
              marginLeft: '0.65em',
              paddingTop: '0.25em',
              display: 'inline-block',
              WebkitFontSmoothing: 'antialiased'
            }}
          >
            {message}
          </div>
        </div>

        <style>
          {`
          @keyframes rotation {
            0% { transform: rotate(0); }
            100% { transform: rotate(350deg); }
          }
        `}
        </style>
      </Fragment>
    );
  }
}
