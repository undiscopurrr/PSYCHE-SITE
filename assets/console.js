/* psyche-0.com
   Menu toggle, the star field on the Overview, the PSYCHE-0 map, its clock and
   terminal, and the Intelligence recordings that start when scrolled into view.
   Everything drawn on a canvas here is generated locally, on the reader's machine.
*/
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* menu */
  var btn = document.querySelector(".menu");
  var nav = document.getElementById("nav");
  if (btn && nav) {
    var setOpen = function (open) {
      document.body.classList.toggle("nav-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Close" : "Menu";
    };
    btn.addEventListener("click", function () { setOpen(!document.body.classList.contains("nav-open")); });
    nav.addEventListener("click", function (e) { if (e.target.tagName === "A") setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }


  /* Research dropdown */
  document.querySelectorAll(".drop-btn").forEach(function (b) {
    var menu = document.getElementById(b.getAttribute("aria-controls"));
    if (!menu) return;
    var set = function (open) { menu.hidden = !open; b.setAttribute("aria-expanded", open ? "true" : "false"); };
    b.addEventListener("click", function (e) { e.stopPropagation(); set(menu.hidden); });
    document.addEventListener("click", function (e) { if (!menu.contains(e.target)) set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
  });

  /* recordings: each plays from the start when it enters the viewport and pauses when it leaves */
  var clips = document.querySelectorAll("video[data-play-in-view]");
  if (clips.length && !reduced && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (v.paused) { try { v.currentTime = 0; } catch (err) {} var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.35 });
    clips.forEach(function (c) { io.observe(c); });
  }

  /* PSYCHE-0: UTC clock */
  var now = document.getElementById("utc-now");
  if (now) {
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var tickClock = function () {
      var d = new Date();
      now.textContent = d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()) +
        " " + pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds()) + " UTC";
    };
    tickClock();
    setInterval(tickClock, 1000);
  }

  /* PSYCHE-0: the terminal types itself out when it is reached */
  var term = document.getElementById("term-text");
  if (term && !reduced && "IntersectionObserver" in window) {
    var full = term.textContent;
    var tail = document.getElementById("term-end");
    term.textContent = "";
    if (tail) tail.style.visibility = "hidden";
    var started = false;
    var tio = new IntersectionObserver(function (entries) {
      if (started || !entries[0].isIntersecting) return;
      started = true;
      var i = 0;
      var step = function () {
        i = Math.min(full.length, i + 9);
        term.textContent = full.slice(0, i);
        if (i < full.length) requestAnimationFrame(step);
        else if (tail) tail.style.visibility = "visible";
      };
      requestAnimationFrame(step);
    }, { threshold: 0.12 });
    tio.observe(term);
  }

  /* star field */
  function stars(canvas, count, speed) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h, pts;
    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = Array.from({ length: count }, function () {
        return { x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.4 + 0.2,
                 a: Math.random() * 0.6 + 0.15, vx: (Math.random() - 0.5) * speed, vy: (Math.random() - 0.5) * speed };
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
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduced) requestAnimationFrame(tick);
    }
    tick();
  }
  stars(document.getElementById("field"), 160, 0.12);

  /* PSYCHE-0 map */
  var map = document.getElementById("map");
  if (!map) return;
  var divFill = document.getElementById("div-fill");
  var conFill = document.getElementById("con-fill");
  var divVal = document.getElementById("div-val");
  var conVal = document.getElementById("con-val");
  var ctx = map.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W, H, N = 86, nodes = [], you = { x: 0.62, y: 0.58 };
  var div = 0.58, con = 0.31;

  function size() {
    W = map.clientWidth; H = map.clientHeight || 440;
    map.width = W * dpr; map.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener("resize", size);

  for (var i = 0; i < N; i++) {
    var cluster = i < 34 ? 0 : i < 62 ? 1 : 2;
    var cx = cluster === 0 ? 0.34 : cluster === 1 ? 0.68 : Math.random();
    var cy = cluster === 0 ? 0.46 : cluster === 1 ? 0.52 : Math.random();
    var spread = cluster === 2 ? 0.28 : 0.11;
    nodes.push({ x: cx + (Math.random() - 0.5) * spread, y: cy + (Math.random() - 0.5) * spread,
                 vx: (Math.random() - 0.5) * 0.00035, vy: (Math.random() - 0.5) * 0.00035,
                 r: Math.random() * 1.8 + 0.8, pulse: Math.random() * Math.PI * 2 });
  }

  function setMeters() {
    if (divFill) divFill.style.width = Math.round(div * 100) + "%";
    if (conFill) conFill.style.width = Math.round(con * 100) + "%";
    if (divVal) divVal.textContent = div.toFixed(2);
    if (conVal) conVal.textContent = con.toFixed(2);
  }
  setMeters();
  if (!reduced) setInterval(function () {
    div = Math.min(0.74, Math.max(0.46, div + (Math.random() - 0.5) * 0.04));
    con = Math.min(0.42, Math.max(0.22, con + (Math.random() - 0.5) * 0.03));
    setMeters();
  }, 3200);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(240,240,250,0.05)"; ctx.lineWidth = 1;
    for (var x = 40; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (var y = 40; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (var j = 0; j < nodes.length; j++) {
      var n = nodes[j];
      if (!reduced) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0.04 || n.x > 0.96) n.vx *= -1;
        if (n.y < 0.08 || n.y > 0.92) n.vy *= -1;
        n.pulse += 0.03;
      }
      ctx.fillStyle = "rgba(215,236,255," + (0.35 + Math.sin(n.pulse) * 0.2) + ")";
      ctx.beginPath(); ctx.arc(n.x * W, n.y * H, n.r, 0, Math.PI * 2); ctx.fill();
    }
    var ux = you.x * W, uy = you.y * H;
    ctx.strokeStyle = "rgba(240,240,250,0.85)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(ux, uy, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(ux, uy, 2.2, 0, Math.PI * 2); ctx.fillStyle = "#f0f0fa"; ctx.fill();
    ctx.font = "11px 'IBM Plex Mono', monospace"; ctx.fillStyle = "rgba(240,240,250,0.55)";
    ctx.fillText("YOU ARE HERE", ux + 14, uy + 4);
    if (!reduced) requestAnimationFrame(draw);
  }
  draw();
})();
