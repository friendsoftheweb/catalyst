import { Props as ActivityProps } from './components/Activity';
import { Props as CompilationErrorProps } from './components/CompilationError';
import { Props as RuntimeErrorsProps } from './components/RuntimeErrors';

export type FrameState =
  | {
      component: 'Activity';
      props: ActivityProps;
    }
  | {
      component: 'CompilationError';
      props: CompilationErrorProps;
    }
  | {
      component: 'RuntimeErrors';
      props: RuntimeErrorsProps;
    }
  | null;