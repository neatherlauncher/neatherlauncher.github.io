/* Neather Launcher — interactions + Minecraft dimension backgrounds
   Home = Overworld · What's new = Cave · Versions = Nether · About = The End */
(function () {
  "use strict";

  /* GitHub Pages serves no custom headers, so meta CSP is our only header
     layer. Break out of iframes as clickjacking defense-in-depth
     (frame-ancestors cannot be set from a <meta> tag). */
  try {
    if (window.top !== window.self) window.top.location = window.self.location;
  } catch (e) { /* cross-origin frame: stay put, page still renders safely */ }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById("hamburger");
  var mobileMenu = document.getElementById("mobileMenu");
  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.textContent = open ? "✕" : "☰";
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileMenu.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        burger.textContent = "☰";
      });
    });
  }

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

  /* ============================================================
     Neather Releases — GitHub Releases API is the single source of truth
     for launcher versions, dates, changelogs and download assets.
     Repo: neatherlauncher/neatherlauncher.github.io (public, no token).
     Rules:
       - Ignore drafts and pre-releases (prerelease === true).
       - Parse tags into MAJOR.MINOR.PATCH (leading "v" stripped).
       - Major-release history: PATCH === 0, plus explicit 0.0.1 seed.
       - History sorted newest -> oldest by semantic version (not ABC).
       - Latest-version bar uses the NEWEST stable release (no PATCH filter).
       - Platform from asset filename: -win- / -linux- / -mac- (+ android).
       - Package kinds: -Setup.exe = installer, -Portable.zip/.zip = portable
         ZIP, .AppImage = Linux app, .dmg = macOS installer. .zip files are
         always valid launcher packages (0.0.1 ships ZIP-only).
       - Windows shows Installer (.exe) + Portable (.zip) when both assets
         exist, otherwise whichever exists (ZIP-only shows the ZIP).
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
  var MAJOR_RELEASES = [];
  var LATEST_TAG = null;

  function parseSemver(tag) {
    var t = String(tag == null ? "" : tag).trim().replace(/^[vV]/, "");
    var m = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(t);
    if (!m) return null;
    return { major: parseInt(m[1], 10), minor: parseInt(m[2], 10), patch: parseInt(m[3], 10), version: m[1] + "." + m[2] + "." + m[3] };
  }

  function isMajorRelease(p) {
    if (!p) return false;
    if (p.major === 0 && p.minor === 0 && p.patch === 1) return true; /* 0.0.1 initial release */
    return p.patch === 0;
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

  /* Package kind from filename. .zip is always a valid portable package:
     -Setup.exe -> installer, -Portable.zip -> portable, .AppImage -> appimage,
     .dmg -> dmg, .apk -> apk, .deb -> package, bare .exe -> installer. */
  function detectAssetKind(fileName) {
    var n = String(fileName || "").toLowerCase();
    if (n.indexOf("-portable.zip") > -1 || (/\.zip($|\?)/.test(n) && n.indexOf("portable") > -1)) return "portable";
    if (n.indexOf("-setup.exe") > -1 || (/\.exe($|\?)/.test(n) && n.indexOf("setup") > -1)) return "installer";
    if (/\.appimage($|\?)/.test(n)) return "appimage";
    if (/\.dmg($|\?)/.test(n)) return "dmg";
    if (/\.apk($|\?)/.test(n)) return "apk";
    if (/\.exe($|\?)/.test(n)) return "installer";
    if (/\.zip($|\?)/.test(n)) return "portable";
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
     browser_download_url are listed — never invent a download URL. */
  function platformAssets(release) {
    var map = { windows: [], linux: [], mac: [], android: [] };
    var assets = (release && release.assets) || [];
    for (var i = 0; i < assets.length; i++) {
      var a = assets[i];
      if (!a || !a.browser_download_url) continue;
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
    for (var i = 0; i < assets.length; i++) total += Number(assets[i].size) || 0;
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

  /* Newest stable release by semantic version (NO patch filter). */
  function pickLatestStable(list) {
    if (!list.length) return null;
    return list.slice().sort(releaseSortDesc)[0];
  }

  /* Major-release history: PATCH === 0 plus explicit 0.0.1, newest first. */
  function pickMajorReleases(list) {
    return list.filter(function (r) {
      return isMajorRelease(parseSemver(r.tag_name));
    }).sort(releaseSortDesc);
  }

  function renderLatest(latest) {
    if (!latest) return;
    var p = parseSemver(latest.tag_name);
    LATEST_VERSION = p.version;
    var tag = "v" + p.version;
    var assets = platformAssets(latest);
    var winInstaller = firstOfKind(assets.windows, "installer");
    var winPortable = firstOfKind(assets.windows, "portable");
    var winPrimary = winInstaller || winPortable || assets.windows[0] || null;
    var linAsset = firstOfKind(assets.linux, "appimage") || assets.linux[0] || null;
    var apkAsset = assets.android[0] || null;
    /* Once the API responds it is the truth: null means "no build published",
       so stale static fallbacks are never used (hero falls back to the
       Windows build instead of a dead local file). */
    LATEST_ASSETS.windows = winPrimary ? winPrimary.browser_download_url : null;
    LATEST_ASSETS.linux = linAsset ? linAsset.browser_download_url : null;
    LATEST_ASSETS.android = apkAsset ? apkAsset.browser_download_url : null;
    LATEST_ASSETS.mac = assets.mac[0] ? assets.mac[0].browser_download_url : null;

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
       a ZIP-only release shows the ZIP as the Windows download. Hidden when
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
        } else {
          winBtnEl.setAttribute("href", winPrimary.browser_download_url);
        }
      }
    }
    if (winInstaller && winPortable && dlBtns) {
      if (!portBtnEl) {
        portBtnEl = document.createElement("a");
        portBtnEl.className = "btn btn-ghost";
        if (linBtnEl) dlBtns.insertBefore(portBtnEl, linBtnEl);
        else dlBtns.appendChild(portBtnEl);
      }
      portBtnEl.setAttribute("href", winPortable.browser_download_url);
      portBtnEl.setAttribute("download", "");
      portBtnEl.setAttribute("rel", "noopener noreferrer");
      setBtnLabel(portBtnEl, "Portable (.zip)");
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
        if (currentOS === "linux") currentOS = "windows";
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
    if (typeof detectedOS === "string" && detectedOS === "android" && apkAsset) setOS("android");
    else setOS(currentOS);
  }

  function renderHistory(filter) {
    if (!tbody) return;
    if (!MAJOR_RELEASES.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty">No major releases published yet.</td></tr>';
      if (count) count.textContent = "0 releases.";
      return;
    }
    var q = (filter || "").toLowerCase().trim();
    var rows = MAJOR_RELEASES.filter(function (r) {
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
      if (wInst && wPort) {
        links += dlLink(wInst.browser_download_url, "Installer (.exe)");
        links += dlLink(wPort.browser_download_url, "Portable (.zip)");
      } else if (wPort) {
        links += dlLink(wPort.browser_download_url, "Windows (.zip)");
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
        links += dlLink(assets.linux[li].browser_download_url, lk === "package" ? "Linux (.deb)" : lk === "portable" ? "Linux (.zip)" : "Linux");
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
    MAJOR_RELEASES = pickMajorReleases(pub);
    renderHistory(search ? search.value : "");
    /* About → versions stat = real stable release count from GitHub API */
    if (typeof resolveVersionsCount === "function") resolveVersionsCount(pub.length);
    else {
      var av = document.getElementById("aboutVersions");
      if (av) av.textContent = String(pub.length);
    }
  }).catch(function (err) {
    if (window.console && console.warn) console.warn("Releases fallback:", err);
    if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="empty">Could not load releases from GitHub. Please check your connection or <a href="https://github.com/' + RELEASES_REPO + '/releases" target="_blank" rel="noopener noreferrer">view releases on GitHub</a>.</td></tr>';
    if (count) count.textContent = "Could not load releases.";
    if (typeof resolveVersionsCount === "function") resolveVersionsCount(0);
  });

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

  /* ============================================================
     OVERWORLD — hero background (your original scene, unchanged)
     ============================================================ */
  (function mcBackground() {
    var cv = document.getElementById("mcBg");
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var U = 32;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var w = 0, h = 0, skyC, terC, stars, clouds, flies, moon, nebula, glowSpots;
    var shoot = null, nextShoot = 5000;
    var nearYs = null, midYs = null, sheep = [], sheepLast = 0;

    function rng(seed) {
      return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    function layer() { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }

    function build() {
      var box = cv.parentNode;
      w = box.clientWidth; h = box.clientHeight;
      cv.width = w; cv.height = h;
      var rand = rng(77);
      function inCenter(x) { return x > w * 0.26 && x < w * 0.74; }

      skyC = layer();
      var sg = skyC.getContext("2d");
      /* smooth night sky — no blocky patches, just soft gradients */
      var sky = sg.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#071a0c");
      sky.addColorStop(0.45, "#12341a");
      sky.addColorStop(0.75, "#1a5223");
      sky.addColorStop(1, "#256e33");
      sg.fillStyle = sky;
      sg.fillRect(0, 0, w, h);
      /* soft center glow */
      var glow = sg.createRadialGradient(w / 2, h * 0.32, 0, w / 2, h * 0.32, w * 0.55);
      glow.addColorStop(0, "rgba(90, 190, 80, 0.22)");
      glow.addColorStop(1, "rgba(90, 190, 80, 0)");
      sg.fillStyle = glow;
      sg.fillRect(0, 0, w, h);
      /* faint horizon warmth so the sky meets the hills cleanly */
      var hor = sg.createLinearGradient(0, h * 0.55, 0, h);
      hor.addColorStop(0, "rgba(110, 220, 110, 0)");
      hor.addColorStop(1, "rgba(110, 220, 110, 0.14)");
      sg.fillStyle = hor;
      sg.fillRect(0, 0, w, h);
      /* 2-3 large soft depth blobs (gradient, never hard squares) */
      nebula = [];
      for (var ni = 0; ni < 4; ni++) {
        var bx = w * (0.15 + rand() * 0.7), by = h * (0.1 + rand() * 0.35), br = 180 + rand() * 260;
        var bgr = sg.createRadialGradient(bx, by, 0, bx, by, br);
        bgr.addColorStop(0, "rgba(90, 200, 120, 0.06)");
        bgr.addColorStop(1, "rgba(90, 200, 120, 0)");
        sg.fillStyle = bgr;
        sg.fillRect(bx - br, by - br, br * 2, br * 2);
      }

      terC = layer();
      var g = terC.getContext("2d");

      function terrain(base, amp, phase, body, top1, top2, density) {
        var ys = [];
        for (var x = 0; x < w; x += U) {
          var n = Math.sin(x * 0.004 + phase) * amp + Math.sin(x * 0.011 + phase * 2.3) * amp * 0.45;
          var y = Math.round((base - n) / U) * U;
          ys.push(y);
          g.fillStyle = body;
          g.fillRect(x, y, U, h - y);
          if (density) {
            for (var yy = y + 16; yy < h; yy += 8) {
              for (var xx = x; xx < x + U; xx += 8) {
                if (rand() < density * 0.55) { g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(xx, yy, 8, 8); }
              }
            }
          }
          g.fillStyle = top1; g.fillRect(x, y, U, 8);
          g.fillStyle = top2; g.fillRect(x, y + 8, U, 8);
        }
        return ys;
      }
      function tree(x, gy, u, trunk, leaf, light) {
        g.fillStyle = trunk;
        g.fillRect(x + u, gy - 2 * u + 4, u, 2 * u);
        g.fillStyle = leaf;
        g.fillRect(x - u, gy - 4 * u, 5 * u, 2 * u);
        g.fillRect(x, gy - 5 * u, 3 * u, u);
        g.fillStyle = light;
        g.fillRect(x, gy - 5 * u, 3 * u, u / 2);
      }
      function trees(ys, u, chance, trunk, leaf, light) {
        for (var c = 1; c < ys.length - 2; c++) {
          var x = c * U;
          if (!inCenter(x) && rand() < chance) { tree(x, ys[c], u, trunk, leaf, light); c += 3; }
        }
      }
      function rock(x, gy) {
        var rw = 10 + ((rand() * 10) | 0), rh = 6 + ((rand() * 6) | 0);
        g.fillStyle = "#3c5039"; g.fillRect(x, gy - rh, rw, rh);
        g.fillStyle = "#587656"; g.fillRect(x, gy - rh, rw, 3);
        g.fillStyle = "#26331f"; g.fillRect(x, gy - 2, rw, 2);
      }
      function grassTuft(x, gy, c1, c2) {
        var bh = 5 + ((rand() * 7) | 0);
        g.fillStyle = c1; g.fillRect(x, gy - bh, 2, bh);
        g.fillStyle = c2; g.fillRect(x + 4, gy - bh * 0.7, 2, Math.round(bh * 0.7));
        g.fillRect(x - 4, gy - bh * 0.5, 2, Math.round(bh * 0.5));
      }
      function flower(x, gy) {
        g.fillStyle = rand() < 0.5 ? "#dcffb8" : "#eaff9a";
        g.fillRect(x, gy - 5, 3, 3);
        g.fillStyle = "#3A962E"; g.fillRect(x + 1, gy - 2, 1, 2);
      }
      function groundDetail(ys, chance) {
        for (var c = 1; c < ys.length - 1; c++) {
          var x = c * U, gy = ys[c];
          if (inCenter(x)) continue;
          var r = rand();
          if (r < chance * 0.35) rock(x + 4, gy);
          else if (r < chance) grassTuft(x + 4, gy, "#3A962E", "#62C848");
          if (rand() < chance * 0.14) flower(x + 14 + rand() * 8, gy);
        }
      }

      glowSpots = [];
      var far = terrain(h * 0.74, 30, 0.6, "#184a22", "#256029", "#1c4a24", 0.04);
      trees(far, 12, 0.22, "#143a1c", "#1a5229", "#256637");
      var mid = terrain(h * 0.82, 34, 2.1, "#216933", "#46b037", "#348741", 0.06);
      trees(mid, 18, 0.2, "#153d1d", "#256633", "#46b037");
      groundDetail(mid, 0.16);
      var near = terrain(h * 0.91, 26, 4.2, "#2f883f", "#72d958", "#46b037", 0.08);
      groundDetail(near, 0.32);
      /* 3 sheep on the ridges, kept to the sides so text stays readable.
         Each has its own size / speed / rhythm so they never move like puppets. */
      nearYs = near; midYs = mid;
      sheep = [
        { x: w * 0.16, dir: 1, state: "graze", tNext: 2500, s: 5, speed: 0.022, minF: 0.05, maxF: 0.30, ph: rand() * 6.28, stepF: 1 / 165, layer: "near", dark: false, grazeL: 0, step: 0 },
        { x: w * 0.84, dir: -1, state: "walk", tNext: 1800, s: 5, speed: 0.028, minF: 0.70, maxF: 0.95, ph: rand() * 6.28, stepF: 1 / 145, layer: "near", dark: false, grazeL: 0, step: 0 },
        { x: w * 0.22, dir: 1, state: "idle", tNext: 1200, s: 3, speed: 0.015, minF: 0.08, maxF: 0.32, ph: rand() * 6.28, stepF: 1 / 195, layer: "mid", dark: true, grazeL: 0, step: 0 }
      ];
      sheepLast = 0;

      stars = [];
      for (var i = 0; i < Math.round(w / 10); i++) {
        stars.push({ x: Math.floor(rand() * w / 8) * 8, y: Math.floor(rand() * h * 0.42 / 8) * 8, a: 0.18 + rand() * 0.4, sp: 0.0008 + rand() * 0.0018, ph: rand() * 6.28, big: rand() < 0.08 });
      }
      moon = { x: Math.round(w * 0.86 / 8) * 8, y: Math.round(h * 0.15 / 8) * 8 };
      /* endless conveyor: 7 clouds, one speed, slots 1/7 apart in an endless
         loop — the moment one slides out left, the next slides in right,
         so the sky is never empty and never bunched */
      (function () {
        var lanes = [0.09, 0.16, 0.23, 0.30, 0.13, 0.20, 0.27];
        var sizes = [12, 16, 10, 18, 13, 15, 11];
        clouds = [];
        for (var ci = 0; ci < 7; ci++) {
          clouds.push({
            slot: ci / 7,
            y: Math.round(h * lanes[ci] / 8) * 8,
            q: sizes[ci],
            v: 0.008
          });
        }
      })();
      flies = [];
      for (var f = 0; f < 20; f++) {
        var fx = rand() * w, fy = h * 0.56 + rand() * h * 0.34;
        if (inCenter(fx) && fy < h * 0.76) continue;
        flies.push({ x: fx, y: fy, ax: 14 + rand() * 26, ay: 8 + rand() * 16, sx: 0.0004 + rand() * 0.0006, sy: 0.0005 + rand() * 0.0007, blink: 0.0014 + rand() * 0.0018, ph: rand() * 6.28 });
      }
    }

    function cloud(x, y, q) {
      ctx.fillStyle = "rgba(210, 255, 205, 0.30)";
      ctx.fillRect(x + 3 * q, y, 6 * q, 2 * q);
      ctx.fillRect(x, y + 2 * q, 13 * q, 2 * q);
      ctx.fillRect(x + q, y + 4 * q, 10 * q, 2 * q);
      ctx.fillStyle = "rgba(235, 255, 225, 0.38)";
      ctx.fillRect(x + 3 * q, y, 6 * q, q * 0.6);
      ctx.fillRect(x, y + 2 * q, 13 * q, q * 0.5);
    }

    function frame(t) {
      ctx.drawImage(skyC, 0, 0);
      var pulse = 0.78 + 0.22 * Math.sin(t / 1500), k;
      for (k = 3; k >= 1; k--) {
        ctx.fillStyle = "rgba(190, 255, 170, " + (0.05 * (4 - k) * pulse).toFixed(3) + ")";
        ctx.fillRect(moon.x - k * 16, moon.y - k * 16, 48 + k * 32, 48 + k * 32);
      }
      ctx.fillStyle = "#dcffb8";
      ctx.fillRect(moon.x, moon.y, 48, 48);
      ctx.fillStyle = "rgba(58, 150, 46, 0.45)";
      ctx.fillRect(moon.x + 8, moon.y + 8, 8, 8);
      ctx.fillRect(moon.x + 24, moon.y + 24, 16, 8);
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        var a = st.a * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * st.sp + st.ph)));
        ctx.fillStyle = "rgba(215, 255, 225, " + a.toFixed(3) + ")";
        ctx.fillRect(st.x, st.y, st.big ? 4 : 2, st.big ? 4 : 2);
      }
      for (var c = 0; c < clouds.length; c++) {
        var cl = clouds[c], cw = 13 * cl.q, period = w + cw * 2;
        /* slot position loops forever: (slot + time) % 1 — even gaps, no collapse */
        var prog = ((cl.slot + t * cl.v / period) % 1 + 1) % 1;
        cloud(prog * period - cw, cl.y, cl.q);
      }
      ctx.drawImage(terC, 0, 0);

      /* sheep: graze, then lift head and step — per-sheep rhythm, no puppet sync */
      if (nearYs && sheep.length) {
        var dtS = sheepLast ? Math.min(t - sheepLast, 50) : 16;
        sheepLast = t;
        for (var si = 0; si < sheep.length; si++) {
          var sh = sheep[si];
          if (!sh.stepF) sh.stepF = 1 / (150 + si * 25);
          if (!sh.step) sh.step = 0;
          if (t > sh.tNext) {
            if (sh.state === "graze") { sh.state = "walk"; sh.tNext = t + 2800 + Math.random() * 3800 + si * 700; }
            else if (sh.state === "walk") { sh.state = "idle"; sh.tNext = t + 800 + Math.random() * 1600 + si * 400; }
            else { sh.state = "graze"; sh.tNext = t + 2400 + Math.random() * 3400 + si * 600; }
          }
          var zMin = w * sh.minF, zMax = w * sh.maxF;
          if (sh.state === "walk") {
            sh.x += sh.dir * sh.speed * dtS;
            sh.step += dtS * sh.stepF * 3.45;
            if (sh.x < zMin) { sh.x = zMin; sh.dir = 1; }
            if (sh.x > zMax) { sh.x = zMax; sh.dir = -1; }
          }
          var ridge = (sh.layer === "mid" && midYs) ? midYs : nearYs;
          var sIdx = clamp(Math.floor(sh.x / U), 0, ridge.length - 1);
          var sGy = ridge[sIdx];
          drawSheep(ctx, sh.x, sGy, sh.s, sh.dir, t + sh.ph * 1000, sh.state === "graze", sh.state === "walk" ? sh.step : 0, sh.dark);
        }
      }

      for (var j = 0; j < flies.length; j++) {
        var fl = flies[j];
        var fx = fl.x + Math.sin(t * fl.sx + fl.ph) * fl.ax;
        var fy = fl.y + Math.cos(t * fl.sy + fl.ph) * fl.ay;
        var b = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * fl.blink + fl.ph));
        ctx.fillStyle = "rgba(98, 200, 72, " + (0.16 * b).toFixed(3) + ")";
        ctx.fillRect(fx - 4, fy - 4, 12, 12);
        ctx.fillStyle = "rgba(190, 255, 110, " + (0.95 * b).toFixed(3) + ")";
        ctx.fillRect(fx, fy, 4, 4);
      }
      if (!shoot && t > nextShoot) shoot = { t0: t, x: w * (0.08 + Math.random() * 0.5), y: h * (0.05 + Math.random() * 0.14) };
      if (shoot) {
        var p = (t - shoot.t0) / 1000;
        if (p >= 1) { shoot = null; nextShoot = t + 9000 + Math.random() * 6000; }
        else {
          for (var n = 0; n < 7; n++) {
            var px = shoot.x + p * 280 - n * 14, py = shoot.y + p * 140 - n * 7;
            ctx.fillStyle = "rgba(230, 255, 235, " + ((1 - p) * (1 - n / 7) * 0.85).toFixed(3) + ")";
            ctx.fillRect(px, py, 4, 4);
          }
        }
      }
    }

    function loop(t) { frame(t); requestAnimationFrame(loop); }
    build();
    if (reduce) frame(0);
    else if ("IntersectionObserver" in window) {
      /* Pause the hero scene off-screen like the dimension scenes below. */
      var heroVisible = true;
      new IntersectionObserver(function (entries) { heroVisible = entries[0].isIntersecting; }, { threshold: 0.01 }).observe(cv);
      (function heroLoop(t) {
        requestAnimationFrame(heroLoop);
        if (heroVisible) frame(t);
      })(0);
    } else requestAnimationFrame(loop);
    var timer;
    window.addEventListener("resize", function () {
      clearTimeout(timer);
      timer = setTimeout(function () { build(); if (reduce) frame(0); }, 150);
    });
  })();

  /* ============================================================
     DIMENSION BACKGROUNDS
     Shared helpers. Every scene is built from real-looking block
     textures (32px block = 8x8 texels of 4px), cached in an
     off-screen canvas, with only the lights / particles / mobs
     animated on top (30fps, paused when off-screen).
     ============================================================ */
  var B = 32, T = 4;

  function seeded(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function snap(v, n) { return Math.round(v / n) * n; }
  function smooth(a, b, x) { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
  function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
  function mixHex(a, b, t) {
    var x = hex(a), y = hex(b);
    return "rgb(" + Math.round(x[0] + (y[0] - x[0]) * t) + "," + Math.round(x[1] + (y[1] - x[1]) * t) + "," + Math.round(x[2] + (y[2] - x[2]) * t) + ")";
  }
  function tint(pal, to, t) { return pal.map(function (c) { return mixHex(c, to, t); }); }

  /* fill a rectangle with a solid base colour plus very sparse dark flecks —
     kept deliberately subtle so blocks read as flat dark surfaces instead of
     bright noisy static. `bias` nudges the fleck density further down. */
  function tex(g, x, y, w, h, pal, rand, bias) {
    var n = pal.length;
    g.fillStyle = pal[0];
    g.fillRect(x, y, w, h);
    if (n < 2) return;
    var density = clamp(0.11 - (bias || 0) * 0.09, 0.02, 0.11);
    for (var yy = y; yy < y + h; yy += 8) {
      for (var xx = x; xx < x + w; xx += 8) {
        if (rand() < density) {
          var pick = pal[1 + ((rand() * (n - 1)) | 0)];
          g.fillStyle = mixHex(pick, pal[0], 0.65);
          g.fillRect(xx, yy, Math.min(8, x + w - xx), Math.min(8, y + h - yy));
        }
      }
    }
  }

  function makeScene(id, buildFn, frameFn) {
    var cv = document.getElementById(id);
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var S = { w: 0, h: 0, staticC: null, dyn: {}, visible: true, last: 0, raf: 0 };

    function build() {
      var box = cv.parentNode;
      var w = Math.max(box.clientWidth, 2), h = Math.max(box.clientHeight, 2);
      if (w === S.w && h === S.h && S.staticC) return false;
      S.w = w; S.h = h; cv.width = w; cv.height = h;
      var c = document.createElement("canvas");
      c.width = w; c.height = h;
      S.staticC = c;
      S.dyn = buildFn(c.getContext("2d"), w, h, seeded(id.length * 977 + 13)) || {};
      return true;
    }
    function frame(t) {
      ctx.clearRect(0, 0, S.w, S.h);
      ctx.drawImage(S.staticC, 0, 0);
      frameFn(ctx, S, t);
    }
    function loop(t) {
      S.raf = requestAnimationFrame(loop);
      if (!S.visible || t - S.last < 33) return;
      S.last = t;
      frame(t);
    }

    build();
    if (reduceMotion) { frame(0); }
    else {
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          S.visible = entries[0].isIntersecting;
        }, { threshold: 0.01 }).observe(cv);
      }
      S.raf = requestAnimationFrame(loop);
    }

    // Rebuild whenever the section changes size (images loading, window resize)
    var timer;
    function onResize() {
      clearTimeout(timer);
      timer = setTimeout(function () { if (build() && reduceMotion) frame(0); }, 150);
    }
    if ("ResizeObserver" in window) new ResizeObserver(onResize).observe(cv.parentNode);
    else window.addEventListener("resize", onResize);
  }

  /* ============================================================
     CAVE  (What's new)
     Stone fading into deepslate, real ore veins, dripstone,
     torches lighting the walls, a mineshaft with rails and a
     minecart rolling by.
     ============================================================ */
  makeScene("caveBg",
    function (g, w, h, rand) {
      var cols = Math.ceil(w / B) + 1, rows = Math.ceil(h / B) + 1, c, r, x, y, k;
      var stone = ["#4d8349", "#5a9555", "#3f6b39", "#67ab68", "#477d4b"];
      var deep = ["#2a4c2d", "#346035", "#21402a", "#3a7041", "#294f27"];
      var rockCeil = ["#2b5335", "#34603b", "#23442a", "#418047"];
      var rockFloor = ["#2f5c33", "#3a7041", "#285429", "#4b944d"];
      var drip = ["#5e8256", "#527444", "#6e9662", "#4c6e40"];
      var wood = ["#3c5a1e", "#4c6e28", "#2f4c18", "#5a7e2c"];

      /* wall: stone above, deepslate below, mixed in a transition band like world-gen */
      for (r = 0; r < rows; r++) {
        for (c = 0; c < cols; c++) {
          var depth = smooth(0.4, 0.78, (r * B) / h);
          tex(g, c * B, r * B, B, B, rand() < depth ? deep : stone, rand, 0.42);
        }
      }

      /* ceiling */
      var ceil = [], v = 3, floorTop = [];
      for (c = 0; c < cols; c++) {
        v = clamp(v + (rand() < 0.5 ? -1 : (rand() < 0.5 ? 1 : 0)), 2, 4);
        ceil.push(v);
        tex(g, c * B, 0, B, v * B, rockCeil, rand, 0.45);
        g.fillStyle = "rgba(0,0,0,0.38)"; g.fillRect(c * B, v * B - T * 2, B, T * 2);
      }

      /* floor: flat corridor in the middle (rails), rising rubble at the edges */
      var railL = 0, railR = snap(w, B);
      var fy = h - 3 * B;
      for (c = 0; c < cols; c++) {
        x = c * B;
        var inRail = x >= railL && x < railR;
        var fh = inRail ? 3 : 3 + ((rand() * 3) | 0);
        floorTop.push(h - fh * B);
        tex(g, x, h - fh * B, B, fh * B, rockFloor, rand, 0.45);
        g.fillStyle = "rgba(255,255,255,0.07)"; g.fillRect(x, h - fh * B, B, T);
      }

      /* dripstone: stalactites from the ceiling, stalagmites from the floor */
      var drops = [];
      for (c = 0; c < cols; c++) {
        x = c * B; var cx = x + B / 2, len;
        if (rand() < 0.5) {
          len = 2 + ((rand() * 4) | 0);
          for (k = 0; k < len; k++) {
            var wk = Math.max(T, 24 - k * 4);
            tex(g, cx - wk / 2, ceil[c] * B + k * 8, wk, 8, drip, rand, 0.5);
          }
          if (rand() < 0.6) drops.push({ x: cx, y0: ceil[c] * B + len * 8, col: c });
        }
        if (!(x >= railL && x < railR) && rand() < 0.5) {
          len = 2 + ((rand() * 3) | 0);
          for (k = 0; k < len; k++) {
            var wm = Math.max(T, 24 - k * 4);
            tex(g, cx - wm / 2, floorTop[c] - (k + 1) * 8, wm, 8, drip, rand, 0.5);
          }
        }
      }

      /* mineshaft: sleepers + rail, wooden supports */
      for (x = railL; x < railR; x += B) {
        g.fillStyle = "#3c5420"; g.fillRect(x + 4, fy - T, 24, T);
        g.fillStyle = "#5c8a2c"; g.fillRect(x + 4, fy - T, 24, 2);
      }
      g.fillStyle = "#7fbf6e"; g.fillRect(railL, fy - T * 2, railR - railL, T);
      g.fillStyle = "#4c7a48"; g.fillRect(railL, fy - T, railR - railL, 2);
      var supports = [0.2, 0.5, 0.8];
      for (k = 0; k < supports.length; k++) {
        var sx = snap(w * supports[k], B);
        tex(g, sx, fy - 3 * B, 8, 3 * B - T * 2, wood, rand, 0.4);
        tex(g, sx + 2 * B, fy - 3 * B, 8, 3 * B - T * 2, wood, rand, 0.4);
        tex(g, sx - 8, fy - 3 * B - 12, 2 * B + 24, 12, wood, rand, 0.4);
        g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(sx - 8, fy - 3 * B, 2 * B + 24, 4);
      }

      /* ores — deeper ores only appear low in the cave, like the real game */
      var ORES = [
        { c: ["#1e2e1c", "#3d5a38"], min: 0, wt: 5 },
        { c: ["#8fbf6a", "#c3eea0"], min: 0, wt: 4 },
        { c: ["#7fa04a", "#5fcf8e"], min: 0.1, wt: 3 },
        { c: ["#d3e04a", "#eaff9a"], min: 0.3, wt: 2 },
        { c: ["#2fae4a", "#7dffa0"], min: 0.35, wt: 3, glow: "90,255,120" },
        { c: ["#1f8a52", "#5fd98e"], min: 0.3, wt: 2 },
        { c: ["#2eea7a", "#bfffd0"], min: 0.55, wt: 3, glow: "90,255,150" },
        { c: ["#1ed660", "#8bffb3"], min: 0.45, wt: 1, glow: "60,255,140" }
      ];
      var glints = [], oreCount = Math.round((w * h) / 17000), placed = 0, tries = 0;
      while (placed < oreCount && tries < oreCount * 12) {
        tries++;
        c = (rand() * cols) | 0; r = 4 + ((rand() * Math.max(rows - 9, 1)) | 0);
        x = c * B; y = r * B;
        var dx = Math.abs(x / w - 0.5);
        if (rand() > 0.3 + smooth(0.12, 0.38, dx) * 0.7) continue;
        var dp = y / h, pool = [];
        for (k = 0; k < ORES.length; k++) if (dp >= ORES[k].min) for (var q = 0; q < ORES[k].wt; q++) pool.push(ORES[k]);
        var o = pool[(rand() * pool.length) | 0];
        tex(g, x, y, B, B, dp > 0.5 ? deep : stone, rand, 0.42);
        /* ore = 7 chunky 8px clumps on a 4x4 grid, like the real ore texture */
        var cells = [], fx = 0, fyy = 0;
        for (k = 0; k < 16; k++) cells.push(k);
        for (k = 15; k > 0; k--) { var sw = (rand() * (k + 1)) | 0, tmp = cells[k]; cells[k] = cells[sw]; cells[sw] = tmp; }
        for (k = 0; k < 7; k++) {
          var bx = x + (cells[k] % 4) * 8, by = y + ((cells[k] / 4) | 0) * 8;
          g.fillStyle = o.c[0]; g.fillRect(bx, by, 8, 8);
          g.fillStyle = o.c[1]; g.fillRect(bx, by, 4, 4);
          g.fillStyle = "rgba(0,0,0,0.22)"; g.fillRect(bx + 4, by + 6, 4, 2);
          fx = bx; fyy = by;
        }
        if (o.glow) glints.push({ x: x + B / 2, y: y + B / 2, sx: fx, sy: fyy, glow: o.glow, ph: rand() * 6.28, sp: 0.0007 + rand() * 0.001 });
        placed++;
      }

      /* torches (stick is static, flame + light are animated) */
      var torches = [
        { x: snap(w * 0.07, B) + 14, y: snap(h * 0.30, B) },
        { x: snap(w * 0.94, B) + 14, y: snap(h * 0.52, B) },
        { x: snap(w * 0.36, B) + 14, y: snap(h * 0.70, B) },
        { x: snap(w * 0.72, B) + 14, y: snap(h * 0.25, B) }
      ];
      torches.forEach(function (tc) {
        g.fillStyle = "#8a5a2b"; g.fillRect(tc.x - 2, tc.y + 4, 4, 16);
        g.fillStyle = "#5e3b1a"; g.fillRect(tc.x - 2, tc.y + 12, 4, 8);
      });

      /* light falloff: darker at the top and bottom, deep sides */
      var lg = g.createLinearGradient(0, 0, 0, h);
      lg.addColorStop(0, "rgba(0,0,0,0.30)"); lg.addColorStop(0.3, "rgba(0,0,0,0.03)");
      lg.addColorStop(0.75, "rgba(0,0,0,0.06)"); lg.addColorStop(1, "rgba(0,0,0,0.30)");
      g.fillStyle = lg; g.fillRect(0, 0, w, h);
      var sg = g.createLinearGradient(0, 0, w, 0);
      sg.addColorStop(0, "rgba(0,0,0,0.28)"); sg.addColorStop(0.14, "rgba(0,0,0,0)");
      sg.addColorStop(0.86, "rgba(0,0,0,0)"); sg.addColorStop(1, "rgba(0,0,0,0.28)");
      g.fillStyle = sg; g.fillRect(0, 0, w, h);

      /* animated state */
      drops.forEach(function (d) { d.yEnd = floorTop[d.col] || (h - 3 * B); d.t0 = rand() * 5000; });
      var motes = [];
      torches.forEach(function (tc, i) {
        for (var m = 0; m < 6; m++) motes.push({ tc: tc, r: 30 + rand() * 90, ph: rand() * 6.28, sp: 0.0003 + rand() * 0.0005, ry: 0.5 + rand() * 0.6 });
      });
      /* 2 cave mobs with Minecraft habits: zombie shuffles-hunches, skeleton strides upright.
         Each has walk/idle states, own speed and stride so they never sync. */
      var mobs = [
        { type: "zombie", x: w * 0.10, dir: 1, state: "walk", tNext: 4000 + rand() * 3000, speed: 0.020, minF: 0.05, maxF: 0.24, step: rand() * 6.28, stepF: 1 / 168, walkAmt: 1, last: 0 },
        { type: "skeleton", x: w * 0.88, dir: -1, state: "idle", tNext: 1500 + rand() * 2000, speed: 0.026, minF: 0.76, maxF: 0.95, step: rand() * 6.28, stepF: 1 / 196, walkAmt: 0, last: 0 }
      ];
      return { torches: torches, glints: glints, drops: drops, motes: motes, fy: fy, railL: railL, railR: railR, mobs: mobs };
    },
    function (ctx, S, t) {
      var d = S.dyn, i;

      /* lights add up — green torchlight to match the cave theme */
      ctx.globalCompositeOperation = "lighter";
      for (i = 0; i < d.torches.length; i++) {
        var tc = d.torches[i];
        var fl = 0.78 + 0.22 * Math.sin(t / 120 + i * 2.1) * Math.sin(t / 53 + i);
        var r = 200 * (0.94 + 0.06 * fl);
        var gr = ctx.createRadialGradient(tc.x, tc.y, 4, tc.x, tc.y, r);
        gr.addColorStop(0, "rgba(120,255,140," + (0.55 * fl).toFixed(3) + ")");
        gr.addColorStop(0.45, "rgba(60,220,100," + (0.18 * fl).toFixed(3) + ")");
        gr.addColorStop(1, "rgba(40,180,70,0)");
        ctx.fillStyle = gr; ctx.fillRect(tc.x - r, tc.y - r, r * 2, r * 2);
      }
      for (i = 0; i < d.glints.length; i++) {
        var gl = d.glints[i], a = 0.5 + 0.5 * Math.sin(t * gl.sp + gl.ph);
        var hg = ctx.createRadialGradient(gl.x, gl.y, 2, gl.x, gl.y, 46);
        hg.addColorStop(0, "rgba(" + gl.glow + "," + (0.16 + 0.14 * a).toFixed(3) + ")");
        hg.addColorStop(1, "rgba(" + gl.glow + ",0)");
        ctx.fillStyle = hg; ctx.fillRect(gl.x - 46, gl.y - 46, 92, 92);
      }
      ctx.globalCompositeOperation = "source-over";

      /* flames — green so torches match the cave, no red/orange */
      for (i = 0; i < d.torches.length; i++) {
        var f = d.torches[i], fk = Math.sin(t / 90 + i * 1.7) > 0 ? 0 : 4;
        ctx.fillStyle = "#1fae4e"; ctx.fillRect(f.x - 4, f.y - 4 + fk / 2, 8, 8 - fk / 2);
        ctx.fillStyle = "#7dff9e"; ctx.fillRect(f.x - 2, f.y - 2 + fk / 2, 4, 6 - fk / 2);
        ctx.fillStyle = "#eafff0"; ctx.fillRect(f.x - 2, f.y + 2, 4, 2);
      }

      /* diamond / emerald / redstone sparkle */
      for (i = 0; i < d.glints.length; i++) {
        var s = d.glints[i], sp = Math.sin(t * s.sp * 1.7 + s.ph);
        if (sp > 0.93) {
          ctx.fillStyle = "rgba(255,255,255,0.95)";
          ctx.fillRect(s.sx - 4, s.sy + 2, 12, 4); ctx.fillRect(s.sx + 2, s.sy - 4, 4, 12);
        }
      }

      /* dust drifting in torch light */
      for (i = 0; i < d.motes.length; i++) {
        var m = d.motes[i];
        var mx = m.tc.x + Math.cos(t * m.sp + m.ph) * m.r;
        var my = m.tc.y + Math.sin(t * m.sp * 1.3 + m.ph) * m.r * m.ry;
        var b = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.002 + m.ph));
        ctx.fillStyle = "rgba(150,255,170," + (0.75 * b).toFixed(3) + ")";
        ctx.fillRect(snap(mx, 2), snap(my, 2), 4, 4);
      }

      /* water dripping off the stalactites */
      for (i = 0; i < d.drops.length; i++) {
        var dr = d.drops[i], el = t - dr.t0;
        if (el < 0) continue;
        var fall = el * 0.3, y = dr.y0 + fall, total = dr.yEnd - dr.y0;
        if (y < dr.yEnd) {
          ctx.fillStyle = "rgba(170,225,255,0.9)"; ctx.fillRect(dr.x - 2, y, 4, 8);
        } else if (fall - total < 220) {
          var sp2 = (fall - total) / 220;
          ctx.fillStyle = "rgba(170,225,255," + (0.8 * (1 - sp2)).toFixed(3) + ")";
          ctx.fillRect(dr.x - 4 - sp2 * 10, dr.yEnd - 4, 4, 4); ctx.fillRect(dr.x + sp2 * 10, dr.yEnd - 4, 4, 4);
        } else dr.t0 = t + 900 + Math.random() * 4500;
      }

      /* cave mobs: stride only advances with distance walked (no moonwalking),
         they pause, look around and turn like real mobs */
      if (d.mobs) {
        var gyM = d.fy - 4;
        for (var mi = 0; mi < d.mobs.length; mi++) {
          var mb = d.mobs[mi], www = S.w;
          var dtM = mb.last ? Math.min(t - mb.last, 50) : 16;
          mb.last = t;
          if (t > mb.tNext) {
            if (mb.state === "walk") { mb.state = "idle"; mb.tNext = t + 1400 + Math.random() * 2600 + mi * 800; }
            else { mb.state = "walk"; mb.tNext = t + 3500 + Math.random() * 4500 + mi * 900; if (Math.random() < 0.35) mb.dir = -mb.dir; }
          }
          var mMin = www * mb.minF, mMax = www * mb.maxF;
          var target = mb.state === "walk" ? 1 : 0;
          mb.walkAmt += (target - mb.walkAmt) * Math.min(1, dtM / 220);
          if (mb.state === "walk") {
            var nx = mb.x + mb.dir * mb.speed * dtM;
            if (nx < mMin) { nx = mMin; mb.dir = 1; }
            if (nx > mMax) { nx = mMax; mb.dir = -1; }
            var moved = (nx - mb.x) * mb.dir;
            mb.step += Math.max(0, moved) * 0.30;
            mb.x = nx;
          }
          if (mb.type === "zombie") drawZombie(ctx, mb.x, gyM, t + mi * 1300, mb.dir, mb.step, mb.walkAmt);
          else drawSkeleton(ctx, mb.x, gyM, t + mi * 2100, mb.dir, mb.step, mb.walkAmt);
        }
      }

      /* minecart rolling along the rail */
      var span = d.railR - d.railL + 160;
      var cx = d.railL - 80 + ((t * 0.05) % span);
      var cy = d.fy - T * 2 - 20;
      ctx.fillStyle = "#254c26"; ctx.fillRect(cx, cy, 44, 20);
      ctx.fillStyle = "#5a9a52"; ctx.fillRect(cx + 2, cy + 2, 40, 16);
      ctx.fillStyle = "#173219"; ctx.fillRect(cx + 4, cy + 4, 36, 4);
      /* chest riding in the cart */
      ctx.fillStyle = "#3c5420"; ctx.fillRect(cx + 6, cy - 14, 32, 16);
      ctx.fillStyle = "#5c8a2c"; ctx.fillRect(cx + 8, cy - 12, 28, 12);
      ctx.fillStyle = "#243c10"; ctx.fillRect(cx + 6, cy - 6, 32, 2);
      ctx.fillStyle = "#d9e85a"; ctx.fillRect(cx + 6, cy - 14, 32, 2); ctx.fillRect(cx + 19, cy - 14, 6, 16);
      ctx.fillStyle = "#9ab82e"; ctx.fillRect(cx + 20, cy - 8, 4, 5);
      ctx.fillStyle = "#122a14"; ctx.fillRect(cx + 4, cy + 20, 10, 8); ctx.fillRect(cx + 30, cy + 20, 10, 8);
    }
  );

  /* ============================================================
     MOB SPRITES (pixel style, side view)
     Sheep grazes with head down, then lifts head and walks.
     Zombie / skeleton patrol with swinging legs / arms.
     All coords snapped to 2-4px so they stay crisp.
     ============================================================ */
  function drawSheep(ctx, x, feetY, s, dir, t, grazing, step, dark) {
    x = Math.round(x); feetY = Math.round(feetY);
    /* lit pasture palette — brighter than before but still green-tinted, no paper white */
    var wool = dark ? "#5a6e57" : "#7a8f74", woolHi = dark ? "#6e8470" : "#93a88d", woolSh = dark ? "#39473a" : "#4c5f49";
    var skin = dark ? "#8b987d" : "#a8b39b", skinSh = dark ? "#5d6852" : "#75816a", legC = "#3d4a3a", legSh = "#2c352b";
    var fx = dir >= 0 ? 1 : -1;
    /* Minecraft walk: legs pivot under the hips, feet LIFT alternately (never slide sideways out) */
    var liftA = step > 0 ? Math.max(0, Math.sin(step)) * s * 0.7 : 0;
    var liftB = step > 0 ? Math.max(0, -Math.sin(step)) * s * 0.7 : 0;
    var hipY = feetY - 2 * s;
    /* back legs (darker, slightly behind) */
    ctx.fillStyle = legSh;
    ctx.fillRect(Math.round(x - 3.4 * s), hipY, Math.max(2, Math.round(s * 0.8)), Math.round(2 * s - liftA));
    ctx.fillRect(Math.round(x + 1.6 * s), hipY, Math.max(2, Math.round(s * 0.8)), Math.round(2 * s - liftB));
    /* front legs */
    ctx.fillStyle = legC;
    ctx.fillRect(Math.round(x - 2.4 * s + (step ? Math.sin(step) * 1 : 0)), hipY, Math.max(2, Math.round(s * 0.8)), Math.round(2 * s - liftB));
    ctx.fillRect(Math.round(x + 2.6 * s + (step ? -Math.sin(step) * 1 : 0)), hipY, Math.max(2, Math.round(s * 0.8)), Math.round(2 * s - liftA));
    /* body bob while walking */
    var bobY = step ? Math.round(-Math.abs(Math.cos(step)) * 1.5) : 0;
    var by = feetY - 7 * s + bobY;
    /* woolly body */
    ctx.fillStyle = wool;
    ctx.fillRect(x - 5 * s, by, 10 * s, 5 * s);
    ctx.fillStyle = woolHi;
    ctx.fillRect(x - 5 * s, by, 10 * s, s);
    ctx.fillRect(x - 5 * s, by - s, 2 * s, s);
    ctx.fillRect(x - 1 * s, by - s, 2 * s, s);
    ctx.fillRect(x + 3 * s, by - s, 2 * s, s);
    ctx.fillStyle = woolSh;
    ctx.fillRect(x - 5 * s, by + 4 * s, 10 * s, s);
    if (grazing) {
      var bob = Math.round(Math.sin(t / 230) * s * 0.25);
      var hx = Math.round(x + fx * 5 * s - s), hy = feetY - 3 * s + bob;
      /* neck angled down to the grass (stays attached to body front) */
      ctx.fillStyle = wool;
      ctx.fillRect(Math.round(x + fx * 4 * s - s), by + 2 * s, 2 * s, 3 * s);
      /* head buried in grass */
      ctx.fillStyle = skin;
      ctx.fillRect(hx, hy, 2 * s, 2 * s);
      ctx.fillStyle = skinSh;
      ctx.fillRect(hx, hy + s, 2 * s, s);
      /* munch particles */
      if (Math.sin(t / 310) > 0.35) {
        ctx.fillStyle = "#3A962E";
        ctx.fillRect(hx - 2, hy + 2 * s, 3, 3);
        ctx.fillRect(hx + 2 * s, hy + 2 * s - 2, 3, 3);
      }
    } else {
      var hy2 = by - 2 * s + Math.round(Math.sin(t / 520) * 1.2);
      var hx2 = Math.round(x + fx * 5 * s - s);
      /* neck stub keeps head attached — no floating head */
      ctx.fillStyle = wool;
      ctx.fillRect(Math.round(x + fx * 4 * s - s * 0.5), by, 2 * s, 2 * s);
      ctx.fillStyle = skin;
      ctx.fillRect(hx2, hy2, 2 * s, 3 * s);
      ctx.fillStyle = skinSh;
      ctx.fillRect(hx2, hy2 + 2 * s, 2 * s, s);
      /* eye on the facing side */
      ctx.fillStyle = "#101510";
      ctx.fillRect(hx2 + (fx > 0 ? s : 0), hy2 + s, 2, 2);
    }
  }

  /* Real Minecraft stride: each foot traces an ellipse — swings forward/back
     (x) while lifting mid-swing (y). One foot planted while the other passes.
     walkAmt 1 = full stride, 0 = feet together at rest. */
  function drawZombie(ctx, x, feetY, t, dir, step, walkAmt) {
    x = snap(x, 2); feetY = Math.round(feetY);
    walkAmt = (walkAmt === undefined) ? 1 : walkAmt;
    var skin = "#3d6b3a", skinSh = "#2a4a28", shirt = "#234434", shirtSh = "#182e24", pants = "#1c2b22", pantsSh = "#141f18";
    var sL = Math.sin(step) * walkAmt, sR = Math.sin(step + Math.PI) * walkAmt;
    var liftL = Math.max(0, Math.cos(step)) * 3 * walkAmt;
    var liftR = Math.max(0, -Math.cos(step)) * 3 * walkAmt;
    var xL = Math.round(x - 5 + sL * 3.5), xR = Math.round(x + 1 + sR * 3.5);
    var bob = walkAmt * (1.2 - Math.abs(Math.cos(step)) * 1.2);
    var lean = dir * walkAmt * 1.5;
    var y = feetY - Math.round(bob);
    var hx = Math.round(x + lean);
    ctx.fillStyle = "rgba(0,0,0,0.30)";
    ctx.fillRect(Math.round(x - 6), feetY - 1, 13, 2);
    ctx.fillStyle = pantsSh;
    ctx.fillRect(xL, y - 20, 4, Math.round(20 - liftL));
    ctx.fillRect(xR, y - 20, 4, Math.round(20 - liftR));
    ctx.fillStyle = pants;
    ctx.fillRect(xL, y - 20, 3, Math.round(20 - liftL));
    ctx.fillRect(xR, y - 20, 3, Math.round(20 - liftR));
    ctx.fillStyle = "#101a12";
    ctx.fillRect(xL - (dir >= 0 ? 0 : 1), y - 3 - Math.round(liftL), 5, 3);
    ctx.fillRect(xR - (dir >= 0 ? 0 : 1), y - 3 - Math.round(liftR), 5, 3);
    ctx.fillStyle = shirt;
    ctx.fillRect(hx - 6, y - 38, 12, 18);
    ctx.fillStyle = shirtSh;
    ctx.fillRect(hx - 6, y - 24, 12, 4);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(hx - 6, y - 38, 3, 18);
    ctx.fillStyle = skin;
    var armBob = Math.sin(t / 310) * 1.2 * (0.3 + walkAmt * 0.7) + Math.sin(step - 0.9) * 1.4 * walkAmt;
    var ax = hx + (dir >= 0 ? 2 : -14);
    ctx.fillRect(ax, Math.round(y - 36 + armBob), 12, 4);
    ctx.fillRect(ax + (dir >= 0 ? 9 : 0), Math.round(y - 34 + armBob), 3, 4);
    var headWob = Math.sin(step - 0.6) * 1.2 * walkAmt + Math.sin(t / 470) * 0.6;
    ctx.fillStyle = skin;
    ctx.fillRect(Math.round(hx - 6 + lean * 0.6), Math.round(y - 50 + headWob * 0.5), 12, 12);
    ctx.fillStyle = skinSh;
    ctx.fillRect(Math.round(hx - 6 + lean * 0.6), Math.round(y - 42 + headWob * 0.5), 12, 4);
    ctx.fillStyle = "#0e1a0e";
    var ex = Math.round(hx + lean * 0.6) + (dir >= 0 ? 0 : -2);
    var ey = Math.round(y - 46 + headWob * 0.5);
    ctx.fillRect(ex, ey, 3, 3);
    ctx.fillRect(ex + 4, ey + (walkAmt > 0.5 && Math.sin(step * 2) > 0.6 ? 1 : 0), 3, 3);
  }

  function drawSkeleton(ctx, x, feetY, t, dir, step, walkAmt) {
    x = snap(x, 2); feetY = Math.round(feetY);
    walkAmt = (walkAmt === undefined) ? 1 : walkAmt;
    var bone = "#7a8471", boneSh = "#4e574a", boneHi = "#8d987f";
    var sL = Math.sin(step + 0.6) * walkAmt, sR = Math.sin(step + 0.6 + Math.PI) * walkAmt;
    var liftL = Math.max(0, Math.cos(step + 0.6)) * 3 * walkAmt;
    var liftR = Math.max(0, -Math.cos(step + 0.6)) * 3 * walkAmt;
    var xL = Math.round(x - 5 + sL * 3.5), xR = Math.round(x + 1 + sR * 3.5);
    var bob = walkAmt * (1.2 - Math.abs(Math.cos(step + 0.6)) * 1.2);
    var y = feetY - Math.round(bob);
    ctx.fillStyle = "rgba(0,0,0,0.30)";
    ctx.fillRect(Math.round(x - 6), feetY - 1, 13, 2);
    ctx.fillStyle = boneSh;
    ctx.fillRect(xL, y - 20, 4, Math.round(20 - liftL));
    ctx.fillRect(xR, y - 20, 4, Math.round(20 - liftR));
    ctx.fillStyle = bone;
    ctx.fillRect(xL, y - 20, 3, Math.round(20 - liftL));
    ctx.fillRect(xR, y - 20, 3, Math.round(20 - liftR));
    ctx.fillStyle = boneSh;
    ctx.fillRect(xL - 1, y - 3 - Math.round(liftL), 5, 3);
    ctx.fillRect(xR - 1, y - 3 - Math.round(liftR), 5, 3);
    var breathe = Math.sin(t / 600) * 0.7;
    ctx.fillStyle = bone;
    ctx.fillRect(x - 6, Math.round(y - 38 + breathe * 0.3), 12, 18);
    ctx.fillStyle = boneHi;
    ctx.fillRect(x - 6, Math.round(y - 38 + breathe * 0.3), 2, 18);
    ctx.fillStyle = boneSh;
    ctx.fillRect(x - 6, Math.round(y - 34 + breathe * 0.3), 12, 2);
    ctx.fillRect(x - 6, Math.round(y - 30 + breathe * 0.3), 12, 2);
    ctx.fillRect(x - 6, Math.round(y - 26 + breathe * 0.3), 12, 2);
    var rattle = Math.sin(t / 90) > 0.92 ? 1 : 0;
    var aSw = Math.sin(step + 0.6 + Math.PI) * 2.4 * walkAmt;
    ctx.fillStyle = bone;
    ctx.fillRect(Math.round(x - 8 + aSw * 0.6), Math.round(y - 37 + rattle), 3, 14);
    ctx.fillRect(Math.round(x + 5 - aSw * 0.6), Math.round(y - 37 - rattle), 3, 14);
    var jaw = (walkAmt > 0.4 && Math.abs(Math.sin(step)) > 0.85) ? 1 : 0;
    ctx.fillStyle = bone;
    ctx.fillRect(x - 6, y - 50, 12, 12);
    ctx.fillStyle = boneHi;
    ctx.fillRect(x - 6, y - 50, 12, 2);
    ctx.fillStyle = "#111711";
    /* symmetric sockets with 2px margins — never poke past the skull edges */
    ctx.fillRect(x - 4 + (dir >= 0 ? 1 : -1), y - 46, 3, 4);
    ctx.fillRect(x + 1 + (dir >= 0 ? 1 : -1), y - 46, 3, 4);
    /* nose cavity centered under the sockets */
    ctx.fillRect(x - 1, y - 41, 2, 2);
    ctx.fillRect(x - 2, y - 40 + jaw, 8, 2);
  }

  /* ============================================================
     THE NETHER  (Versions)
     Red fog, netherrack cliffs, a nether-brick fortress bridge,
     glowstone on the ceiling, lavafalls, a flowing lava lake,
     rising embers and a ghast drifting through the haze.
     ============================================================ */
  function ghast(ctx, x, y, u, t, a, ph) {
    ctx.globalAlpha = a;
    var i, len;
    for (i = 0; i < 6; i++) {
      len = u * (2 + (i * 7 % 3)) + Math.sin(t / 420 + i + ph) * u * 0.7;
      ctx.fillStyle = "#5fbf3e"; ctx.fillRect(snap(x + u * (0.6 + i * 2), T), y + 12 * u - 2, u, snap(len, T));
    }
    ctx.fillStyle = "#8fdb5c"; ctx.fillRect(x, y, 12 * u, 12 * u);
    ctx.fillStyle = "#3f9a2c"; ctx.fillRect(x, y + 11 * u, 12 * u, u); ctx.fillRect(x + 11 * u, y, u, 12 * u);
    ctx.fillStyle = "#245c17";
    ctx.fillRect(x + 2 * u, y + 5 * u, 3 * u, u * 0.5); ctx.fillRect(x + 7 * u, y + 5 * u, 3 * u, u * 0.5);
    ctx.fillRect(x + 5 * u, y + 8 * u, 2 * u, u);
    ctx.globalAlpha = 1;
  }

  makeScene("netherBg",
    function (g, w, h, rand) {
      var cols = Math.ceil(w / B) + 1, c, x, y, k;
      var lavaH = snap(clamp(h * 0.13, 110, 160), T), lt = h - lavaH;
      var rack = ["#2c6e2f", "#347c37", "#266023", "#3c8741", "#2e722f"];
      var rackDark = ["#143a17", "#18431b", "#103210", "#1b4a20"];
      var far = ["#0d2c10", "#0f320f", "#0b270c"];
      var brick = ["#16301b", "#1c3720", "#122619", "#1f3a22"];
      var glowstone = ["#c9ff5a", "#b1f53a", "#e0ff8a", "#96e02a", "#d7ff77"];

      /* red fog sky */
      var bg = g.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#051805"); bg.addColorStop(0.35, "#0a2e09");
      bg.addColorStop(0.7, "#165c10"); bg.addColorStop(1, "#2c8f13");
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      var hz = g.createRadialGradient(w / 2, lt, 0, w / 2, lt, w * 0.65);
      hz.addColorStop(0, "rgba(120,255,60,0.3)"); hz.addColorStop(1, "rgba(120,255,60,0)");
      g.fillStyle = hz; g.fillRect(0, 0, w, h);

      /* distant netherrack ridge */
      for (x = 0; x < w; x += B) {
        var n = Math.sin(x * 0.005 + 0.6) * 46 + Math.sin(x * 0.013 + 1.9) * 20;
        var ry = snap(lt - h * 0.2 - n, T * 2);
        tex(g, x, ry, B, h - ry, far, rand, 0.7);
        g.fillStyle = "#144a18"; g.fillRect(x, ry, B, T * 2);
      }

      /* nether fortress: bridge on pillars + a tower with lit slits */
      var by = snap(lt - h * 0.17, B);
      tex(g, 0, by, w, B / 2, brick, rand, 0.5);
      g.fillStyle = "#0d1d10"; g.fillRect(0, by + B / 2 - T, w, T);
      g.fillStyle = "#122a16"; g.fillRect(0, by - 12, w, T);
      for (x = 0; x < w; x += B) { g.fillStyle = "#122a16"; g.fillRect(x + 12, by - 16, 8, 16); }
      for (x = 48; x < w; x += 176) {
        tex(g, x, by + B / 2, B, lt - by - B / 2, brick, rand, 0.5);
        g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(x, by + B / 2, T * 2, lt - by - B / 2);
        tex(g, x - 12, by + B / 2, B + 24, 12, brick, rand, 0.5);
      }
      var tx = snap(w * 0.74, B), tw = 4 * B, th = 6 * B, slits = [];
      tex(g, tx, by - th, tw, th, brick, rand, 0.5);
      for (k = 0; k < 4; k++) if (k % 2 === 0) tex(g, tx + k * B, by - th - B / 2, B, B / 2, brick, rand, 0.5);
      g.fillStyle = "rgba(0,0,0,0.28)"; g.fillRect(tx, by - th, T * 2, th);
      for (k = 0; k < 3; k++) {
        var sy2 = by - th + B + k * (B * 1.6);
        g.fillStyle = "#0a1710"; g.fillRect(tx + B + 8, sy2, 12, 24); g.fillRect(tx + 2 * B + 12, sy2, 12, 24);
        slits.push({ x: tx + B + 8, y: sy2 }, { x: tx + 2 * B + 12, y: sy2 });
      }

      /* near netherrack cliffs, tall at the edges and low in the middle */
      for (x = 0; x < w; x += B) {
        var edge = smooth(0, 0.3, Math.min(x, w - x) / w);
        var cy = snap(lt - 2 * B - (1 - edge) * h * 0.4 + Math.sin(x * 0.02) * B * 0.7 + (rand() - 0.5) * B, T * 2);
        tex(g, x, cy, B, lt - cy + T, rack, rand, 0.4);
        g.fillStyle = "#479b4b"; g.fillRect(x, cy, B, T * 2);
        g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(x, cy + T * 2, B, T);
      }

      /* ceiling + hanging glowstone */
      var glows = [], ceilB = [], cv = 3;
      for (c = 0; c < cols; c++) {
        cv = clamp(cv + (rand() < 0.5 ? -1 : (rand() < 0.5 ? 1 : 0)), 2, 4);
        ceilB.push(cv * B);
        tex(g, c * B, 0, B, cv * B, rackDark, rand, 0.4);
        g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(c * B, cv * B - T * 2, B, T * 2);
        if (rand() < 0.35) tex(g, c * B, cv * B, B, B * (1 + ((rand() * 2) | 0)) * 0.5, rack, rand, 0.4);
      }
      var gcount = Math.max(2, Math.round(w / 380));
      for (k = 0; k < gcount; k++) {
        var gc = ((rand() * (cols - 2)) | 0) + 1, gx = gc * B, gy0 = ceilB[gc];
        var cells = [[0, 0], [1, 0], [-1, 0], [0, 1], [1, 1]].slice(0, 3 + ((rand() * 3) | 0));
        cells.forEach(function (cl) { tex(g, gx + cl[0] * B, gy0 + cl[1] * B - 4, B, B, glowstone, rand, 0.35); });
        glows.push({ x: gx + B / 2, y: gy0 + B, ph: rand() * 6.28 });
      }

      /* lavafall spouts */
      var falls = [0.3, 0.6].map(function (f) {
        var fx = snap(w * f, B);
        return { x: fx, top: ceilB[Math.min(Math.floor(fx / B), cols - 1)] };
      });

      /* flowing lava texture (scrolled at runtime) */
      var lc = document.createElement("canvas"); lc.width = w; lc.height = lavaH;
      var lg = lc.getContext("2d");
      tex(lg, 0, 0, w, lavaH, ["#3ea832", "#42b136", "#48ba3a", "#39a02e", "#4fc23f"], rand, 0.35);
      for (k = 0; k < (w * lavaH) / 1500; k++) {
        lg.fillStyle = rand() < 0.55 ? "#2e8a24" : "#a3e82a";
        lg.fillRect(snap(rand() * w, T), snap(rand() * lavaH, T), T * (3 + ((rand() * 6) | 0)), T * (1 + ((rand() * 2) | 0)));
      }
      for (k = 0; k < (w * lavaH) / 9000; k++) {
        lg.fillStyle = "#c8f542";
        lg.fillRect(snap(rand() * w, T), snap(rand() * lavaH, T), T * (2 + ((rand() * 3) | 0)), T);
      }

      var embers = [];
      for (k = 0; k < Math.round(w / 32); k++) embers.push({ x: rand() * w, y: rand() * h, v: 0.3 + rand() * 0.6, sw: 8 + rand() * 24, sp: 0.0006 + rand() * 0.0008, ph: rand() * 6.28, s: rand() < 0.3 ? 8 : 4 });
      return { lt: lt, lavaH: lavaH, lc: lc, glows: glows, falls: falls, slits: slits, embers: embers, pops: [], nextPop: 0 };
    },
    function (ctx, S, t) {
      var d = S.dyn, i, w = S.w, lt = d.lt;

      /* ghasts drifting through the fog */
      ghast(ctx, w * 0.84 + Math.sin(t / 3400) * 26, S.h * 0.2 + Math.sin(t / 1700) * 10, 8, t, 0.78, 0);
      ghast(ctx, w * 0.1 + Math.sin(t / 4100 + 2) * 18, S.h * 0.34 + Math.sin(t / 2100 + 1) * 8, 5, t, 0.4, 3);

      /* lavafalls — seamless loop: dense blobs tile every 24px so the stream
         never breaks, plus a second shimmer layer and foam where it lands */
      for (i = 0; i < d.falls.length; i++) {
        var f = d.falls[i], len = lt - f.top;
        /* heat haze behind the stream */
        ctx.fillStyle = "rgba(120,255,70,0.10)";
        ctx.fillRect(f.x - 6, f.top, 44, len);
        /* solid stream body */
        ctx.fillStyle = "#3ba82e"; ctx.fillRect(f.x + 4, f.top, 24, len);
        ctx.fillStyle = "#2e8a24"; ctx.fillRect(f.x + 4, f.top, 4, len);
        ctx.fillRect(f.x + 24, f.top, 4, len);
        ctx.fillStyle = "#4fc238"; ctx.fillRect(f.x + 10, f.top, 12, len);
        /* layer 1: bright gobs scrolling down, tiled seamlessly */
        var sp1 = 28, off1 = (t * 0.09 + i * 53) % sp1;
        var n1 = Math.ceil(len / sp1) + 2;
        for (var k = 0; k < n1; k++) {
          var yy = f.top - sp1 + ((k * sp1 + off1) % (len + sp1));
          ctx.fillStyle = (k % 2) ? "#a3e84a" : "#c8f542";
          ctx.fillRect(f.x + 8 + ((k * 7 + i * 5) % 12), yy, 8, 12);
        }
        /* layer 2: thinner sparks scrolling a touch faster for shimmer */
        var sp2 = 40, off2 = (t * 0.13 + i * 31) % sp2;
        var n2 = Math.ceil(len / sp2) + 2;
        for (var k2 = 0; k2 < n2; k2++) {
          var yy2 = f.top - sp2 + ((k2 * sp2 + off2) % (len + sp2));
          ctx.fillStyle = "rgba(230,255,170,0.85)";
          ctx.fillRect(f.x + 12 + ((k2 * 11 + i * 7) % 8), yy2, 4, 8);
        }
        /* landing foam + glow where the fall meets the lake */
        ctx.fillStyle = "rgba(160,230,90,0.5)"; ctx.fillRect(f.x - 4, lt - 8, 40, 8);
        ctx.fillStyle = "#e8ff9a"; ctx.fillRect(f.x + 6, lt - 6, 20, 4);
      }

      /* lava lake: two layers sliding at different speeds */
      var off = snap((t * 0.014) % w, T), off2 = snap((t * 0.006) % w, T);
      ctx.drawImage(d.lc, off, lt); ctx.drawImage(d.lc, off - w, lt);
      ctx.globalAlpha = 0.28; ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(d.lc, -off2, lt); ctx.drawImage(d.lc, w - off2, lt);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#b8e83f"; ctx.fillRect(0, lt, w, T);
      ctx.fillStyle = "rgba(210,255,150,0.7)"; ctx.fillRect(0, lt, w, 2);
      /* the lake sinks into darkness at the bottom so it hands over cleanly to the End */
      var deepFade = ctx.createLinearGradient(0, lt + 16, 0, S.h);
      deepFade.addColorStop(0, "rgba(4,12,4,0)"); deepFade.addColorStop(1, "rgba(3,12,4,0.92)");
      ctx.fillStyle = deepFade; ctx.fillRect(0, lt + 16, w, S.h - lt - 16);

      /* glow: lava upward, glowstone, fortress slits */
      ctx.globalCompositeOperation = "lighter";
      var pulse = 0.85 + 0.15 * Math.sin(t / 700);
      var lgr = ctx.createLinearGradient(0, lt - 240, 0, lt);
      lgr.addColorStop(0, "rgba(90,220,60,0)"); lgr.addColorStop(1, "rgba(90,220,60," + (0.34 * pulse).toFixed(3) + ")");
      ctx.fillStyle = lgr; ctx.fillRect(0, lt - 240, w, 240);
      for (i = 0; i < d.glows.length; i++) {
        var gl = d.glows[i], gp = 0.75 + 0.25 * Math.sin(t / 900 + gl.ph);
        var gr = ctx.createRadialGradient(gl.x, gl.y, 4, gl.x, gl.y, 150);
        gr.addColorStop(0, "rgba(190,255,90," + (0.4 * gp).toFixed(3) + ")"); gr.addColorStop(1, "rgba(150,255,40,0)");
        ctx.fillStyle = gr; ctx.fillRect(gl.x - 150, gl.y - 150, 300, 300);
      }
      for (i = 0; i < d.slits.length; i++) {
        var sl = d.slits[i];
        ctx.fillStyle = "rgba(140,255,60," + (0.55 + 0.25 * Math.sin(t / 500 + i)).toFixed(3) + ")";
        ctx.fillRect(sl.x + 2, sl.y + 4, 8, 16);
      }
      ctx.globalCompositeOperation = "source-over";

      /* lava pops */
      if (t > d.nextPop) { d.pops.push({ x: snap(Math.random() * w, T), t0: t }); d.nextPop = t + 250 + Math.random() * 500; }
      for (i = d.pops.length - 1; i >= 0; i--) {
        var p = d.pops[i], pp = (t - p.t0) / 700;
        if (pp >= 1) { d.pops.splice(i, 1); continue; }
        var ps = 4 + Math.round(pp * 3) * 4;
        ctx.fillStyle = "rgba(200,255,120," + (0.9 * (1 - pp)).toFixed(3) + ")";
        ctx.fillRect(p.x - ps / 2, lt - ps * 0.8 - pp * 14, ps, ps);
      }

      /* embers */
      for (i = 0; i < d.embers.length; i++) {
        var e = d.embers[i];
        e.y -= e.v * 1.4;
        if (e.y < -10) { e.y = S.h + 10; e.x = Math.random() * w; }
        var ex = e.x + Math.sin(t * e.sp + e.ph) * e.sw;
        var bl = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.004 + e.ph));
        ctx.fillStyle = "rgba(" + (60 + ((i * 17) % 60)) + ",255,80," + (0.85 * bl).toFixed(3) + ")";
        ctx.fillRect(snap(ex, 2), snap(e.y, 2), e.s, e.s);
      }
    }
  );

  /* ============================================================
     THE END  (About)
     Black-violet void, a pale end-stone floor, obsidian spires with
     end crystals, endermen that teleport, and the Ender Dragon
     passing by.
     ============================================================ */
  function dragon(ctx, x, y, t, s) {
    var flap = Math.sin(t / 260), i, j, sx, sy, R = [], far = [];
    var pts = [];
    for (i = 0; i < 16; i++) {
      pts.push([x - i * s * 4.6, y + Math.sin(t / 520 - i * 0.5) * s * 3 + i * s * 0.5]);
    }
    /* wings sweep back and flap up/down from the shoulder */
    function wing(list, dx, dy) {
      for (j = 0; j < 10; j++) {
        var wx = pts[3][0] - s * 2 - j * s * 3.6 + dx;
        var wy = pts[3][1] - s * 3 + dy - j * s * (0.6 + 4.2 * flap);
        list.push([wx, wy, s * 3.6, s * (11 - j * 0.9)]);
      }
    }
    wing(far, s * 5, s * 1);
    wing(R, 0, 0);
    for (i = 0; i < pts.length; i++) {
      var sz = Math.max(2, 7 - i * 0.34);
      R.push([pts[i][0], pts[i][1], sz * s * 1.1, sz * s]);
    }
    R.push([pts[0][0] + s * 6, pts[0][1] + s * 2.5, s * 5, s * 3.5]);   // snout
    R.push([pts[0][0] + s * 1, pts[0][1] - s * 3, s * 2, s * 3]);        // horn
    var all = far.concat(R);
    ctx.fillStyle = "rgba(170,255,110,0.2)";                             // green rim light
    for (i = 0; i < all.length; i++) ctx.fillRect(snap(all[i][0], T) - 4, snap(all[i][1], T) - 4, snap(all[i][2], T) + 8, snap(all[i][3], T) + 8);
    ctx.fillStyle = "#121d0a";
    for (i = 0; i < far.length; i++) ctx.fillRect(snap(far[i][0], T), snap(far[i][1], T), snap(far[i][2], T), snap(far[i][3], T));
    ctx.fillStyle = "#0a1005";
    for (i = 0; i < R.length; i++) ctx.fillRect(snap(R[i][0], T), snap(R[i][1], T), snap(R[i][2], T), snap(R[i][3], T));
    ctx.fillStyle = "#c8ffb0"; ctx.fillRect(snap(pts[0][0] + s * 3.5, T), snap(pts[0][1] + s, T), snap(s * 1.6, T), snap(s * 1.2, T));
  }

  function enderman(ctx, x, gy, t, a) {
    var sway = Math.round(Math.sin(t / 700 + x) * 1);
    ctx.globalAlpha = a;
    ctx.fillStyle = "#122a13";
    ctx.fillRect(x - 8, gy - 96, 16, 16);                         // head
    ctx.fillRect(x - 8, gy - 80, 16, 28);                         // torso
    /* shoulders overlap the torso by 1px so the joint can never split;
       only the hands drift by 1px */
    ctx.fillRect(x - 11, gy - 80, 4, 46); ctx.fillRect(x + 7, gy - 80, 4, 46);   // arms (glued)
    ctx.fillRect(x - 11 + sway, gy - 42, 4, 8); ctx.fillRect(x + 7 - sway, gy - 42, 4, 8);     // hands sway
    ctx.fillRect(x - 8, gy - 52, 6, 52); ctx.fillRect(x + 2, gy - 52, 6, 52);                  // legs
    ctx.fillStyle = "#245c2a"; ctx.fillRect(x - 8, gy - 96, 16, 3);
    ctx.fillStyle = "#c8ffb0"; ctx.fillRect(x - 6, gy - 90, 5, 3); ctx.fillRect(x + 1, gy - 90, 5, 3);
    ctx.globalAlpha = 1;
  }

  makeScene("endBg",
    function (g, w, h, rand) {
      var i, k, x, y;
      var obsidian = ["#151f10", "#1b2814", "#111a0c", "#21301a", "#2b4521"];
      /* dark green End-surface palette (no pale end-stone) */
      var groundPal = ["#1b4d24", "#225f30", "#183d1f", "#2b7038", "#1c3a23"];
      var gy = h - snap(clamp(h * 0.16, 110, 170), B / 2);

      /* the void — lifted dark green so the section never looks pitch black */
      var bg = g.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#071a08"); bg.addColorStop(0.5, "#102b12"); bg.addColorStop(1, "#1e4d1e");
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      for (i = 0; i < (w * h) / 5200; i++) {
        g.fillStyle = "rgba(20,60,25," + (0.05 + rand() * 0.05).toFixed(3) + ")";
        g.fillRect(snap(rand() * w, 16), snap(rand() * h, 16), 16, 16);
      }
      var stars = [];
      for (i = 0; i < Math.round(w / 12); i++) {
        var star = { x: snap(rand() * w, T), y: snap(rand() * h * 0.8, T), a: 0.25 + rand() * 0.55, sp: 0.0008 + rand() * 0.0018, ph: rand() * 6.28, big: rand() < 0.12 };
        g.fillStyle = "rgba(230,255,215," + (star.a * 0.5).toFixed(3) + ")"; g.fillRect(star.x, star.y, T, T);
        if (i % 3 === 0) stars.push(star);
      }
      var hz = g.createRadialGradient(w / 2, h, 0, w / 2, h, w * 0.7);
      hz.addColorStop(0, "rgba(150,255,80,0.36)"); hz.addColorStop(1, "rgba(150,255,80,0)");
      g.fillStyle = hz; g.fillRect(0, 0, w, h);

      /* ground island first so we know the exact surface height everywhere */
      var groundTops = [];
      for (x = 0; x < w; x += B) {
        var top = snap(gy + Math.sin(x * 0.006) * 6 + (rand() - 0.5) * 6, T * 2);
        groundTops.push(top);
        tex(g, x, top, B, h - top, groundPal, rand, 0.6);
        g.fillStyle = "rgba(140,255,150,0.16)"; g.fillRect(x, top, B, T * 2);
      }

      /* obsidian spires — extended 2 blocks into the ground so the base
         can never float above the surface */
      var spires = [
        { x: 0.06, hh: 0.52 }, { x: 0.43, hh: 0.4 }, { x: 0.93, hh: 0.46 }
      ].map(function (sp) {
        var px = snap(w * sp.x, B), ph = snap((gy) * sp.hh, B);
        var foot = 2 * B;
        tex(g, px, gy - ph, 2 * B, ph + foot, obsidian, rand, 0.6);
        g.fillStyle = "rgba(160,255,110,0.18)"; g.fillRect(px, gy - ph, T, ph + foot);
        g.fillStyle = "#3a552f"; g.fillRect(px - 4, gy - ph - 8, 2 * B + 8, 8);
        [-8, 2 * B + 4].forEach(function (o) { g.fillStyle = "#778a73"; g.fillRect(px + o, gy - ph - 8 - 40, 4, 40); });
        g.fillStyle = "#778a73"; g.fillRect(px - 8, gy - ph - 8 - 40, 2 * B + 16, 4);
        return { x: px + B, y: gy - ph - 8 - 20 };
      });

      var rods = [];

      var enderPos = [snap(w * 0.28, 4), snap(w * 0.62, 4)];
      var parts = [];
      for (i = 0; i < 24; i++) parts.push({ e: i % 2, ox: (rand() - 0.5) * 60, ph: rand() * 6.28, sp: 0.0006 + rand() * 0.0008, oy: rand() * 100 });
      return {
        stars: stars, spires: spires, rods: rods, gy: gy, groundTops: groundTops,
        ender: [{ x: enderPos[0], next: 6000 }, { x: enderPos[1], next: 11000 }],
        parts: parts, bursts: [], drg: { t0: 3500, y: h * 0.18, dur: 30000 }
      };
    },
    function (ctx, S, t) {
      var d = S.dyn, i, w = S.w;

      /* stars twinkle */
      for (i = 0; i < d.stars.length; i++) {
        var s = d.stars[i], a = s.a * (0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph)));
        ctx.fillStyle = "rgba(235,255,220," + a.toFixed(3) + ")";
        ctx.fillRect(s.x, s.y, s.big ? 8 : 4, s.big ? 8 : 4);
      }

      /* dragon crossing the sky */
      var dg = d.drg, p = (t - dg.t0) / dg.dur;
      if (p >= 1) { dg.t0 = t + 12000 + Math.random() * 12000; dg.y = S.h * (0.1 + Math.random() * 0.2); }
      else if (p > 0) dragon(ctx, -160 + p * (w + 520), dg.y, t, 4);

      /* crystals on the spires (beam removed — glow + crystal only) */
      for (i = 0; i < d.spires.length; i++) {
        var sp = d.spires[i], bob = Math.sin(t / 600 + i) * 4, pu = 0.6 + 0.4 * Math.sin(t / 380 + i * 2);
        ctx.globalCompositeOperation = "lighter";
        var cg = ctx.createRadialGradient(sp.x, sp.y + bob, 2, sp.x, sp.y + bob, 60);
        cg.addColorStop(0, "rgba(120,255,150," + (0.5 * pu).toFixed(3) + ")"); cg.addColorStop(1, "rgba(120,255,150,0)");
        ctx.fillStyle = cg; ctx.fillRect(sp.x - 60, sp.y + bob - 60, 120, 120);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#3fc15a"; ctx.fillRect(sp.x - 12, sp.y + bob - 12, 24, 24);
        ctx.fillStyle = "#7bff9e"; ctx.fillRect(sp.x - 8, sp.y + bob - 8, 16, 16);
        ctx.fillStyle = "#e0ffe6"; ctx.fillRect(sp.x - 4, sp.y + bob - 4, 8, 8);
      }

      /* end rods glow */
      ctx.globalCompositeOperation = "lighter";
      for (i = 0; i < d.rods.length; i++) {
        var r = d.rods[i], ra = 0.6 + 0.4 * Math.sin(t / 800 + i * 1.3);
        ctx.fillStyle = "rgba(150,255,180," + (0.14 * ra).toFixed(3) + ")"; ctx.fillRect(r.x - 14, r.y - 8, 32, 44);
      }
      ctx.globalCompositeOperation = "source-over";
      for (i = 0; i < d.rods.length; i++) {
        ctx.fillStyle = "#e6ffe9"; ctx.fillRect(d.rods[i].x, d.rods[i].y, 4, 16);
      }

      /* endermen sit exactly on the surface — no floating, no sinking */
      var groundAt = function (x) {
        if (!d.groundTops || !d.groundTops.length) return d.gy;
        var idx = clamp(Math.floor(x / 32), 0, d.groundTops.length - 1);
        return d.groundTops[idx];
      };
      for (i = 0; i < d.ender.length; i++) {
        var en = d.ender[i];
        if (t > en.next) {
          for (var q = 0; q < 14; q++) d.bursts.push({ x: en.x + (Math.random() - 0.5) * 24, y: groundAt(en.x) - Math.random() * 96, t0: t, vx: (Math.random() - 0.5) * 0.06, vy: -0.02 - Math.random() * 0.05 });
          var other = d.ender[(i + 1) % d.ender.length], nx, guard = 0;
          var hitsPillar = function (x) {
            for (var pi = 0; pi < d.spires.length; pi++) {
              if (Math.abs(x - d.spires[pi].x) < 95) return true;
            }
            return false;
          };
          do { nx = snap(w * (0.12 + Math.random() * 0.55), 4); guard++; }
          while ((other && Math.abs(nx - other.x) < 130 || hitsPillar(nx)) && guard < 24);
          en.x = nx;
          for (q = 0; q < 14; q++) d.bursts.push({ x: en.x + (Math.random() - 0.5) * 24, y: groundAt(en.x) - Math.random() * 96, t0: t, vx: (Math.random() - 0.5) * 0.06, vy: -0.02 - Math.random() * 0.05 });
          en.next = t + 8000 + Math.random() * 9000;
        }
        enderman(ctx, en.x, groundAt(en.x), t, 1);
      }
      for (i = 0; i < d.parts.length; i++) {
        var pt = d.parts[i], e2 = d.ender[pt.e];
        var px = e2.x + pt.ox + Math.sin(t * pt.sp + pt.ph) * 10;
        var py = groundAt(e2.x) - ((pt.oy + t * 0.02) % 110);
        ctx.fillStyle = "rgba(120,255,150," + (0.35 + 0.4 * Math.sin(t * 0.003 + pt.ph)).toFixed(3) + ")";
        ctx.fillRect(snap(px, 2), snap(py, 2), 4, 4);
      }
      for (i = d.bursts.length - 1; i >= 0; i--) {
        var bu = d.bursts[i], bp = (t - bu.t0) / 900;
        if (bp >= 1) { d.bursts.splice(i, 1); continue; }
        ctx.fillStyle = "rgba(130,255,160," + (0.9 * (1 - bp)).toFixed(3) + ")";
        ctx.fillRect(snap(bu.x + bu.vx * (t - bu.t0), 2), snap(bu.y + bu.vy * (t - bu.t0), 2), 4, 4);
      }
    }
  );
})();