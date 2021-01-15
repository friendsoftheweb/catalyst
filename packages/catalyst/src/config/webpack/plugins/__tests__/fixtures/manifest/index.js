import './styles.css';
import imageUrl from './assets/images/this-is-fine.jpeg';

export default function helloWorld() {
  console.log(imageUrl);

  import('./dynamic').then((dynamic) => {
    dynamic();
  });
}
