import './dynamic-dep.css';
import imageUrl from './assets/images/this-is-fine.jpeg';

export default function depencency() {
  console.log(imageUrl);

  import('./dynamic-dep-dynamic-dep').then((depdep) => {
    depdep();
  });
}
