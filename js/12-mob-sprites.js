/* Pixel mob sprites: sheep / zombie / skeleton (split from js/main.js; logic unchanged). Exposes window.Neather.mobs for the Overworld + Cave scenes. */
(function () {
  "use strict";
  var snap = window.Neather.bg.snap;
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
  window.Neather = window.Neather || {};
  window.Neather.mobs = { drawSheep: drawSheep, drawZombie: drawZombie, drawSkeleton: drawSkeleton };
})();
