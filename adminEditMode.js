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

        removeMediaOverlays(); // don't save overlay buttons into the HTML
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
        alert('Saved! Changes will appear on the live site shortly.');
        exitEditMode(false);
      } catch (err) {
        alert('Error: ' + (err.message || 'Save failed'));
        buildMediaOverlays();
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Save to GitHub';
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
