import thisIsFine from './assets/this-is-fine-2.jpeg';

export default function helloWorld() {
  console.log(thisIsFine);

  import('./dynamic').then((dynamic) => {
    dynamic();
  });
}
