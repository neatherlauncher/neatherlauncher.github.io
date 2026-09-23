/* OVERWORLD hero background, home section (split from js/main.js; logic unchanged). */
(function () {
  "use strict";
  var clamp = window.Neather.bg.clamp;
  var drawSheep = window.Neather.mobs.drawSheep;
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
})();
