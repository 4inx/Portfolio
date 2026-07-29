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

  /* ---------- page scroll progress ---------- */
  var pBar = document.getElementById('pBar');
  if (pBar) {
    var pTick = false;
    var updateP = function () {
      var h = docEl.scrollHeight - window.innerHeight;
      pBar.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')';
      pTick = false;
    };
    window.addEventListener('scroll', function () {
      if (!pTick) { pTick = true; requestAnimationFrame(updateP); }
    }, { passive: true });
    updateP();
  }

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

  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
