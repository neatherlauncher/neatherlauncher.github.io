/* Static data-count counter animation (split from js/main.js; logic unchanged). */
(function () {
  "use strict";
  /* ---------- Static counter animation (rating etc — anything still using data-count) ---------- */
  var counters = document.querySelectorAll("[data-count]:not([data-download-counter]):not([data-versions-counter])");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, target = parseInt(el.dataset.count, 10), t0 = null;
      function tick(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 1400, 1);
        var val = Math.floor(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = val.toLocaleString() + (el.dataset.suffix || "");
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(function (c) { io.observe(c); });
})();
