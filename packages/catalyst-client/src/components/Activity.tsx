import './Activity.scss';
import { h, FunctionalComponent } from 'preact';

export interface Props {
  message?: string;
}

const Activity: FunctionalComponent<Props> = (props) => {
  const { message } = props;

  return (
    <div className="Activity">
      <div className="Activity-indicator"></div>

      <div className="Activity-message">{message}</div>
    </div>
  );
};

export default Activity;
