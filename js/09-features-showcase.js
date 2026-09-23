/* Features showcase carousel (split from js/main.js; logic unchanged). */
(function () {
  "use strict";
  /* ---------- Features showcase: left/right cards <-> middle screenshot (arrows) ---------- */
  (function featuresShowcase() {
    var feats = Array.prototype.slice.call(document.querySelectorAll(".features-showcase .feat"));
    var shot = document.getElementById("featureShot");
    var cap = document.getElementById("featureCap");
    var dotsWrap = document.getElementById("stageDots");
    var countEl = document.getElementById("stageCount");
    var prevBtn = document.getElementById("shotPrev");
    var nextBtn = document.getElementById("shotNext");
    if (!feats.length || !shot) return;
    var SHOTS = [
      { src: "assets/neather-launcher-home.png", label: "Neather home — clean, fast, green" },
      { src: "assets/neather-launcher-fps-boost.png", label: "FPS Boost config — smart Java flags" },
      { src: "assets/neather-launcher-accounts.png", label: "Accounts — offline + Ely.by login" },
      { src: "assets/neather-launcher-skins.png", label: "Skins — apply and preview instantly" },
      { src: "assets/neather-launcher-servers.png", label: "Servers — Paper and Fabric in one click" },
      { src: "assets/neather-launcher-tools.png", label: "Tools — gallery + Minecraft calculators" }
    ];
    var current = 0;
    var dots = [];
    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      dots = SHOTS.map(function (s, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", "Show screenshot " + (i + 1));
        if (i === 0) b.classList.add("is-active");
        b.addEventListener("click", function () { goTo(i); });
        dotsWrap.appendChild(b);
        return b;
      });
    }
    function render() {
      var s = SHOTS[current];
      if (!s) return;
      shot.style.opacity = "0";
      setTimeout(function () {
        shot.src = s.src;
        shot.alt = s.label;
        if (cap) cap.textContent = s.label;
        shot.style.opacity = "1";
      }, 140);
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === current); });
      if (countEl) countEl.textContent = (current + 1) + " / " + SHOTS.length;
      feats.forEach(function (f) {
        f.classList.toggle("is-active", f.dataset.shot === s.src && f.dataset.cap === s.label);
      });
    }
    function goTo(i) {
      current = (i + SHOTS.length) % SHOTS.length;
      render();
    }
    function featActivate(f) {
      for (var i = 0; i < SHOTS.length; i++) {
        if (SHOTS[i].src === f.dataset.shot) { goTo(i); return; }
      }
    }
    shot.style.transition = "opacity .18s ease";
    buildDots();
    render();
    // click-only: hovering a card never changes the screenshot
    feats.forEach(function (f) {
      f.addEventListener("click", function () { featActivate(f); });
    });
    if (prevBtn) prevBtn.addEventListener("click", function (e) { e.stopPropagation(); goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function (e) { e.stopPropagation(); goTo(current + 1); });
  })();
})();
