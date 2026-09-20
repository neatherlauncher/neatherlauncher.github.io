/* Google Analytics 4 — loaded via external file to keep strict CSP (no unsafe-inline).
   Measurement ID is a public identifier, safe to commit to a public repo. */
(function () {
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag("js", new Date());
  gtag("config", "G-VX44N9H66D");

  /* Track launcher downloads as GA4 events (works with dynamically-updated hrefs). */
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="github.com/neatherlauncher"]') : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (/releases\/download\//.test(href) || /\.zip($|\?)|\.exe($|\?)|\.deb($|\?)|\.AppImage($|\?)|\.dmg($|\?)|\.apk($|\?)/i.test(href)) {
      gtag("event", "download", {
        file_name: href.split("/").pop().split("?")[0],
        link_url: href,
        link_text: (a.textContent || "").trim().slice(0, 100)
      });
    }
  });
})();
