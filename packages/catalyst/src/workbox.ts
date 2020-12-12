const SERVICE_WORKER_URL = process.env.SERVICE_WORKER_URL;

if (SERVICE_WORKER_URL != null && 'serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register(SERVICE_WORKER_URL)
      .then(function (registration) {
        console.log('SW registered: ', registration);
      })
      .catch(function (registrationError) {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
