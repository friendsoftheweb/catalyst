import('./HelloWorld').then(({ default: HelloWorld }) => {
  new HelloWorld();
});
