/* Dimension-background shared helpers: block textures + scene runner (split from js/main.js; logic unchanged). Exposes window.Neather.bg. Loads before mob sprites + all scenes. */
(function () {
  "use strict";
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
    if (window.Neather && window.Neather.reduceMotion) { frame(0); }
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
      timer = setTimeout(function () { if (build() && window.Neather && window.Neather.reduceMotion) frame(0); }, 150);
    }
    if ("ResizeObserver" in window) new ResizeObserver(onResize).observe(cv.parentNode);
    else window.addEventListener("resize", onResize);
  }
  window.Neather = window.Neather || {};
  window.Neather.bg = {
    B: B, T: T, seeded: seeded, clamp: clamp, snap: snap, smooth: smooth,
    hex: hex, mixHex: mixHex, tint: tint, tex: tex, makeScene: makeScene
  };
})();
