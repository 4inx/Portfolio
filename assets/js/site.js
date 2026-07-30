/* BINX PALM — shared behaviors
   Every feature detects its own elements, so any page can use any subset.
   Kept deliberately restrained: reveal-on-scroll, a lightbox, flip-strip
   counters, ambient video, and a page-read progress line. No interaction
   here should require a visitor to "figure out" how to navigate. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var docEl = document.documentElement;

  /* ---------- scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.rv').forEach(function (el) {
    if (reduced) { el.classList.add('in'); } else { io.observe(el); }
  });

  /* ---------- flip-through strips (wings) ---------- */
  document.querySelectorAll('.strip-shell').forEach(function (shell) {
    var strip = shell.querySelector('.strip');
    var now = shell.querySelector('.strip-now');
    var total = shell.querySelector('.strip-total');
    if (!strip || !now) return;
    var leaves = strip.querySelectorAll('.leaf');
    if (total) total.textContent = String(leaves.length).padStart(2, '0');
    var update = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      var p = max > 0 ? strip.scrollLeft / max : 0;
      now.textContent = String(1 + Math.round(p * (leaves.length - 1))).padStart(2, '0');
    };
    strip.addEventListener('scroll', update, { passive: true });
    update();
  });

  /* ---------- page scroll progress + the rail companion ----------
     One reveal, two renderings: a flat top line (always present) and,
     on wide-enough screens, a small dot travelling a rail down the
     margin — a quiet nod to a scroll-companion the site's author
     admired elsewhere, redrawn in this site's own hand. Built here
     rather than in markup so every page gets it for free. */
  var pBar = document.getElementById('pBar');
  var rail = document.createElement('div');
  rail.className = 'rail';
  rail.setAttribute('aria-hidden', 'true');
  var railDot = document.createElement('i');
  rail.appendChild(railDot);
  document.body.appendChild(rail);

  if (pBar || rail) {
    var pTick = false;
    var updateP = function () {
      var h = docEl.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      if (pBar) pBar.style.transform = 'scaleX(' + p + ')';
      var railH = rail.clientHeight;
      if (railH) railDot.style.top = (p * railH) + 'px';
      pTick = false;
    };
    window.addEventListener('scroll', function () {
      if (!pTick) { pTick = true; requestAnimationFrame(updateP); }
    }, { passive: true });
    window.addEventListener('resize', updateP);
    updateP();
  }

  /* ---------- grain: one quiet texture layer, injected once ---------- */
  var grain = document.createElement('div');
  grain.className = 'grain';
  grain.setAttribute('aria-hidden', 'true');
  document.body.appendChild(grain);

  /* ---------- lightbox (any page with .frame[data-full]) ---------- */
  var frames = Array.prototype.slice.call(document.querySelectorAll('.frame[data-full]'));
  if (frames.length && window.HTMLDialogElement) {
    var lb = document.createElement('dialog');
    lb.className = 'lightbox';
    lb.setAttribute('aria-label', 'Artwork viewer');
    lb.innerHTML =
      '<div class="lb-stage">' +
      '  <img id="lbImg" alt="">' +
      '  <div class="lb-bar"><span class="lb-cap" id="lbCap"></span><span class="lb-count" id="lbCount"></span></div>' +
      '</div>' +
      '<button class="lb-btn prev" id="lbPrev" aria-label="Previous piece">←</button>' +
      '<button class="lb-btn next" id="lbNext" aria-label="Next piece">→</button>' +
      '<button class="lb-close" id="lbClose" aria-label="Close viewer">✕</button>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('#lbImg');
    var lbCap = lb.querySelector('#lbCap');
    var lbCount = lb.querySelector('#lbCount');
    var group = [], idx = 0;

    var show = function (i) {
      idx = (i + group.length) % group.length;
      var f = group[idx];
      lbImg.src = f.getAttribute('data-full');
      lbImg.alt = f.getAttribute('data-cap') || '';
      lbCap.textContent = f.getAttribute('data-cap') || '';
      lbCount.textContent = group.length > 1
        ? String(idx + 1).padStart(2, '0') + ' / ' + String(group.length).padStart(2, '0') : '';
      var multi = group.length > 1 ? '' : 'none';
      lb.querySelector('#lbPrev').style.display = multi;
      lb.querySelector('#lbNext').style.display = multi;
    };
    frames.forEach(function (f) {
      f.addEventListener('click', function () {
        var g = f.closest('[data-gallery]');
        group = g ? Array.prototype.slice.call(g.querySelectorAll('.frame[data-full]')) : [f];
        show(group.indexOf(f));
        lb.showModal();
      });
    });
    lb.querySelector('#lbPrev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('#lbNext').addEventListener('click', function () { show(idx + 1); });
    lb.querySelector('#lbClose').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
    });
    lb.addEventListener('close', function () { lbImg.src = ''; });
  }

  /* ---------- ambient bumper videos: play only while visible ---------- */
  var loops = document.querySelectorAll('video[data-ambient]');
  if (loops.length) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { v.play().catch(function () {}); }
        else { v.pause(); }
      });
    }, { threshold: 0.35 });
    loops.forEach(function (v) { vio.observe(v); });
  }

  /* ==========================================================
     MOTION — cursor, tilt, magnetic pull, scroll rotation, counters,
     hero parallax. Every effect here only ADDS movement on top of
     content that is already visible by normal means; none of them
     is allowed to be the reason something can't be seen. Skipped
     entirely for touch pointers and reduced-motion. */
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var motionOK = finePointer && !reduced;

  /* ---------- cursor: an ember ring, morphing over artifacts ---------- */
  if (motionOK) {
    docEl.classList.add('has-cursor');
    var cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.innerHTML = '<span class="cta"></span>';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);
    var cta = cursor.querySelector('.cta');
    var cx = -100, cy = -100, tx = -100, ty = -100, shown = false;
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; cursor.classList.add('on'); cx = tx; cy = ty; }
    }, { passive: true });
    (function cLoop() {
      cx += (tx - cx) * .25; cy += (ty - cy) * .25;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(cLoop);
    })();
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest('[data-cursor]');
      if (t) {
        cursor.classList.add('big');
        cta.textContent = t.getAttribute('data-cursor') === 'enter' ? 'ENTER' : 'VIEW';
      } else {
        cursor.classList.remove('big');
      }
    });
    document.addEventListener('mouseleave', function () { cursor.classList.remove('on'); shown = false; });
  }

  /* ---------- tilt: every .frame and reveal artifact leans toward the pointer ---------- */
  if (motionOK) {
    document.querySelectorAll('.frame, .reveal-figure .frame-shell').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5;
        var py = (e.clientY - r.top) / r.height - .5;
        el.style.transform = 'perspective(900px) rotateX(' + (py * -10) + 'deg) rotateY(' + (px * 10) + 'deg)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
      });
    });
  }

  /* ---------- magnetic pull: the CTA and next-wing links lean in ---------- */
  if (motionOK) {
    document.querySelectorAll('.btn-primary, .hero-scroll, .wing-next a').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * .28;
        var dy = (e.clientY - (r.top + r.height / 2)) * .28;
        el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- scroll-linked rotation: reveal figures turn as they pass ---------- */
  var revealFigures = document.querySelectorAll('.reveal-figure .frame-shell');
  if (revealFigures.length && !reduced) {
    var rotTick = false;
    var updateRot = function () {
      var vh = window.innerHeight;
      revealFigures.forEach(function (el) {
        var section = el.closest('.reveal-section') || el;
        var r = section.getBoundingClientRect();
        var center = r.top + r.height / 2;
        var p = Math.max(-1, Math.min(1, (center - vh / 2) / (vh / 2)));
        el.style.setProperty('--scrollY', (p * -6) + 'deg');
      });
      rotTick = false;
    };
    /* only apply the ambient scroll rotation when the pointer isn't actively tilting */
    var ambientCSS = document.createElement('style');
    ambientCSS.textContent = '.reveal-figure .frame-shell:not(:hover) { transform: perspective(900px) rotateY(var(--scrollY, 0deg)) !important; }';
    document.head.appendChild(ambientCSS);
    window.addEventListener('scroll', function () {
      if (!rotTick) { rotTick = true; requestAnimationFrame(updateRot); }
    }, { passive: true });
    updateRot();
  }

  /* ---------- count-up: piece totals tick up when revealed ---------- */
  var counts = document.querySelectorAll('[data-count]');
  if (counts.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var b = el.querySelector('b');
        if (!b) return;
        if (reduced) { b.textContent = target; return; }
        var start = null, dur = 900;
        var step = function (ts) {
          if (start === null) start = ts;
          var p = Math.min(1, (ts - start) / dur);
          b.textContent = Math.round(p * target);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counts.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- hero parallax: the photo drifts slower than the scroll ---------- */
  var heroPhoto = document.querySelector('.hero-photo img');
  if (heroPhoto && !reduced) {
    var hpTick = false;
    var updateHP = function () {
      var y = Math.min(window.scrollY, window.innerHeight);
      heroPhoto.style.transform = 'translateY(' + (y * .18) + 'px) scale(1.08)';
      hpTick = false;
    };
    window.addEventListener('scroll', function () {
      if (!hpTick) { hpTick = true; requestAnimationFrame(updateHP); }
    }, { passive: true });
    updateHP();
  }

  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
