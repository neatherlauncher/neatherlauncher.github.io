/* THE NETHER background, versions section (split from js/main.js; logic unchanged). */
(function () {
  "use strict";
  var B = window.Neather.bg.B, T = window.Neather.bg.T;
  var clamp = window.Neather.bg.clamp, snap = window.Neather.bg.snap, smooth = window.Neather.bg.smooth;
  var tex = window.Neather.bg.tex, makeScene = window.Neather.bg.makeScene;
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
})();
