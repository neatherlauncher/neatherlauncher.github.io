/* GitHub Releases: single source of truth for versions/downloads (split from js/main.js; logic unchanged). Reads OS state via window.Neather.os; shares the fetch promise via window.Neather.releases. */
(function () {
  "use strict";
  var OS = (window.Neather && window.Neather.os) || {};
  var heroVersionText = document.getElementById("heroVersionText");
  /* ============================================================
     Neather Releases — GitHub Releases API is the single source of truth
     for launcher versions, dates, changelogs and download assets.
     Repo: neatherlauncher/neatherlauncher.github.io (public, no token).
     Rules:
       - Ignore drafts and pre-releases (prerelease === true).
       - Parse tags into MAJOR.MINOR.PATCH (leading "v" stripped).
        - Listed releases: stable releases that ship at least one Setup /
          Portable (or legacy untagged) download asset. Drafts,
          pre-releases, invalid tags and Update-only releases are hidden.
        - The channel tags decide, not the version number: 1.0.1 with a
          Setup bundle is shown, 2.0.0 with Update-only payloads is not.
        - History, About counter and Latest bar all use the same listed
          set, sorted newest -> oldest by semantic version (not ABC).
        - Latest-version bar uses the NEWEST listed release.
        - Platform from asset filename: -win- / -linux- / -mac- (+ android).
        - Release channel from the filename token before the extension:
          *-Setup.* = full setup bundle (listed), *-Portable.* = portable
          bundle (listed), *-Update.* = auto-updater payload, NEVER listed
          anywhere (no buttons, no history links, no size total).
          e.g. Neather-Launcher-0.0.1-win-x64-Setup.exe is listed,
          Neather-Launcher-0.0.1-win-x64-Update.exe is skipped.
        - Package kinds: -Setup.exe = installer, -Setup.zip = setup-zip,
          -Portable.zip/.zip = portable ZIP, .AppImage = Linux app,
          .dmg = macOS installer, .deb = Linux package, .apk = Android.
          .zip files are always valid launcher packages
          (0.0.1 ships ZIP-only).
        - Windows shows Installer (.exe) + Portable (.zip) when both assets
          exist, Installer (.exe) + Setup (.zip) when there is a setup ZIP
          but no portable ZIP, otherwise whichever exists.
          Only real browser_download_url values are used — never invented.
     ============================================================ */
  var RELEASES_REPO = "neatherlauncher/neatherlauncher.github.io";
  var ARROW = "<svg class=\"ico ico-download\" viewBox=\"0 0 1920 1920\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M1764.098 1355.412 1920 1511.314l-363.073 363.073H363.073L0 1511.314l155.902-155.902 298.463 298.463h1011.27l298.463-298.463ZM1070.333 0v949.967l250.502-250.612 155.902 155.902-518.975 518.975-518.976-518.975 155.902-155.902 255.023 255.022V0h220.622Z\"/></svg>";

  var tbody = document.getElementById("releasesBody");
  var search = document.getElementById("releaseSearch");
  var count = document.getElementById("releaseCount");
  var latestVersionName = document.getElementById("latestVersionName");
  var latestVersionMeta = document.getElementById("latestVersionMeta");
  var dlAndroid = document.getElementById("dlAndroid");
  var dlBtns = document.getElementById("dlBtns");
  var winBtnEl = document.querySelector("#dlBtns .btn-acc");
  var linBtnEl = document.querySelector("#dlBtns .btn-ghost");
  var portBtnEl = null;
  var macBtnEls = [];
  var LISTED_RELEASES = [];
  var LATEST_TAG = null;

  function parseSemver(tag) {
    var t = String(tag == null ? "" : tag).trim().replace(/^[vV]/, "");
    var m = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(t);
    if (!m) return null;
    return { major: parseInt(m[1], 10), minor: parseInt(m[2], 10), patch: parseInt(m[3], 10), version: m[1] + "." + m[2] + "." + m[3] };
  }

  /* A release is listed only if it ships something a visitor can actually
     download: at least one Setup / Portable (or legacy untagged) asset.
     Update-only releases are updater payloads, never shown — the channel
     tags decide, not the version number (1.0.1 with Setup shows,
     2.0.0 Update-only does not). */
  function hasListableAssets(release) {
    var grouped = platformAssets(release);
    return grouped.windows.length > 0 || grouped.linux.length > 0 || grouped.mac.length > 0 || grouped.android.length > 0;
  }

  function compareSemver(a, b) {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    return a.patch - b.patch;
  }

  function releaseSortDesc(x, y) {
    var cmp = compareSemver(parseSemver(y.tag_name), parseSemver(x.tag_name));
    if (cmp !== 0) return cmp;
    var dx = new Date(x.published_at).getTime() || 0;
    var dy = new Date(y.published_at).getTime() || 0;
    return dy - dx;
  }

  function detectPlatform(fileName) {
    var n = String(fileName || "").toLowerCase();
    if (n.indexOf("-win-") > -1) return "windows";
    if (n.indexOf("-linux-") > -1) return "linux";
    if (n.indexOf("-mac-") > -1) return "mac";
    if (n.indexOf("android") > -1 || /\.apk($|\?)/.test(n)) return "android";
    if (n.indexOf("windows") > -1 || n.indexOf("win64") > -1 || /\.exe($|\?)/.test(n)) return "windows";
    if (n.indexOf("linux") > -1 || n.indexOf("appimage") > -1 || /\.deb($|\?)/.test(n)) return "linux";
    if (n.indexOf("macos") > -1 || n.indexOf("darwin") > -1 || /\.dmg($|\?)/.test(n)) return "mac";
    if (/\.zip($|\?)/.test(n)) return "windows"; /* portable ZIPs are Windows builds */
    return "other";
  }

  /* Release channel from the filename: the dash/underscore/dot separated
     token "setup" / "update" / "portable" (case-insensitive), e.g.
     Neather-Launcher-0.0.1-win-x64-Setup.exe -> "setup",
     Neather-Launcher-0.0.1-win-x64-Update.zip -> "update",
     Neather-Launcher-0.0.1-win-x64-Portable.zip -> "portable".
     Returns "" when the name carries no channel token (legacy assets). */
  function detectChannel(fileName) {
    var n = String(fileName || "").toLowerCase().split("?")[0].split("#")[0];
    if (/(^|[-_.])update([-_.]|$)/.test(n)) return "update";
    if (/(^|[-_.])setup([-_.]|$)/.test(n)) return "setup";
    if (/(^|[-_.])portable([-_.]|$)/.test(n)) return "portable";
    return "";
  }

  /* Package kind from filename. .zip is always a valid portable package:
     -Setup.exe -> installer, -Setup.zip -> setup-zip, -Portable.zip ->
     portable, .AppImage -> appimage, .dmg -> dmg, .apk -> apk, .deb ->
     package, bare .exe -> installer. */
  function detectAssetKind(fileName) {
    var n = String(fileName || "").toLowerCase();
    if (n.indexOf("-portable.zip") > -1 || (/\.zip($|\?)/.test(n) && n.indexOf("portable") > -1)) return "portable";
    if (n.indexOf("-setup.exe") > -1 || (/\.exe($|\?)/.test(n) && n.indexOf("setup") > -1)) return "installer";
    if (/\.appimage($|\?)/.test(n)) return "appimage";
    if (/\.dmg($|\?)/.test(n)) return "dmg";
    if (/\.apk($|\?)/.test(n)) return "apk";
    if (/\.exe($|\?)/.test(n)) return "installer";
    if (/\.zip($|\?)/.test(n)) return detectChannel(fileName) === "setup" ? "setup-zip" : "portable";
    if (/\.deb($|\?)/.test(n)) return "package";
    return "other";
  }

  function detectArch(fileName) {
    var n = String(fileName || "").toLowerCase();
    if (n.indexOf("arm64") > -1 || n.indexOf("aarch64") > -1) return "arm";
    if (n.indexOf("x64") > -1 || n.indexOf("x86_64") > -1 || n.indexOf("amd64") > -1 || n.indexOf("intel") > -1) return "x64";
    return "";
  }

  /* Grouped asset lists per platform. Only real GitHub assets with a
     browser_download_url are listed — never invent a download URL.
     *-Update.* payloads are updater-only and never listed anywhere. */
  function platformAssets(release) {
    var map = { windows: [], linux: [], mac: [], android: [] };
    var assets = (release && release.assets) || [];
    for (var i = 0; i < assets.length; i++) {
      var a = assets[i];
      if (!a || !a.browser_download_url) continue;
      if (detectChannel(a.name) === "update") continue;
      var p = detectPlatform(a.name);
      if (map[p]) map[p].push(a);
    }
    return map;
  }

  function firstOfKind(list, kind) {
    for (var i = 0; i < list.length; i++) {
      if (detectAssetKind(list[i].name) === kind) return list[i];
    }
    return null;
  }

  function dlLink(href, label) {
    return '<a class="dl-link" href="' + escapeHtml(href) + '" rel="noopener noreferrer">' + ARROW + ' ' + escapeHtml(label) + '</a> ';
  }

  function setBtnLabel(btn, label) {
    if (!btn) return;
    var icon = btn.querySelector("svg");
    btn.textContent = label;
    if (icon) btn.insertBefore(icon, btn.firstChild);
  }

  function totalAssetSize(release) {
    var total = 0;
    var assets = (release && release.assets) || [];
    for (var i = 0; i < assets.length; i++) {
      if (detectChannel(assets[i].name) === "update") continue; /* updater payloads are not downloads */
      total += Number(assets[i].size) || 0;
    }
    return total;
  }

  function formatBytesMB(bytes) {
    var b = Number(bytes) || 0;
    if (b > 0 && b < 1048576) return Math.max(1, Math.round(b / 1024)) + " KB";
    return Math.round(b / 1048576) + " MB";
  }

  function formatMonthYear(iso) {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso || "").slice(0, 10);
    return months[d.getMonth()] + " " + d.getFullYear();
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function summarizeNotes(body) {
    var text = String(body || "").replace(/\r/g, "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    if (text.length > 160) text = text.slice(0, 157).trim() + "…";
    return text;
  }

  function fetchAllReleases() {
    var all = [];
    var page = 1;
    function fetchPage() {
      var url = "https://api.github.com/repos/" + RELEASES_REPO + "/releases?per_page=100&page=" + page;
      return fetch(url, { headers: { "Accept": "application/vnd.github+json" } }).then(function (res) {
        if (!res.ok) throw new Error("GitHub API error: " + res.status);
        return res.json();
      }).then(function (items) {
        if (!Array.isArray(items) || items.length === 0) return all;
        all = all.concat(items);
        if (items.length < 100) return all;
        page += 1;
        if (page > 100) return all; /* safety cap: up to 10,000 releases */
        return fetchPage();
      });
    }
    return fetchPage();
  }

  /* Single shared fetch: one paginated request serves the releases table,
     the latest-version bar, the versions counter AND the downloads counter,
     so public traffic costs 1x API quota instead of 2x (60 req/hr/IP). */
  var releasesPromise = null;
  function getReleases() {
    if (!releasesPromise) releasesPromise = fetchAllReleases();
    return releasesPromise;
  }
  function sumDownloadCounts(all) {
    var total = 0;
    for (var i = 0; i < (all || []).length; i++) {
      var assets = (all[i] && all[i].assets) || [];
      for (var j = 0; j < assets.length; j++) total += Number(assets[j].download_count) || 0;
    }
    return total;
  }

  function publicReleases(all) {
    return all.filter(function (r) {
      if (!r || r.draft === true || r.prerelease === true) return false;
      return parseSemver(r.tag_name) !== null;
    });
  }

  /* Newest listed release by semantic version (Update-only releases can
     never become "latest"). */
  function pickLatestStable(list) {
    var listed = list.filter(hasListableAssets);
    if (!listed.length) return null;
    return listed.slice().sort(releaseSortDesc)[0];
  }

  /* Listed releases, newest first. */
  function pickListedReleases(list) {
    return list.filter(hasListableAssets).sort(releaseSortDesc);
  }

  function renderLatest(latest) {
    if (!latest) return;
    var p = parseSemver(latest.tag_name);
    OS.LATEST_VERSION = p.version;
    var tag = "v" + p.version;
    var assets = platformAssets(latest);
    var winInstaller = firstOfKind(assets.windows, "installer");
    var winPortable = firstOfKind(assets.windows, "portable");
    var winSetupZip = firstOfKind(assets.windows, "setup-zip");
    var winPrimary = winInstaller || winPortable || winSetupZip || assets.windows[0] || null;
    var linAsset = firstOfKind(assets.linux, "appimage") || assets.linux[0] || null;
    var apkAsset = assets.android[0] || null;
    /* Once the API responds it is the truth: null means "no build published",
       so stale static fallbacks are never used (hero falls back to the
       Windows build instead of a dead local file). */
    OS.LATEST_ASSETS.windows = winPrimary ? winPrimary.browser_download_url : null;
    OS.LATEST_ASSETS.linux = linAsset ? linAsset.browser_download_url : null;
    OS.LATEST_ASSETS.android = apkAsset ? apkAsset.browser_download_url : null;
    OS.LATEST_ASSETS.mac = assets.mac[0] ? assets.mac[0].browser_download_url : null;

    if (heroVersionText) heroVersionText.textContent = tag + " stable";
    if (latestVersionName) latestVersionName.textContent = tag + " stable";
    if (latestVersionMeta) {
      var plats = [];
      if (assets.windows.length) plats.push("Windows");
      if (assets.linux.length) plats.push("Linux");
      if (assets.mac.length) plats.push("macOS");
      if (assets.android.length) plats.push("Android");
      var meta = formatMonthYear(latest.published_at) + " · " + formatBytesMB(totalAssetSize(latest));
      if (plats.length) meta += " · " + plats.join(" + ");
      latestVersionMeta.textContent = meta;
    }
    /* Windows: installer + portable shown as separate options when both exist;
       installer + setup ZIP when there is no portable ZIP; a ZIP-only
       release shows the ZIP as the Windows download. Hidden when
       the latest release has no Windows asset at all. */
    if (winBtnEl) { winBtnEl.setAttribute("rel", "noopener noreferrer");
      if (!winPrimary) winBtnEl.setAttribute("hidden", "");
      else {
        winBtnEl.removeAttribute("hidden");
        if (winInstaller && winPortable) {
          winBtnEl.setAttribute("href", winInstaller.browser_download_url);
          setBtnLabel(winBtnEl, "Installer (.exe)");
        } else if (winPortable) {
          winBtnEl.setAttribute("href", winPortable.browser_download_url);
          setBtnLabel(winBtnEl, "Windows (.zip)");
        } else if (winInstaller && winSetupZip) {
          winBtnEl.setAttribute("href", winInstaller.browser_download_url);
          setBtnLabel(winBtnEl, "Installer (.exe)");
        } else if (winSetupZip) {
          winBtnEl.setAttribute("href", winSetupZip.browser_download_url);
          setBtnLabel(winBtnEl, "Setup (.zip)");
        } else {
          winBtnEl.setAttribute("href", winPrimary.browser_download_url);
        }
      }
    }
    /* Second Windows button: the portable ZIP when one exists, otherwise
       the setup ZIP — never an *-Update.* payload (already filtered). */
    var winSecondary = (winInstaller && winPortable) ? winPortable : (winInstaller && winSetupZip) ? winSetupZip : null;
    if (winSecondary && dlBtns) {
      if (!portBtnEl) {
        portBtnEl = document.createElement("a");
        portBtnEl.className = "btn btn-ghost";
        if (linBtnEl) dlBtns.insertBefore(portBtnEl, linBtnEl);
        else dlBtns.appendChild(portBtnEl);
      }
      portBtnEl.setAttribute("href", winSecondary.browser_download_url);
      portBtnEl.setAttribute("download", "");
      portBtnEl.setAttribute("rel", "noopener noreferrer");
      setBtnLabel(portBtnEl, detectAssetKind(winSecondary.name) === "portable" ? "Portable (.zip)" : "Setup (.zip)");
      portBtnEl.removeAttribute("hidden");
    } else if (portBtnEl) portBtnEl.setAttribute("hidden", "");
    /* Linux button only exists when the latest release published a Linux asset. */
    if (linBtnEl) { linBtnEl.setAttribute("rel", "noopener noreferrer");
      if (linAsset) { linBtnEl.setAttribute("href", linAsset.browser_download_url); linBtnEl.removeAttribute("hidden"); }
      else linBtnEl.setAttribute("hidden", "");
    }
    /* Hero OS tabs: hide the Linux tab when there is no Linux build, so the
       home section never offers a download that does not exist. */
    var osLinuxBtn = document.querySelector('.os-switch button[data-os="linux"]');
    if (osLinuxBtn) {
      if (linAsset) osLinuxBtn.removeAttribute("hidden");
      else {
        osLinuxBtn.setAttribute("hidden", "");
        if (OS.currentOS === "linux") OS.currentOS = "windows";
      }
    }
    /* macOS: one button per published .dmg (x64 + arm64), created only when the
       corresponding GitHub asset actually exists. */
    for (var mi = 0; mi < macBtnEls.length; mi++) {
      if (macBtnEls[mi].parentNode) macBtnEls[mi].parentNode.removeChild(macBtnEls[mi]);
    }
    macBtnEls = [];
    if (dlBtns) {
      for (var di = 0; di < assets.mac.length; di++) {
        (function (asset) {
          var b = document.createElement("a");
          b.className = "btn btn-ghost";
          var arch = detectArch(asset.name);
          b.textContent = arch === "arm" ? "macOS Arm (.dmg)" : arch === "x64" ? "macOS Intel (.dmg)" : "macOS (.dmg)";
          b.setAttribute("href", asset.browser_download_url);
          b.setAttribute("download", "");
          b.setAttribute("rel", "noopener noreferrer");
          dlBtns.appendChild(b);
          macBtnEls.push(b);
        })(assets.mac[di]);
      }
    }
    /* Android APK link only when the latest release published one. */
    var miniNote = document.querySelector(".mini-note");
    if (dlAndroid) {
      if (apkAsset) dlAndroid.setAttribute("href", apkAsset.browser_download_url);
      else if (miniNote) miniNote.setAttribute("hidden", "");
    }
    /* Re-apply the visitor's detected OS now that real assets are known,
       so Android users get the APK the moment one is published. */
    if (typeof OS.detectedOS === "string" && OS.detectedOS === "android" && apkAsset) OS.setOS("android");
    else OS.setOS(OS.currentOS);
  }

  function renderHistory(filter) {
    if (!tbody) return;
    if (!LISTED_RELEASES.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty">No downloadable releases published yet.</td></tr>';
      if (count) count.textContent = "0 releases.";
      return;
    }
    var q = (filter || "").toLowerCase().trim();
    var rows = LISTED_RELEASES.filter(function (r) {
      if (!q) return true;
      var hay = (r.tag_name + " " + (r.name || "") + " " + (r.body || "")).toLowerCase();
      return hay.indexOf(q) > -1;
    });
    tbody.innerHTML = rows.map(function (r) {
      var p = parseSemver(r.tag_name);
      var tag = "v" + p.version;
      var isLatest = LATEST_TAG !== null && r.tag_name === LATEST_TAG;
      var date = String(r.published_at || "").slice(0, 10);
      var size = formatBytesMB(totalAssetSize(r));
      var title = String(r.name || "").trim();
      var snippet = summarizeNotes(r.body);
      var cell = "";
      if (title && title !== tag && title.toLowerCase() !== p.version) cell += escapeHtml(title) + " — ";
      cell += escapeHtml(snippet || "See GitHub for release notes.");
      var url = r.html_url || ("https://github.com/" + RELEASES_REPO + "/releases");
      var assets = platformAssets(r);
      var links = "";
      var wInst = firstOfKind(assets.windows, "installer");
      var wPort = firstOfKind(assets.windows, "portable");
      var wSetup = firstOfKind(assets.windows, "setup-zip");
      if (wInst && wPort) {
        links += dlLink(wInst.browser_download_url, "Installer (.exe)");
        links += dlLink(wPort.browser_download_url, "Portable (.zip)");
      } else if (wInst && wSetup) {
        links += dlLink(wInst.browser_download_url, "Installer (.exe)");
        links += dlLink(wSetup.browser_download_url, "Setup (.zip)");
      } else if (wPort) {
        links += dlLink(wPort.browser_download_url, "Windows (.zip)");
      } else if (wSetup) {
        links += dlLink(wSetup.browser_download_url, "Setup (.zip)");
      } else if (wInst) {
        links += dlLink(wInst.browser_download_url, "Windows");
      } else {
        for (var wi = 0; wi < assets.windows.length; wi++) {
          links += dlLink(assets.windows[wi].browser_download_url, "Windows");
        }
      }
      var linApp = firstOfKind(assets.linux, "appimage");
      if (linApp) links += dlLink(linApp.browser_download_url, "Linux");
      for (var li = 0; li < assets.linux.length; li++) {
        if (assets.linux[li] === linApp) continue;
        var lk = detectAssetKind(assets.linux[li].name);
        links += dlLink(assets.linux[li].browser_download_url, lk === "package" ? "Linux (.deb)" : (lk === "portable" || lk === "setup-zip") ? "Linux (.zip)" : "Linux");
      }
      for (var gi = 0; gi < assets.mac.length; gi++) {
        var ga = detectArch(assets.mac[gi].name);
        links += dlLink(assets.mac[gi].browser_download_url, ga === "arm" ? "macOS Arm" : ga === "x64" ? "macOS Intel" : "macOS");
      }
      if (assets.android[0]) links += dlLink(assets.android[0].browser_download_url, "Android");
      if (!links) links = '<a class="dl-link" href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">GitHub</a>';
      return '<tr>' +
        '<td><a class="ver-pill stable" href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(tag) + '</a>' +
          (isLatest ? '<span class="tag-latest">Latest</span>' : '') + '</td>' +
        '<td class="nowrap">' + escapeHtml(date) + ' <span class="dim">· ' + escapeHtml(size) + '</span></td>' +
        '<td class="changelog">' + cell + '</td>' +
        '<td class="dl-cell">' + links + '</td>' +
        '</tr>';
    }).join("") || '<tr><td colspan="4" class="empty">No releases match your search. Try a version number like 1.0.</td></tr>';
    if (count) count.textContent = rows.length + " release" + (rows.length === 1 ? "" : "s") + ".";
  }

  if (search) search.addEventListener("input", function () { renderHistory(search.value); });
  if (count) count.textContent = "Loading releases…";
  getReleases().then(function (all) {
    var pub = publicReleases(all);
    var latest = pickLatestStable(pub);
    if (latest) {
      LATEST_TAG = latest.tag_name;
      renderLatest(latest);
    }
    LISTED_RELEASES = pickListedReleases(pub);
    renderHistory(search ? search.value : "");
    /* About → versions stat = number of listed releases (same set as the table) */
    if (window.Neather && typeof window.Neather.resolveVersionsCount === "function") window.Neather.resolveVersionsCount(LISTED_RELEASES.length);
    else {
      var av = document.getElementById("aboutVersions");
      if (av) av.textContent = String(LISTED_RELEASES.length);
    }
  }).catch(function (err) {
    if (window.console && console.warn) console.warn("Releases fallback:", err);
    if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="empty">Could not load releases from GitHub. Please check your connection or <a href="https://github.com/' + RELEASES_REPO + '/releases" target="_blank" rel="noopener noreferrer">view releases on GitHub</a>.</td></tr>';
    if (count) count.textContent = "Could not load releases.";
    if (window.Neather && typeof window.Neather.resolveVersionsCount === "function") window.Neather.resolveVersionsCount(0);
  });
  window.Neather = window.Neather || {};
  window.Neather.releases = {
    getReleases: getReleases,
    sumDownloadCounts: sumDownloadCounts,
    publicReleases: publicReleases,
    RELEASES_REPO: RELEASES_REPO
  };
})();
