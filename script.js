(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- loader ---------- */
  var loader = $('#loader');
  var bar = $('#loaderBar');
  var txt = $('#loaderText');
  var steps = ['инициализация…', 'загрузка модулей…', 'построение графа…', 'готово'];
  document.body.classList.add('is-loading');

  var p = 0;
  var loadTimer = setInterval(function () {
    p += Math.random() * 22 + 8;
    if (p > 100) p = 100;
    bar.style.width = p + '%';
    txt.textContent = steps[Math.min(steps.length - 1, Math.floor(p / 26))];
    if (p >= 100) {
      clearInterval(loadTimer);
      setTimeout(function () {
        loader.classList.add('done');
        document.body.classList.remove('is-loading');
        document.body.classList.add('ready');
        startCounters();
        startTerminal();
      }, 250);
    }
  }, 140);

  /* ---------- nav ---------- */
  var nav = $('#nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- reveal ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- counters ---------- */
  function startCounters() {
    $$('[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var n = 0;
      var t = setInterval(function () {
        n++;
        el.textContent = n;
        if (n >= target) clearInterval(t);
      }, 260);
    });
  }

  /* ---------- custom cursor ---------- */
  var cursor = $('#cursor');
  var cx = -100, cy = -100, tx = -100, ty = -100;
  window.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
  (function loop() {
    cx += (tx - cx) * 0.2;
    cy += (ty - cy) * 0.2;
    cursor.style.transform = 'translate(' + (cx - cursor.offsetWidth / 2) + 'px,' + (cy - cursor.offsetHeight / 2) + 'px)';
    requestAnimationFrame(loop);
  })();
  $$('a, button, .card').forEach(function (el) {
    el.addEventListener('mouseenter', function () { cursor.classList.add('hover'); });
    el.addEventListener('mouseleave', function () { cursor.classList.remove('hover'); });
  });

  /* ---------- card tilt + glow ---------- */
  var canTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce;
  $$('.tilt').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
      if (canTilt) {
        var rx = ((y / r.height) - 0.5) * -7;
        var ry = ((x / r.width) - 0.5) * 7;
        card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(0)';
      }
    });
    card.addEventListener('mouseleave', function () { card.style.transform = ''; });
  });

  /* ---------- magnetic buttons ---------- */
  if (canTilt) {
    $$('.btn:not(.btn-block)').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.28;
        b.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- terminal typing ---------- */
  var term = $('#term');
  var termStarted = false;
  var script = [
    { t: '$ piko graph --new', d: 30 },
    { t: '\n  создан пустой граф. добавьте узлы и связи', c: 'dim', d: 12 },
    { t: '\n\n$ piko graph --add домен example.com', d: 30 },
    { t: '\n  + узел [домен] example.com', c: 'dim', d: 12 },
    { t: '\n  + узел [ip]    203.0.113.10', c: 'dim', d: 12 },
    { t: '\n  + связь example.com → 203.0.113.10', c: 'dim', d: 12 },
    { t: '\n\n$ piko bot --open', d: 30 },
    { t: '\n  → t.me/pikosearch_bot', c: 'dim', d: 12 },
    { t: '\n\n$ ', d: 30 }
  ];
  function startTerminal() {
    if (termStarted || !term) return;
    var box = term.closest('.terminal');
    var run = function () {
      if (termStarted) return;
      termStarted = true;
      typeScript();
    };
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { o.disconnect(); run(); }
      }, { threshold: 0.3 });
      o.observe(box);
    } else { run(); }
  }
  function typeScript() {
    var caret = document.createElement('span');
    caret.className = 'caret';
    term.appendChild(caret);
    var i = 0;
    function nextLine() {
      if (i >= script.length) return;
      var item = script[i++];
      var span = document.createElement('span');
      if (item.c) span.className = item.c;
      term.insertBefore(span, caret);
      var j = 0;
      (function typeChar() {
        if (reduce) { span.textContent = item.t; return setTimeout(nextLine, 0); }
        span.textContent += item.t.charAt(j++);
        if (j < item.t.length) setTimeout(typeChar, item.d + Math.random() * 25);
        else setTimeout(nextLine, 280);
      })();
    }
    nextLine();
  }

  /* ---------- year ---------- */
  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- background: interactive graph ---------- */
  var canvas = $('#bg');
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var nodes = [];
  var mouse = { x: -9999, y: -9999 };
  var LINK = 150;

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.round(Math.min(120, Math.max(36, (W * H) / 15000)));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.6 + 0.7
      });
    }
  }
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    if (e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
  }, { passive: true });
  window.addEventListener('mouseout', function () { mouse.x = mouse.y = -9999; });
  resize();

  function frame() {
    ctx.clearRect(0, 0, W, H);
    var i, j, a, b, dx, dy, d;
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      if (!reduce) { a.x += a.vx; a.y += a.vy; }
      if (a.x < 0 || a.x > W) a.vx *= -1;
      if (a.y < 0 || a.y > H) a.vy *= -1;

      dx = a.x - mouse.x; dy = a.y - mouse.y;
      d = Math.sqrt(dx * dx + dy * dy);
      if (d < 140 && d > 0) {
        a.x += (dx / d) * 1.4;
        a.y += (dy / d) * 1.4;
      }
    }
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      for (j = i + 1; j < nodes.length; j++) {
        b = nodes[j];
        dx = a.x - b.x; dy = a.y - b.y;
        d = dx * dx + dy * dy;
        if (d < LINK * LINK) {
          var o = 1 - Math.sqrt(d) / LINK;
          ctx.strokeStyle = 'rgba(255,255,255,' + (o * 0.28).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      dx = a.x - mouse.x; dy = a.y - mouse.y;
      d = Math.sqrt(dx * dx + dy * dy);
      if (d < 190) {
        ctx.strokeStyle = 'rgba(255,255,255,' + ((1 - d / 190) * 0.7).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    ctx.fillStyle = '#fff';
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reduce) requestAnimationFrame(frame);
  }
  frame();
  if (reduce) { window.addEventListener('resize', frame); }
})();
