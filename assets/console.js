/* psyche-0.com
   Menu toggle, the star field on the Overview, and the PSYCHE-0 map preview.
   Everything drawn on a canvas here is generated locally, on the reader's machine.
*/
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* menu */
  var btn = document.querySelector(".menu");
  var nav = document.getElementById("nav");
  if (btn && nav) {
    function setOpen(open) {
      document.body.classList.toggle("nav-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Close" : "Menu";
    }
    btn.addEventListener("click", function () {
      setOpen(!document.body.classList.contains("nav-open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* star field */
  function stars(canvas, count, speed) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h, pts;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = Array.from({ length: count }, function () {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.2,
          a: Math.random() * 0.6 + 0.15,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed
        };
      });
    }
    resize();
    window.addEventListener("resize", resize);

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (!reduced) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        }
        ctx.fillStyle = "rgba(240,240,250," + p.a + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced) requestAnimationFrame(tick);
    }
    tick();
  }
  stars(document.getElementById("field"), 160, 0.12);

  /* PSYCHE-0 map preview */
  var map = document.getElementById("map");
  if (!map) return;

  var flash = document.getElementById("flash");
  var statusEl = document.getElementById("map-status");
  var divFill = document.getElementById("div-fill");
  var conFill = document.getElementById("con-fill");
  var divVal = document.getElementById("div-val");
  var conVal = document.getElementById("con-val");

  var ctx = map.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W, H;
  var N = 86;
  var nodes = [];
  var you = { x: 0.62, y: 0.58 };
  var collapsing = false;

  function size() {
    W = map.clientWidth;
    H = map.clientHeight || 440;
    map.width = W * dpr;
    map.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener("resize", size);

  function seed() {
    nodes.length = 0;
    for (var i = 0; i < N; i++) {
      var cluster = i < 34 ? 0 : i < 62 ? 1 : 2;
      var cx = cluster === 0 ? 0.34 : cluster === 1 ? 0.68 : Math.random();
      var cy = cluster === 0 ? 0.46 : cluster === 1 ? 0.52 : Math.random();
      var spread = cluster === 2 ? 0.28 : 0.11;
      nodes.push({
        x: cx + (Math.random() - 0.5) * spread,
        y: cy + (Math.random() - 0.5) * spread,
        vx: (Math.random() - 0.5) * 0.00035,
        vy: (Math.random() - 0.5) * 0.00035,
        r: Math.random() * 1.8 + 0.8,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }
  seed();

  function setMeters(d, c) {
    if (divFill) divFill.style.width = Math.round(d * 100) + "%";
    if (conFill) conFill.style.width = Math.round(c * 100) + "%";
    if (divVal) divVal.textContent = d.toFixed(2);
    if (conVal) conVal.textContent = c.toFixed(2);
  }
  setMeters(0.58, 0.31);

  function collapse() {
    if (collapsing) return;
    collapsing = true;
    if (statusEl) statusEl.textContent = "Signal collapsed";
    if (flash) flash.classList.add("on");
    setMeters(0.22, 0.81);
    setTimeout(function () {
      if (flash) flash.classList.remove("on");
      seed();
      setMeters(0.54 + Math.random() * 0.2, 0.22 + Math.random() * 0.18);
      if (statusEl) statusEl.textContent = "Signal forming";
      collapsing = false;
    }, 2400);
  }

  if (!reduced) {
    setTimeout(collapse, 9000);
    setInterval(function () { if (Math.random() < 0.25) collapse(); }, 16000);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(240,240,250,0.05)";
    ctx.lineWidth = 1;
    for (var x = 40; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (var y = 40; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (!reduced && !collapsing) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0.04 || n.x > 0.96) n.vx *= -1;
        if (n.y < 0.08 || n.y > 0.92) n.vy *= -1;
        n.pulse += 0.03;
      }
      var a = 0.35 + Math.sin(n.pulse) * 0.2;
      ctx.fillStyle = "rgba(215,236,255," + a + ")";
      ctx.beginPath();
      ctx.arc(n.x * W, n.y * H, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    var ux = you.x * W, uy = you.y * H;
    ctx.strokeStyle = "rgba(240,240,250,0.85)";
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(ux, uy, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(ux, uy, 2.2, 0, Math.PI * 2); ctx.fillStyle = "#f0f0fa"; ctx.fill();
    ctx.font = "11px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "rgba(240,240,250,0.55)";
    ctx.fillText("YOU ARE HERE", ux + 14, uy + 4);

    if (!reduced) requestAnimationFrame(draw);
  }
  draw();
})();
