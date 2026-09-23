/* Screenshot lightbox (split from js/main.js; logic unchanged). */
(function () {
  "use strict";
  /* ---------- Screenshot lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  document.querySelectorAll(".shot").forEach(function (s) {
    s.addEventListener("click", function () {
      var img = s.querySelector("img");
      if (!img || !lightbox || !lightboxImg) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  });
  function closeBox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }
  if (lightbox) {
    lightbox.addEventListener("click", function (e) { if (e.target !== lightboxImg) closeBox(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeBox(); });
    var closeBtn = lightbox.querySelector("button");
    if (closeBtn) closeBtn.addEventListener("click", closeBox);
  }
})();
