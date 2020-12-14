import './CompilationErrorMessage.scss';

import { h, FunctionalComponent } from 'preact';

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

      {groups.map((group, index) => {
        return (
          <div key={index} className={`CompilationErrorMessage-${group.type}`}>
            {group.lines.map((line, index) => (
              <div
                key={index}
                className={line.highlight ? 'highlight' : undefined}
              >
                {line.text}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default CompilationErrorMessage;

interface Line {
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
      appendLine(groups, 'stack', line);

      continue;
    }

    if (/^\s*(\d+)?\s+[|│╷╵]/.test(line)) {
      appendLine(groups, 'code', line);

      continue;
    }

    if (/^>\s*(\d+)?\s+[|│╷╵]/.test(line)) {
      line = line.replace(/^>/, ' ');

      appendLine(groups, 'code', line);

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

const appendLine = (groups: LineGroup[], type: LineType, text: string) => {
  if (groups[groups.length - 1]?.type === type) {
    groups[groups.length - 1].lines.push({ text });
  } else {
    groups.push({ type, lines: [{ text }] });
  }
};
