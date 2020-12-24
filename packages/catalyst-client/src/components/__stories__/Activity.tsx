/** @jsx h */
import { h } from 'preact';

import Activity from '../Activity';

export default {
  title: 'Activity',
  component: Activity,
};

export const Building = () => <Activity message="Building..." />;
