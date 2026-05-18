// packages/webapp/public/preload-theme.js
// Pre-paint theme resolution. Runs before the JS bundle loads.
//
// Preference state:
//   localStorage['theme'] === 'dark'    → force dark
//   localStorage['theme'] === 'light'   → force light
//   localStorage['theme'] absent        → follow OS via prefers-color-scheme
//
// Payment portal pages always render light (legacy behaviour, preserved).

(function () {
  var stored = localStorage.getItem('theme'); // 'dark' | 'light' | null
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var effective = stored != null ? stored : prefersDark ? 'dark' : 'light';

  if (window.location.pathname.indexOf('/payment') === 0) {
    effective = 'light';
  }

  var html = document.documentElement;
  var body = document.body;

  if (effective === 'dark') {
    html.classList.add('bp4-dark');
    if (body) body.classList.add('bp4-dark');
  } else {
    html.classList.remove('bp4-dark');
    if (body) body.classList.remove('bp4-dark');
  }
})();
