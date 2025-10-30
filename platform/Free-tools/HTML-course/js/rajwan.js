// rajwan.js
// Mobile-only back button handler: when the device back button is pressed,
// redirect to ../free-tools.html

(function(){
  const BACK_URL = '../free-tools.html';

  function isMobileLayout(){
    try {
      // Prefer coarse pointer detection; fallback to width
      return window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
             window.innerWidth <= 768;
    } catch (_) {
      return window.innerWidth <= 768;
    }
  }

  function enableBackRedirect(){
    // push a dummy state so the first back triggers popstate (instead of leaving immediately)
    try { history.pushState({ rajwan: true }, '', location.href); } catch(_) {}

    window.addEventListener('popstate', function onPop(){
      // On back, go to the desired page
      window.location.href = BACK_URL;
    });
  }

  function init(){
    if (!isMobileLayout()) return; // only apply on mobile layout
    enableBackRedirect();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
