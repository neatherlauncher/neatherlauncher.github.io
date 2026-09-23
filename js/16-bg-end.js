/* THE END background, about section (split from js/main.js; logic unchanged). */
(function () {
  "use strict";
  var B = window.Neather.bg.B, T = window.Neather.bg.T;
  var clamp = window.Neather.bg.clamp, snap = window.Neather.bg.snap;
  var tex = window.Neather.bg.tex, makeScene = window.Neather.bg.makeScene;
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
