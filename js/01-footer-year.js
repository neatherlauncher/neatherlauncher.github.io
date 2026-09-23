/* Footer year (split from js/main.js; logic unchanged). */
(function () {
  "use strict";
  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
