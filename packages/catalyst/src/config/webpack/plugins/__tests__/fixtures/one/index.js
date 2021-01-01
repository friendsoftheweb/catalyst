import './styles.css';

export default function helloWorld() {
  import('./dynamic').then((dynamic) => {
    dynamic();
  });
}
