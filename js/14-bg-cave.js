/* CAVE background, What-is-new section (split from js/main.js; logic unchanged). */
(function () {
  "use strict";
  var B = window.Neather.bg.B, T = window.Neather.bg.T;
  var clamp = window.Neather.bg.clamp, snap = window.Neather.bg.snap, smooth = window.Neather.bg.smooth;
  var tex = window.Neather.bg.tex, makeScene = window.Neather.bg.makeScene;
  var drawZombie = window.Neather.mobs.drawZombie, drawSkeleton = window.Neather.mobs.drawSkeleton;
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
})();
