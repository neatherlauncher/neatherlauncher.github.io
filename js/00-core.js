/* Neather Launcher - shared bootstrap (split from js/main.js; logic unchanged). Clickjacking guard + prefers-reduced-motion flag shared via window.Neather. Load first. */
(function () {
  "use strict";
  /* GitHub Pages serves no custom headers, so meta CSP is our only header
     layer. Break out of iframes as clickjacking defense-in-depth
     (frame-ancestors cannot be set from a <meta> tag). */
  try {
    if (window.top !== window.self) window.top.location = window.self.location;
  } catch (e) { /* cross-origin frame: stay put, page still renders safely */ }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.Neather = window.Neather || {};
  window.Neather.reduceMotion = reduceMotion;
})();
