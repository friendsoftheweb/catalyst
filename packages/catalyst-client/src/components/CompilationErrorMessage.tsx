import './CompilationErrorMessage.scss';

/** @jsx h */
import { h, FunctionalComponent, Fragment } from 'preact';

interface Props {
  message: string;
}

const CompilationErrorMessage: FunctionalComponent<Props> = (props) => {
  const { location, groups } = parseBuildFailedMessage(props.message);

  return (
    <div className="CompilationErrorMessage">
      {location && (
        <div className="CompilationErrorMessage-location">{location}</div>
      )}

      {groups.map((group, index) => (
        <div key={index} className={`CompilationErrorMessage-${group.type}`}>
          {group.type === 'code' ? (
            <Fragment>
              <div className="CompilationErrorMessage-lineNumber">
                {group.lines.map((line, index) => (
                  <div
                    key={index}
                    className={line.highlight ? 'is-highlight' : undefined}
                  >
                    {line.number}
                  </div>
                ))}
              </div>

              <div className="CompilationErrorMessage-lineText">
                {group.lines.map((line, index) => (
                  <div
                    key={index}
                    className={line.highlight ? 'is-highlight' : undefined}
                  >
                    {line.text}
                  </div>
                ))}
              </div>
            </Fragment>
          ) : (
            <Fragment>
              {group.lines.map((line, index) => (
                <div
                  key={index}
                  className={line.highlight ? 'is-highlight' : undefined}
                >
                  {line.text}
                </div>
              ))}
            </Fragment>
          )}
        </div>
      ))}
    </div>
  );
};

export default CompilationErrorMessage;

interface Line {
  number?: number;
  text: string;
  highlight?: boolean;
}

type LineType = 'code' | 'stack' | 'other';

interface LineGroup {
  type: LineType;
  lines: Line[];
}

const parseBuildFailedMessage = (
  message: string
): { location?: string; groups: LineGroup[] } => {
  let location: string | undefined = undefined;
  const groups: LineGroup[] = [];

  for (let line of message.split('\n')) {
    // Skip JavaScript stacktrace lines
    if (/^\s+at Object/.test(line)) {
      continue;
    }

    // Stacktrace
    if (/\w+\.\w+\s+\d+:\d+/.test(line)) {
      appendLine(groups, 'stack', { text: line });

      continue;
    }

    let matches;

    if ((matches = /^\s*(\d+)\s+[|│](.*)/.exec(line))) {
      const number = parseInt(matches[1]);
      const text = matches[2];

      appendLine(groups, 'code', { text, number });

      continue;
    }

    if ((matches = /^>\s*(\d+)\s+[|│](.*)/.exec(line))) {
      const number = parseInt(matches[1]);
      const text = matches[2];

      appendLine(groups, 'code', { text, number, highlight: true });

      continue;
    }

    line = line.replace(/\s*\(.*\)/, '');

    if (/^\.(\/[\w\-_]+)+(\.\w+)+/.test(line)) {
      location = line;

      continue;
    }
  }

  return {
    location,
    groups,
  };
};

const appendLine = (groups: LineGroup[], type: LineType, line: Line) => {
  if (groups[groups.length - 1]?.type === type) {
    groups[groups.length - 1].lines.push(line);
  } else {
    groups.push({ type, lines: [line] });
  }
};
