/* GitHub downloads + versions counters, reuses the shared releases fetch (split from js/main.js; logic unchanged). Exposes window.Neather.resolveVersionsCount for 06-releases.js. */
(function () {
  "use strict";
  var __rel = (window.Neather && window.Neather.releases) || {};
  var getReleases = __rel.getReleases;
  var sumDownloadCounts = __rel.sumDownloadCounts;
  /* ---------- GitHub-based Downloads + Versions counters (About section) ----------
     Repo: neatherlauncher/neatherlauncher.github.io (public, no token).
     - Downloads = SUM(release.assets[].download_count) across EVERY release.
       Shown in hero (#downloadCount), About (#aboutDownloads) and CTA strip (#ctaDownloads).
       Reuses the single shared getReleases() promise — no second API loop.
     - Versions = number of stable public releases from the same API.
       Shown in About (#aboutVersions). API is truth, no hard-coded numbers. */
  var DOWNLOAD_DISPLAY_OFFSET = 0;
  var downloadEls = Array.prototype.slice.call(document.querySelectorAll("[data-download-counter]"));
  var aboutVersionsEl = document.getElementById("aboutVersions");
  var ctaDownloadsEl = document.getElementById("ctaDownloads");

  function formatDownloads(n) {
    return Number(n).toLocaleString("en-US");
  }

  function formatCompact(n) {
    n = Number(n) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M+";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k+";
    return String(n);
  }

  function animateDownloadCount(el, target) {
    var t0 = null;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1400, 1);
      var val = Math.floor(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = formatDownloads(val);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function animateVersionsCount(el, target) {
    var t0 = null;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1200, 1);
      var val = Math.floor(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = formatDownloads(val);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = formatDownloads(target);
    }
    requestAnimationFrame(tick);
  }

  /* Downloads total comes from the shared releases response — no extra API calls. */
  function fetchGitHubTotalDownloads() {
    return getReleases().then(function (all) { return sumDownloadCounts(all); });
  }

  if (downloadEls.length) {
    var downloadAnimated = false;
    var downloadTarget = null; /* resolved GitHub total */
    var downloadReady = fetchGitHubTotalDownloads().then(function (githubTotal) {
      downloadTarget = githubTotal + DOWNLOAD_DISPLAY_OFFSET;
      if (ctaDownloadsEl) ctaDownloadsEl.textContent = formatCompact(downloadTarget);
      return downloadTarget;
    }).catch(function (err) {
      if (window.console && console.warn) console.warn("Downloads counter fallback:", err);
      downloadTarget = DOWNLOAD_DISPLAY_OFFSET; /* API failed -> honest 0 */
      return downloadTarget;
    });

    function animateAllDownloads(target) {
      downloadEls.forEach(function (el) { animateDownloadCount(el, target); });
    }

    if ("IntersectionObserver" in window) {
      var downloadIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting || downloadAnimated) return;
          downloadAnimated = true;
          downloadReady.then(function (target) {
            animateAllDownloads(target);
          });
          downloadEls.forEach(function (el) { downloadIO.unobserve(el); });
        });
      }, { threshold: 0.4 });
      downloadEls.forEach(function (el) { downloadIO.observe(el); });
    } else {
      downloadReady.then(function (target) {
        animateAllDownloads(target);
      });
    }
  }

  /* Versions count resolves from the releases fetch below (same GitHub API).
     Exposed here so renderLatest/renderHistory can update it without a second call. */
  var versionsAnimated = false;
  var versionsTarget = null;
  var versionsReadyResolve;
  var versionsReady = new Promise(function (res) { versionsReadyResolve = res; });
  function resolveVersionsCount(n) {
    versionsTarget = Math.max(0, Number(n) || 0);
    if (versionsReadyResolve) versionsReadyResolve(versionsTarget);
  }
  function animateVersionsWhenVisible() {
    if (!aboutVersionsEl || versionsAnimated) return;
    versionsAnimated = true;
    versionsReady.then(function (target) { animateVersionsCount(aboutVersionsEl, target); });
  }
  if (aboutVersionsEl) {
    if ("IntersectionObserver" in window) {
      var versionsIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          animateVersionsWhenVisible();
          versionsIO.unobserve(aboutVersionsEl);
        });
      }, { threshold: 0.4 });
      versionsIO.observe(aboutVersionsEl);
    } else {
      animateVersionsWhenVisible();
    }
  }
  window.Neather = window.Neather || {};
  window.Neather.resolveVersionsCount = resolveVersionsCount;
})();
