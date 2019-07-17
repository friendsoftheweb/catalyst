const SERVICE_WORKER_URL = process.env.SERVICE_WORKER_URL;

if (SERVICE_WORKER_URL != null && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(SERVICE_WORKER_URL)
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
