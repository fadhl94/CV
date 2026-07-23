/* ==========================================================================
   PORTFOLIO — SCRIPT.JS  (vanilla JS, no dependencies)
   ========================================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init () {
    preloader();
    navScroll();
    hamburgerMenu();
    smoothAnchorScroll();
    activeNavOnScroll();
    scrollReveal();
    typewriter();
    counterAnimation();
    skillBars();
    skillRings();
    videoLightbox();
    photoLightbox();
    projectGalleries();
    filterButtons('videoFilters', '#videoGrid .video-card');
    filterButtons('photoFilters', '#masonryGrid .masonry-item');
    lazyLoadImages();
    backToTop();
    setYear();
  }

  /* Preloader ------------------------------------------------------------ */
  function preloader () {
    const pre = document.getElementById('preloader');
    if (!pre) return;
    window.addEventListener('load', () => {
      setTimeout(() => pre.classList.add('loaded'), 350);
    });
    // Fallback in case load event already fired / is slow
    setTimeout(() => pre.classList.add('loaded'), 2500);
  }

  /* Sticky nav shrink ------------------------------------------------------ */
  function navScroll () {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const toggle = () => {
      if (window.scrollY > 30) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    toggle();
    window.addEventListener('scroll', toggle, { passive: true });
  }

  /* Mobile hamburger menu --------------------------------------------------*/
  function hamburgerMenu () {
    const btn = document.getElementById('hamburger');
    const links = document.getElementById('navLinks');
    if (!btn || !links) return;

    btn.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }));
  }

  /* Smooth scroll for in-page anchors (fallback for older browsers) ------- */
  function smoothAnchorScroll () {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id = link.getAttribute('href');
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const navH = document.getElementById('navbar').offsetHeight;
        const top = target.getBoundingClientRect().top + window.pageYOffset - navH + 1;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* Active nav link highlighting ------------------------------------------ */
  function activeNavOnScroll () {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[data-nav]');
    if (!sections.length || !navLinks.length) return;

    const map = {};
    navLinks.forEach(l => { map[l.getAttribute('href').slice(1)] = l; });

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('active'));
          const link = map[entry.target.id];
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(s => obs.observe(s));
  }

  /* Scroll-triggered reveal animations -------------------------------------*/
  function scrollReveal () {
    const targets = document.querySelectorAll('.reveal, .reveal-stagger');
    if (!targets.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach(t => obs.observe(t));
  }

  /* Hero role typewriter ---------------------------------------------------*/
  function typewriter () {
    const el = document.getElementById('typewriter');
    if (!el) return;
    const roles = ['Marketing Specialist', 'IT Specialist', 'Graphic Designer', 'Photographer', 'Video Editor'];
    let roleIndex = 0, charIndex = 0, deleting = false;

    function tick () {
      const current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          return setTimeout(tick, 1400);
        }
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(tick, deleting ? 35 : 65);
    }
    tick();
  }

  /* Stat counters ------------------------------------------------------- */
  function counterAnimation () {
    const nums = document.querySelectorAll('.stat-num[data-count]');
    if (!nums.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const duration = 1400;
        const start = performance.now();
        function frame (now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(frame);
          else el.textContent = target;
        }
        requestAnimationFrame(frame);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(n => obs.observe(n));
  }

  /* Linear skill bars ------------------------------------------------------*/
  function skillBars () {
    const bars = document.querySelectorAll('.bar-fill[data-width]');
    if (!bars.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.width + '%';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(b => obs.observe(b));
  }

  /* Circular skill rings ---------------------------------------------------*/
  function skillRings () {
    const rings = document.querySelectorAll('.ring-bar[data-pct]');
    if (!rings.length) return;
    const circumference = 2 * Math.PI * 40; // r=40
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const pct = parseInt(entry.target.dataset.pct, 10) || 0;
          const offset = circumference - (pct / 100) * circumference;
          entry.target.style.strokeDasharray = circumference;
          entry.target.style.strokeDashoffset = offset;
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    rings.forEach(r => obs.observe(r));
  }

  /* Category filter buttons (video + photo) ---------------------------------*/
  function filterButtons (barId, itemSelector) {
    const bar = document.getElementById(barId);
    if (!bar) return;
    const items = document.querySelectorAll(itemSelector);

    bar.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      items.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.style.display = match ? '' : 'none';
      });
    });
  }

  /* Lazy-load images (data-src -> src) ---------------------------------- */
  function lazyLoadImages () {
    const imgs = document.querySelectorAll('img.lazy[data-src]');
    if (!imgs.length) return;

    const load = img => {
      img.src = img.dataset.src;
      img.addEventListener('load', () => img.classList.add('lazy-loaded'));
      img.removeAttribute('data-src');
    };

    if (!('IntersectionObserver' in window)) {
      imgs.forEach(load);
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          load(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '200px 0px' });
    imgs.forEach(img => obs.observe(img));
  }

  /* Shared lightbox controller ----------------------------------------------
     Handles three kinds of content: a single video, a single photo, or a
     navigable image gallery (used by IT project screenshots). ------------- */
  const lb = { images: [], index: 0, title: '', mode: 'photo' };

  function lightboxEls () {
    return {
      root: document.getElementById('lightbox'),
      content: document.getElementById('lightboxContent'),
      caption: document.getElementById('lightboxCaption'),
      prev: document.getElementById('lightboxPrev'),
      next: document.getElementById('lightboxNext')
    };
  }

  function renderLightbox () {
    const { content, caption, prev, next } = lightboxEls();
    if (lb.mode === 'video') {
      content.innerHTML = `<video src="${lb.images[0]}" controls autoplay playsinline></video>`;
      caption.textContent = lb.title;
      prev.hidden = true; next.hidden = true;
      return;
    }
    const src = lb.images[lb.index];
    const multi = lb.images.length > 1;
    content.innerHTML = `<img src="${src}" alt="${lb.title} screenshot ${lb.index + 1}">`;
    caption.textContent = multi ? `${lb.title} — ${lb.index + 1} / ${lb.images.length}` : lb.title;
    prev.hidden = !multi; next.hidden = !multi;
  }

  function openLightbox (state) {
    Object.assign(lb, state);
    renderLightbox();
    const { root } = lightboxEls();
    root.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox () {
    const { root, content } = lightboxEls();
    root.classList.remove('open');
    document.body.style.overflow = '';
    content.innerHTML = '';
  }

  function lightboxStep (dir) {
    if (lb.mode === 'video' || lb.images.length <= 1) return;
    lb.index = (lb.index + dir + lb.images.length) % lb.images.length;
    renderLightbox();
  }

  (function initLightboxControls () {
    const { root, prev: prevBtn, next: nextBtn, } = lightboxEls();
    const closeBtn = document.getElementById('lightboxClose');
    if (!root) return;
    closeBtn.addEventListener('click', closeLightbox);
    root.addEventListener('click', e => { if (e.target === root) closeLightbox(); });
    prevBtn.addEventListener('click', () => lightboxStep(-1));
    nextBtn.addEventListener('click', () => lightboxStep(1));
    document.addEventListener('keydown', e => {
      if (!root.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxStep(-1);
      if (e.key === 'ArrowRight') lightboxStep(1);
    });
  })();

  /* Video lightbox ---------------------------------------------------------*/
  function videoLightbox () {
    const cards = document.querySelectorAll('.video-card');
    if (!cards.length) return;

    const open = card => openLightbox({
      mode: 'video',
      images: [card.dataset.video],
      index: 0,
      title: (card.dataset.title || '') + (card.dataset.desc ? ' — ' + card.dataset.desc : '')
    });

    cards.forEach(card => {
      card.addEventListener('click', () => open(card));
      card.querySelector('.play-btn')?.addEventListener('click', e => {
        e.stopPropagation();
        open(card);
      });
    });
  }

  /* Photo lightbox (masonry) -----------------------------------------------*/
  function photoLightbox () {
    const items = document.querySelectorAll('.masonry-item');
    if (!items.length) return;

    const open = item => {
      const img = item.querySelector('img');
      const src = img.getAttribute('src') || img.dataset.src;
      const label = item.querySelector('.masonry-overlay span')?.textContent || '';
      openLightbox({ mode: 'photo', images: [src], index: 0, title: label });
    };

    items.forEach(item => {
      item.addEventListener('click', () => open(item));
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(item); }
      });
    });
  }

  /* IT project screenshot galleries -----------------------------------------
     Each .project-shot with a data-images JSON array gets an in-card
     carousel (arrows + dots) and opens the full gallery in the lightbox
     (with its own prev/next) when the image itself is clicked. ------------ */
  function projectGalleries () {
    const shots = document.querySelectorAll('.project-shot[data-images]');
    if (!shots.length) return;

    shots.forEach(shot => {
      let images = [];
      try { images = JSON.parse(shot.dataset.images); } catch (err) { images = []; }
      if (!images.length) return;

      const img = shot.querySelector('img');
      const prevBtn = shot.querySelector('.gallery-prev');
      const nextBtn = shot.querySelector('.gallery-next');
      const dotsWrap = shot.querySelector('.gallery-dots');
      const title = shot.dataset.title || img.alt || '';
      let current = 0;

      // Build dots (skip entirely if there's only one image)
      if (images.length > 1) {
        images.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'dot' + (i === 0 ? ' active' : '');
          dot.setAttribute('aria-label', `Show screenshot ${i + 1}`);
          dot.addEventListener('click', e => { e.stopPropagation(); show(i); });
          dotsWrap.appendChild(dot);
        });
      } else {
        prevBtn.hidden = true;
        nextBtn.hidden = true;
      }

      function show (i) {
        current = (i + images.length) % images.length;
        const nextSrc = images[current];
        if (img.classList.contains('lazy')) {
          img.classList.remove('lazy');
          img.classList.add('lazy-loaded');
        }
        img.src = nextSrc;
        img.alt = `${title} — screenshot ${current + 1}`;
        dotsWrap.querySelectorAll('.dot').forEach((d, i2) => d.classList.toggle('active', i2 === current));
      }

      prevBtn.addEventListener('click', e => { e.stopPropagation(); show(current - 1); });
      nextBtn.addEventListener('click', e => { e.stopPropagation(); show(current + 1); });

      shot.addEventListener('click', () => {
        openLightbox({ mode: 'photo', images, index: current, title });
      });
    });
  }

  /* Back to top button -------------------------------------------------- */
  function backToTop () {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* Footer year ----------------------------------------------------------- */
  function setYear () {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

})();
