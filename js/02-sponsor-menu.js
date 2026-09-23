/* Sponsor contact menus top + bottom (split from js/main.js; logic unchanged). */
(function () {
  "use strict";
  /* ---------- Sponsor buttons: toggles contact menu (email + Facebook) ---------- */
  var sponsorPairs = [
    { btn: document.getElementById("sponsorBtn"), menu: document.getElementById("sponsorMenu") },
    { btn: document.getElementById("sponsorBtnBottom"), menu: document.getElementById("sponsorMenuBottom") }
  ];
  function setSponsorPair(pair, open) {
    if (!pair.btn || !pair.menu) return;
    if (open) pair.menu.removeAttribute("hidden");
    else pair.menu.setAttribute("hidden", "");
    pair.btn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  sponsorPairs.forEach(function (pair) {
    if (!pair.btn || !pair.menu) return;
    setSponsorPair(pair, false);
    pair.btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var willOpen = pair.menu.hasAttribute("hidden");
      // close the other menu so only one is open at a time
      sponsorPairs.forEach(function (other) {
        if (other !== pair) setSponsorPair(other, false);
      });
      setSponsorPair(pair, willOpen);
    });
  });
  document.addEventListener("click", function (e) {
    sponsorPairs.forEach(function (pair) {
      if (pair.menu && !pair.menu.hasAttribute("hidden") && pair.btn && !pair.menu.contains(e.target) && !pair.btn.contains(e.target)) setSponsorPair(pair, false);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") sponsorPairs.forEach(function (pair) { setSponsorPair(pair, false); });
  });
})();
