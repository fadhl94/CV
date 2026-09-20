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
     adminEditMode();
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
     /* Admin edit mode (GitHub-backed) -----------------------------------------*/
  function adminEditMode () {
    const GH_OWNER = 'fadhl94';
    const GH_REPO = 'CV';
    const GH_BRANCH = 'main';
    const GH_PATH = 'index.html'; // عدّل لو الملف بمسار مختلف

    const toggleBtn = document.getElementById('adminToggleBtn');
    const overlay = document.getElementById('adminModalOverlay');
    const tokenInput = document.getElementById('adminTokenInput');
    const loginBtn = document.getElementById('adminLoginBtn');
    const closeModalBtn = document.getElementById('adminCloseModalBtn');
    const status = document.getElementById('adminStatus');
    const toolbar = document.getElementById('adminToolbar');
    const saveBtn = document.getElementById('adminSaveBtn');
    const cancelBtn = document.getElementById('adminCancelBtn');
    const mediaBtn = document.getElementById('adminMediaBtn');
    if (!toggleBtn) return;

    let token = sessionStorage.getItem('gh_admin_token') || '';

    const AUTO_EDIT_SELECTOR = [
      'main h1', 'main h2', 'main h3', 'main h4',
      'main p', 'main .eyebrow',
      '.contact-list strong', '.contact-list span',
      '.about-info-list strong', '.about-info-list span',
      '.hero-info-card strong', '.hero-info-card span',
      '.tech-tags span', '.skill-tags span',
      '.ring-label', '.bar-skill-top span:first-child'
    ].join(',');

    function ghHeaders (extra) {
      return Object.assign({ Authorization: `token ${token}`, Accept: 'application/vnd.github+json' }, extra || {});
    }

    function utf8ToBase64 (str) { return btoa(unescape(encodeURIComponent(str))); }

    function setStatus (msg, type) {
      status.textContent = msg;
      status.className = 'admin-status' + (type ? ' ' + type : '');
    }

    async function verifyToken (tok) {
      const res = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}`, {
        headers: { Authorization: `token ${tok}`, Accept: 'application/vnd.github+json' }
      });
      if (!res.ok) throw new Error('Invalid token or no access to repo');
      const data = await res.json();
      if (!data.permissions || !data.permissions.push) throw new Error('Token has no write access');
      return true;
    }

    function enterEditMode () {
      document.body.classList.add('admin-mode');
      toolbar.classList.add('open');
      document.querySelectorAll(AUTO_EDIT_SELECTOR).forEach(el => {
        if (el.closest('.btn, .filter-btn, .gallery-arrow, .play-btn, #adminToolbar')) return;
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('data-editable', '');
      });
      buildMediaOverlays();
    }

    function exitEditMode (discard) {
      document.body.classList.remove('admin-mode');
      toolbar.classList.remove('open');
      document.querySelectorAll('[data-editable]').forEach(el => {
        el.removeAttribute('contenteditable');
        el.removeAttribute('data-editable');
      });
      removeMediaOverlays();
      if (discard) location.reload();
    }

    toggleBtn.addEventListener('click', () => {
      if (document.body.classList.contains('admin-mode')) return;
      overlay.classList.add('open');
      tokenInput.focus();
    });
    closeModalBtn.addEventListener('click', () => overlay.classList.remove('open'));
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });

    loginBtn.addEventListener('click', async () => {
      const tok = tokenInput.value.trim();
      if (!tok) { setStatus('Please enter a token.', 'error'); return; }
      setStatus('Verifying...', '');
      try {
        await verifyToken(tok);
        token = tok;
        sessionStorage.setItem('gh_admin_token', token);
        setStatus('Access granted.', 'success');
        setTimeout(() => {
          overlay.classList.remove('open');
          tokenInput.value = '';
          enterEditMode();
        }, 400);
      } catch (err) { setStatus(err.message || 'Login failed.', 'error'); }
    });

    cancelBtn.addEventListener('click', () => {
      if (confirm('Discard changes and exit edit mode?')) exitEditMode(true);
    });

        saveBtn.addEventListener('click', async () => {
      if (!token) { setStatus('Session expired, log in again.', 'error'); return; }
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      try {
        const getRes = await fetch(
          `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_PATH}?ref=${GH_BRANCH}`,
          { headers: ghHeaders() }
        );
        if (!getRes.ok) throw new Error('Could not read current file');
        const fileData = await getRes.json();

        removeMediaOverlays();
        const clone = document.documentElement.cloneNode(true);
        clone.querySelectorAll('[data-editable]').forEach(el => {
          el.removeAttribute('contenteditable');
          el.removeAttribute('data-editable');
        });
        clone.classList.remove('admin-mode');
        const newHtml = '<!DOCTYPE html>\n' + clone.outerHTML;

        const putRes = await fetch(
          `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_PATH}`,
          {
            method: 'PUT',
            headers: ghHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
              message: 'Content update via admin panel',
              content: utf8ToBase64(newHtml),
              sha: fileData.sha,
              branch: GH_BRANCH
            })
          }
        );
        if (!putRes.ok) {
          const err = await putRes.json().catch(() => ({}));
          throw new Error(err.message || 'Save failed');
        }
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Save to GitHub';
        setStatus('Saved! Changes will appear on the live site shortly.', 'success');
        setTimeout(() => exitEditMode(false), 1200); // مهلة بسيطة عشان تشوف رسالة النجاح قبل ما ترجع الصفحة
      } catch (err) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Save to GitHub';
        setStatus('Error: ' + (err.message || 'Save failed'), 'error');
        buildMediaOverlays();
      }
    });

    /* ---------------- Media Manager ---------------- */

    function getPathFromSrc (src) {
      // strip domain + leading slash + any #t=.. fragment
      try {
        const url = new URL(src, location.href);
        let p = url.pathname.replace(/^\/+/, '');
        // if site is served from a repo subpath on GitHub Pages, strip it
        const repoPrefix = `${GH_REPO}/`;
        if (p.startsWith(repoPrefix)) p = p.slice(repoPrefix.length);
        return p;
      } catch (e) { return src.split('#')[0].replace(/^\/+/, ''); }
    }

    function collectMediaElements () {
      const imgs = Array.from(document.querySelectorAll('main img[src], main img[data-src]'))
        .filter(img => !img.closest('#adminToolbar'));
      const sources = Array.from(document.querySelectorAll('main video source[src]'));
      return { imgs, sources };
    }

    function buildMediaOverlays () {
      removeMediaOverlays();
      const { imgs, sources } = collectMediaElements();

      imgs.forEach(img => {
        const wrap = img.parentElement;
        if (!wrap) return;
        wrap.classList.add('media-overlay-host');
        const bar = document.createElement('div');
        bar.className = 'media-edit-bar';
        bar.innerHTML = `
          <button type="button" class="media-btn replace-btn" title="Replace"><i class="fa-solid fa-arrows-rotate"></i></button>
          <button type="button" class="media-btn delete-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
        `;
        wrap.appendChild(bar);
        bar.querySelector('.replace-btn').addEventListener('click', e => { e.stopPropagation(); replaceMedia(img); });
        bar.querySelector('.delete-btn').addEventListener('click', e => { e.stopPropagation(); deleteMedia(img, wrap); });
      });

      sources.forEach(source => {
        const videoEl = source.closest('video');
        const wrap = videoEl ? videoEl.parentElement : null;
        if (!wrap) return;
        wrap.classList.add('media-overlay-host');
        const bar = document.createElement('div');
        bar.className = 'media-edit-bar';
        bar.innerHTML = `
          <button type="button" class="media-btn replace-btn" title="Replace"><i class="fa-solid fa-arrows-rotate"></i></button>
          <button type="button" class="media-btn delete-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
        `;
        wrap.appendChild(bar);
        bar.querySelector('.replace-btn').addEventListener('click', e => { e.stopPropagation(); replaceMedia(source, true); });
        bar.querySelector('.delete-btn').addEventListener('click', e => { e.stopPropagation(); deleteMedia(source, wrap.closest('article, figure') || wrap, true); });
      });
    }

    function removeMediaOverlays () {
      document.querySelectorAll('.media-edit-bar').forEach(b => b.remove());
      document.querySelectorAll('.media-overlay-host').forEach(el => el.classList.remove('media-overlay-host'));
    }

    function fileToBase64 (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    async function uploadFile (path, base64Content, message) {
      let sha;
      try {
        const getRes = await fetch(
          `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${path}?ref=${GH_BRANCH}`,
          { headers: ghHeaders() }
        );
        if (getRes.ok) { const d = await getRes.json(); sha = d.sha; }
      } catch (e) { /* file doesn't exist yet, that's fine */ }

      const body = { message, content: base64Content, branch: GH_BRANCH };
      if (sha) body.sha = sha;

      const putRes = await fetch(
        `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${path}`,
        { method: 'PUT', headers: ghHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(body) }
      );
      if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({}));
        throw new Error(err.message || 'Upload failed');
      }
      return putRes.json();
    }

    async function deleteFile (path, message) {
      const getRes = await fetch(
        `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${path}?ref=${GH_BRANCH}`,
        { headers: ghHeaders() }
      );
      if (!getRes.ok) throw new Error('File not found on GitHub');
      const d = await getRes.json();
      const delRes = await fetch(
        `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${path}`,
        {
          method: 'DELETE',
          headers: ghHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ message, sha: d.sha, branch: GH_BRANCH })
        }
      );
      if (!delRes.ok) {
        const err = await delRes.json().catch(() => ({}));
        throw new Error(err.message || 'Delete failed');
      }
    }

    function replaceMedia (el, isVideoSource) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = isVideoSource ? 'video/*' : 'image/*';
      input.addEventListener('change', async () => {
        const file = input.files[0];
        if (!file) return;
        const currentSrc = el.getAttribute('src') || el.dataset.src;
        const path = getPathFromSrc(currentSrc);
        try {
          const base64 = await fileToBase64(file);
          await uploadFile(path, base64, `Replace media: ${path}`);
          const bust = `${currentSrc.split('#')[0]}?v=${Date.now()}`;
          if (el.tagName === 'IMG') el.src = bust; else { el.src = bust; el.closest('video').load(); }
          alert('File replaced on GitHub. It may take a minute to update on the live site.');
        } catch (err) { alert('Error: ' + err.message); }
      });
      input.click();
    }

    function deleteMedia (el, containerToRemove, isVideoSource) {
      const currentSrc = el.getAttribute('src') || el.dataset.src;
      const path = getPathFromSrc(currentSrc);
      if (!confirm(`Delete "${path}" from GitHub permanently?`)) return;
      deleteFile(path, `Delete media: ${path}`)
        .then(() => {
          if (containerToRemove && containerToRemove.parentElement) containerToRemove.remove();
          else if (el.parentElement) el.parentElement.remove();
          alert('File deleted. Remember to click "Save to GitHub" to also update the page layout.');
        })
        .catch(err => alert('Error: ' + err.message));
    }

    if (mediaBtn) {
      mediaBtn.addEventListener('click', () => {
        const choice = prompt('Add new: type "photo" for a photography image, or "video" for a portfolio video.');
        if (choice === 'photo') addNewPhoto();
        else if (choice === 'video') addNewVideo();
      });
    }

    function addNewPhoto () {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.addEventListener('change', async () => {
        const file = input.files[0];
        if (!file) return;
        const category = (prompt('Category (portrait / product / landscape):', 'portrait') || 'portrait').trim();
        const filename = `images/photo-${category}-${Date.now()}.jpg`;
        try {
          const base64 = await fileToBase64(file);
          await uploadFile(filename, base64, `Add new photo: ${filename}`);
          const grid = document.getElementById('masonryGrid');
          const fig = document.createElement('figure');
          fig.className = 'masonry-item';
          fig.dataset.category = category;
          fig.tabIndex = 0;
          fig.setAttribute('role', 'button');
          fig.innerHTML = `
            <img src="${filename}" alt="${category} photo">
            <figcaption class="masonry-overlay"><span data-editable contenteditable="true">${category}</span></figcaption>
          `;
          grid.appendChild(fig);
          buildMediaOverlays();
          alert('Photo added. Click "Save to GitHub" to persist the new layout.');
        } catch (err) { alert('Error: ' + err.message); }
      });
      input.click();
    }

    function addNewVideo () {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      input.addEventListener('change', async () => {
        const file = input.files[0];
        if (!file) return;
        const category = (prompt('Category (Event / Branding / Product):', 'Branding') || 'Branding').trim();
        const title = prompt('Video title:', 'New project video') || 'New project video';
        const filename = `videos/project-${Date.now()}.mp4`;
        try {
          const base64 = await fileToBase64(file);
          await uploadFile(filename, base64, `Add new video: ${filename}`);
          const grid = document.getElementById('videoGrid');
          const art = document.createElement('article');
          art.className = 'video-card glass';
          art.dataset.category = category;
          art.dataset.video = filename;
          art.innerHTML = `
            <div class="video-thumb">
              <span class="video-cat">${category}</span>
              <video muted loop playsinline preload="metadata">
                <source src="${filename}" type="video/mp4">
              </video>
              <button class="play-btn" aria-label="Play video"><i class="fa-solid fa-play"></i></button>
            </div>
            <div class="video-info">
              <h3 data-editable contenteditable="true">${title}</h3>
            </div>
          `;
          grid.appendChild(art);
          buildMediaOverlays();
          alert('Video added. Click "Save to GitHub" to persist the new layout.');
        } catch (err) { alert('Error: ' + err.message); }
      });
      input.click();
    }
  }

})();
