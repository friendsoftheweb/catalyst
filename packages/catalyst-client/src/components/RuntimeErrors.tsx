import { h, FunctionalComponent, Fragment } from 'preact';

export interface Props {
  count: number;
  location?: string;
  message?: string;
}
const RuntimeErrors: FunctionalComponent<Props> = (props) => {
  const { count, message, location } = props;

  return (
    <Fragment>
      {message && (
        <div
          style={{
            boxSizing: 'border-box',
            width: '100%',
            padding: '1em 5em 1em 1em',
            fontFamily: "'Fira Code', Menlo, Consolas, monospace",
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
            animation: 'slide 150ms',
            boxShadow: '0 0 0.5em 0.5em rgba(0,0,0,0.05)',
          }}
        >
          {location && (
            <Fragment>
              <b>{location}</b>
              {' - '}
            </Fragment>
          )}
          {message}
        </div>
      )}

      <div
        style={{
          backgroundColor: 'rgba(255, 0, 0, 0.7)',
          color: 'white',
          fontSize: '14px',
          height: '1.5em',
          padding: '0.25em 0.5em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Fira Code', Menlo, Consolas, monospace",
          position: 'absolute',
          right: '16px',
          bottom: '8px',
          borderRadius: '1.25em',
          boxShadow: '0 0 0.25em 0 rgba(0,0,0,0.4)',
        }}
      >
        <span
          style={{
            fontWeight: 'bold',
            padding: '0.05em 0.4em 0',
          }}
        >
          {count}
        </span>

        <span
          style={{
            paddingBottom: '0.05em',
          }}
        >
          ⛔️
        </span>
      </div>
    </Fragment>
  );
};

export default RuntimeErrors;
