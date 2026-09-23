/* OS switch hero widget + download buttons (split from js/main.js; logic unchanged). Owns OS state; exposes it as window.Neather.os for 06-releases.js. */
(function () {
  "use strict";
  /* ---------- OS switch (hero widget) + download buttons ---------- */
  var osButtons = document.querySelectorAll(".os-switch button");
  var dlButtons = document.querySelectorAll("[data-dl]");
  var osHint = document.getElementById("osHintText");

  /* Latest-version state: seeded from the static HTML fallback, then overwritten
     by the GitHub Releases API (single source of truth). No versions or URLs
     are hard-coded here. */
  var heroVersionText = document.getElementById("heroVersionText");
  var currentOS = "windows";
  var LATEST_VERSION = "0.0.1";
  var LATEST_ASSETS = { windows: null, linux: null, android: null, mac: null };
  var FALLBACK_LINKS = { windows: null, linux: null, android: null };
  (function seedFallbackLinks() {
    var heroBtn = document.querySelector('[data-dl="hero"]');
    if (heroBtn) FALLBACK_LINKS.windows = heroBtn.getAttribute("href");
    var barBtns = document.querySelectorAll("#dlBtns a");
    if (barBtns[0]) FALLBACK_LINKS.windows = FALLBACK_LINKS.windows || barBtns[0].getAttribute("href");
    if (barBtns[1]) FALLBACK_LINKS.linux = barBtns[1].getAttribute("href");
    var apkLink = document.getElementById("dlAndroid");
    if (apkLink) FALLBACK_LINKS.android = apkLink.getAttribute("href");
    var m = /(\d+)\.(\d+)\.(\d+)/.exec((heroVersionText && heroVersionText.textContent) || "");
    if (m) LATEST_VERSION = m[1] + "." + m[2] + "." + m[3];
  })();

  function setOS(os) {
    if (os !== "windows" && os !== "linux" && os !== "android") os = "windows";
    /* No Android tab/asset in the hero widget: never strand Android visitors
       on an unselectable state serving them a Windows zip silently. */
    if (os === "android" && !LATEST_ASSETS.android) os = "windows";
    currentOS = os;
    osButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.os === os ? "true" : "false");
    });
    if (osHint) {
      var labels = { windows: "Windows 10 / 11 v", linux: "Linux .deb v", android: "Android v" };
      osHint.textContent = (labels[os] || labels.windows) + LATEST_VERSION;
    }
    dlButtons.forEach(function (btn) {
      if (btn.dataset.dl === "hero") btn.setAttribute("href", LATEST_ASSETS[os] || LATEST_ASSETS.windows || FALLBACK_LINKS[os] || FALLBACK_LINKS.windows);
    });
  }

  osButtons.forEach(function (b) {
    b.addEventListener("click", function () { setOS(b.dataset.os); });
  });

  // Auto-detect OS once (macOS falls back to Windows for the hero button; macOS builds appear in the latest bar when published)
  // Android has no hero tab: remembered as preference and applied once an APK is published.
  var ua = navigator.userAgent.toLowerCase();
  var detectedOS = "windows";
  if (ua.indexOf("android") > -1) detectedOS = "android";
  else if (ua.indexOf("linux") > -1) detectedOS = "linux";
  setOS(detectedOS);
  window.Neather = window.Neather || {};
  window.Neather.os = {
    get currentOS() { return currentOS; },
    set currentOS(v) { currentOS = v; },
    get LATEST_VERSION() { return LATEST_VERSION; },
    set LATEST_VERSION(v) { LATEST_VERSION = v; },
    get detectedOS() { return detectedOS; },
    LATEST_ASSETS: LATEST_ASSETS,
    FALLBACK_LINKS: FALLBACK_LINKS,
    setOS: setOS
  };
})();
