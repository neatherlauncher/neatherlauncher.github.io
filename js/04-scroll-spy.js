/* Scroll spy: active nav link + dimension tint (split from js/main.js; logic unchanged). */
(function () {
  "use strict";
  /* ---------- Scroll spy: highlights the nav link and tints the nav
     with the accent colour of the dimension you are currently in ---------- */
  var SPY = [
    { id: "home", dim: "overworld" },
    { id: "new", dim: "cave" },
    { id: "versions", dim: "nether" },
    { id: "about", dim: "end" },
    { id: "get", dim: "overworld" }
  ];
  var navLinks = document.querySelectorAll(".nav-links a, .mobile-menu a");
  function setActive(id, dim) {
    document.body.setAttribute("data-dim", dim);
    navLinks.forEach(function (a) {
      if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  setActive("home", "overworld");
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        for (var i = 0; i < SPY.length; i++) {
          if (SPY[i].id === e.target.id) { setActive(SPY[i].id, SPY[i].dim); break; }
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    SPY.forEach(function (s) {
      var el = document.getElementById(s.id);
      if (el) spy.observe(el);
    });
  }
})();
