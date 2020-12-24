/** @jsx h */
import { h, FunctionalComponent } from 'preact';
import './Activity.scss';

export interface Props {
  message?: string;
}

const Activity: FunctionalComponent<Props> = (props) => {
  const { message } = props;

  return (
    <div className="Activity">
      <div className="Activity-indicator" />

      <div className="Activity-message">{message}</div>
    </div>
  );
};

export default Activity;
