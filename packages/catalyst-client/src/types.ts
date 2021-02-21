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

export type DevServerEvent =
  | {
      type: 'invalid';
    }
  | {
      type: 'hash';
      data: string;
    }
  | {
      type: 'ok';
    }
  | {
      type: 'still-ok';
    }
  | {
      type: 'warnings';
      data: {
        moduleName: string;
        moduleIdentifier: string;
        message: string;
      }[];
    }
  | {
      type: 'errors';
      data: {
        moduleName: string;
        moduleIdentifier: string;
        message: string;
      }[];
    };

export interface Configuration {
  devServerProtocol: string;
  devServerHost: string;
  devServerPort: number;
  contextPath: string;
  ignoredRuntimeErrors: string[];
}

export interface Logger {
  error(message: string): void;
  error(options: { message: string; location: string }): void;
}

export interface CatalystClient extends Configuration {
  logger: Logger;
}
