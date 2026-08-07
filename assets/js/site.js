/* BINX PALM — shared behaviors
   Every feature detects its own elements, so any page can use any subset.
   Kept deliberately restrained: reveal-on-scroll, a lightbox, flip-strip
   counters, ambient video, and a page-read progress line. No interaction
   here should require a visitor to "figure out" how to navigate. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var docEl = document.documentElement;

  /* ---------- nav "Work" dropdown: quick-jump to any wing ---------- */
  document.querySelectorAll('.nav-drop').forEach(function (drop) {
    var toggle = drop.querySelector('.nav-drop-toggle');
    var menu = drop.querySelector('.nav-drop-menu');
    var label = drop.querySelector(':scope > a');
    if (!toggle || !menu) return;
    var close = function () {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    var flip = function (e) {
      e.preventDefault();
      var isOpen = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    };
    toggle.addEventListener('click', flip);
    /* the "Work" label opens the menu rather than jumping to the foyer's
       wing preview. On touch that jump was swallowing the first tap, so
       the menu only appeared if you hit the word twice. The href stays in
       the markup as the no-JS fallback. */
    if (label) label.addEventListener('click', flip);
    document.addEventListener('click', function (e) {
      if (!drop.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  });

  /* ---------- work-intro rotator: one piece per wing, crossfading in the
     gap made by the arms-out photo ---------- */
  var workRotator = document.getElementById('workRotator');
  if (workRotator && !reduced) {
    var rSlides = workRotator.querySelectorAll('.work-rotator-slide');
    var rIdx = 0;
    if (rSlides.length > 1) {
      setInterval(function () {
        rSlides[rIdx].classList.remove('in');
        rIdx = (rIdx + 1) % rSlides.length;
        rSlides[rIdx].classList.add('in');
      }, 2600);
    }
  }

  /* ---------- scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.rv').forEach(function (el) {
    if (reduced) { el.classList.add('in'); } else { io.observe(el); }
  });

  /* ---------- marquee: measured in real pixels, correct at any width ----------
     The old version used a CSS translateX(-50%) keyframe, which only loops
     seamlessly if the duplicated content happens to be wider than the
     viewport — on a wide screen with short content it silently ran out,
     leaving a visible gap of nothing at the end of each cycle. Fixed by
     measuring one copy's real pixel width, duplicating it as many times
     as needed to safely overflow the widest expected viewport, and
     animating by exactly that measured width via the Web Animations API
     — mathematically seamless regardless of screen size or content length. */
  var marquee = document.getElementById('marquee');
  var marqueeTrack = document.getElementById('marqueeTrack');
  if (marquee && marqueeTrack) {
    var setupMarquee = function () {
      var base = marqueeTrack.getAttribute('data-base');
      if (base === null) { base = marqueeTrack.innerHTML; marqueeTrack.setAttribute('data-base', base); }
      marqueeTrack.innerHTML = base;
      var oneWidth = marqueeTrack.scrollWidth;
      if (!oneWidth) return;
      var minWidth = window.innerWidth * 2 + oneWidth;
      var guard = 0;
      while (marqueeTrack.scrollWidth < minWidth && guard < 20) {
        marqueeTrack.insertAdjacentHTML('beforeend', base);
        guard++;
      }
      if (marquee._anim) marquee._anim.cancel();
      if (reduced) return;
      var pxPerSecond = 70;
      marquee._anim = marqueeTrack.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-' + oneWidth + 'px)' }],
        { duration: (oneWidth / pxPerSecond) * 1000, iterations: Infinity, easing: 'linear' }
      );
    };
    setupMarquee();
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(setupMarquee); }
    var marqueeResize;
    window.addEventListener('resize', function () {
      clearTimeout(marqueeResize);
      marqueeResize = setTimeout(setupMarquee, 250);
    });
  }

  /* ---------- flip-through strips (wings) ---------- */
  document.querySelectorAll('.strip-shell').forEach(function (shell) {
    var strip = shell.querySelector('.strip');
    var now = shell.querySelector('.strip-now');
    var total = shell.querySelector('.strip-total');
    if (!strip || !now) return;
    var leaves = strip.querySelectorAll('.leaf');
    if (total) total.textContent = String(leaves.length).padStart(2, '0');

    /* wrap the strip so hover arrows can center on the images, not the
       caption/count row below them */
    var viewport = document.createElement('div');
    viewport.className = 'strip-viewport';
    strip.parentNode.insertBefore(viewport, strip);
    viewport.appendChild(strip);

    var prevBtn = document.createElement('button');
    prevBtn.type = 'button'; prevBtn.className = 'strip-nav prev';
    prevBtn.setAttribute('aria-label', 'Scroll back'); prevBtn.textContent = '←';
    var nextBtn = document.createElement('button');
    nextBtn.type = 'button'; nextBtn.className = 'strip-nav next';
    nextBtn.setAttribute('aria-label', 'Scroll forward'); nextBtn.textContent = '→';
    viewport.appendChild(prevBtn);
    viewport.appendChild(nextBtn);

    var step = function () {
      return leaves.length > 1 ? (leaves[1].offsetLeft - leaves[0].offsetLeft) : strip.clientWidth * .8;
    };
    prevBtn.addEventListener('click', function () { strip.scrollBy({ left: -step(), behavior: 'smooth' }); });
    nextBtn.addEventListener('click', function () { strip.scrollBy({ left: step(), behavior: 'smooth' }); });

    /* hovering the strip turns the mouse wheel into horizontal scroll,
       so a plain scroll wheel (not just a trackpad) can flip through it.
       scroll-snap fights a plain scrollLeft nudge (it yanks back to the
       nearest leaf before the next tick lands), so snapping is suspended
       for the duration of the wheel gesture and restored once it settles. */
    var wheelSettle;
    viewport.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // already-horizontal gesture: let it through
      var max = strip.scrollWidth - strip.clientWidth;
      if (max <= 0) return;
      e.preventDefault();
      strip.classList.add('wheeling');
      strip.scrollLeft += e.deltaY;
      clearTimeout(wheelSettle);
      wheelSettle = setTimeout(function () { strip.classList.remove('wheeling'); }, 150);
    }, { passive: false });

    var update = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      var p = max > 0 ? strip.scrollLeft / max : 0;
      now.textContent = String(1 + Math.round(p * (leaves.length - 1))).padStart(2, '0');
      prevBtn.disabled = strip.scrollLeft <= 2;
      nextBtn.disabled = strip.scrollLeft >= max - 2;
    };
    strip.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
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

  /* ---------- tilt: every .frame and artifact leans toward the pointer ---------- */
  if (motionOK) {
    document.querySelectorAll('.frame, .frame-shell').forEach(function (el) {
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
    document.querySelectorAll('.btn-primary, .wing-next a').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * .28;
        var dy = (e.clientY - (r.top + r.height / 2)) * .28;
        el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- the work section: sticky-pinned horizontal walk ----------
     Reference pattern: pin the section to the viewport for exactly as
     much scroll distance as the row of panels needs, and translate the
     row sideways in proportion to how far through that pinned range the
     user has scrolled — release the pin once the row is fully walked.
     This is the same sticky+scrubbed-transform technique used across the
     agency/portfolio sites this design draws from. Position is *scrubbed*
     (driven directly by scroll position every frame) rather than lerped,
     because a lerp here would mean the panels visibly lag behind a pin
     that's supposed to feel exactly 1:1 with the scrollbar; a lerp is
     right for the hero parallax (a background effect) but wrong for a
     mechanism the user is supposed to feel is *directly* under their
     scroll. Falls back to a plain native horizontal scroll-snap carousel
     on touch, narrow, or reduced-motion — never scroll-jacks a finger. */
  var workOuter = document.getElementById('workOuter');
  var workTrack = document.getElementById('workTrack');
  if (workOuter && workTrack) {
    var workPanels = workTrack.querySelectorAll('.work-panel');
    var workTotalEl = document.getElementById('workTotal');
    var workNowEl = document.getElementById('workNow');
    var workBar = document.getElementById('workProgressBar');
    if (workTotalEl) workTotalEl.textContent = String(workPanels.length).padStart(2, '0');

    var workEnhanced = false, workRaf = null;
    var setWorkProgress = function (p) {
      p = Math.max(0, Math.min(1, p));
      if (workBar) workBar.style.left = (p * 100) + '%';
      if (workNowEl && workPanels.length) workNowEl.textContent = String(1 + Math.round(p * (workPanels.length - 1))).padStart(2, '0');
    };
    var workMaxShift = function () { return Math.max(0, workTrack.scrollWidth - workTrack.clientWidth); };
    var sizeWorkOuter = function () { workOuter.style.height = (window.innerHeight + workMaxShift()) + 'px'; };

    var workLoop = function () {
      var travel = workOuter.offsetHeight - window.innerHeight;
      var top = workOuter.getBoundingClientRect().top;
      var p = travel > 0 ? Math.max(0, Math.min(1, -top / travel)) : 0;
      workTrack.style.transform = 'translate3d(' + (-(p * workMaxShift())) + 'px,0,0)';
      setWorkProgress(p);
      workRaf = requestAnimationFrame(workLoop);
    };

    var applyWorkMode = function () {
      var want = window.innerWidth >= 860 && !reduced && window.matchMedia('(pointer: fine)').matches;
      if (want === workEnhanced) { if (workEnhanced) sizeWorkOuter(); return; }
      workEnhanced = want;
      if (workEnhanced) {
        workOuter.classList.add('enhanced');
        sizeWorkOuter();
        if (!workRaf) workLoop();
      } else {
        workOuter.classList.remove('enhanced');
        workOuter.style.height = '';
        workTrack.style.transform = '';
        if (workRaf) { cancelAnimationFrame(workRaf); workRaf = null; }
      }
    };
    applyWorkMode();
    window.addEventListener('resize', applyWorkMode);
    window.addEventListener('load', applyWorkMode);
    workTrack.addEventListener('scroll', function () {
      if (!workEnhanced) setWorkProgress(workMaxShift() > 0 ? workTrack.scrollLeft / workMaxShift() : 0);
    }, { passive: true });
    if (!workEnhanced) setWorkProgress(0);
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

  /* ---------- hero parallax v2 ----------
     The previous version lerped correctly but still read as clunky —
     the actual cause: .hero-wordmark/.hero-cutout carried the shared
     .rv class, which leaves `transition: transform .7s` permanently
     attached (see the .rv.in rule). Every time this loop set a new
     inline transform, the browser eased toward it over 0.7s on top of
     the lerp already happening here — two smoothing systems fighting,
     which is what "clunky" actually was. Fixed at the source: those
     two elements no longer use .rv at all (see index.html), so
     nothing but this loop ever touches their transform. Also switched
     to translate3d for a guaranteed GPU compositing layer, and a
     tighter lerp so it reads as smooth rather than sluggish. */
  var parallaxLayers = Array.prototype.slice.call(document.querySelectorAll('.hero [data-parallax]')).map(function (el) {
    return { el: el, rate: parseFloat(el.getAttribute('data-parallax')) || 0, current: 0 };
  });
  if (parallaxLayers.length && !reduced) {
    var pxRunning = false;
    var pxLoop = function () {
      var y = window.scrollY;
      var settled = true;
      parallaxLayers.forEach(function (s) {
        var target = y * s.rate;
        var diff = target - s.current;
        if (Math.abs(diff) > 0.05) { s.current += diff * 0.22; settled = false; }
        else { s.current = target; }
        s.el.style.transform = 'translate3d(-50%,' + (-s.current) + 'px,0)';
      });
      if (!settled) { requestAnimationFrame(pxLoop); } else { pxRunning = false; }
    };
    window.addEventListener('scroll', function () {
      if (!pxRunning) { pxRunning = true; requestAnimationFrame(pxLoop); }
    }, { passive: true });
    if (window.scrollY > 0) { pxRunning = true; requestAnimationFrame(pxLoop); }
  }

  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
