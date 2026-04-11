
(function () {
  const app = document.getElementById('app');
  const breadcrumb = document.getElementById('breadcrumb');
  const searchInput = document.getElementById('searchInput');

  function repoInfo() {
    const host = window.location.hostname;
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const owner = host.endsWith('github.io') ? host.split('.')[0] : '';
    let repo = owner && pathParts[0] ? pathParts[0] : (owner ? owner + '.github.io' : '');
    if (!repo && pathParts[0]) repo = pathParts[0];
    return {
      owner,
      repo,
      branch: 'main'
    };
  }

  function prettifyFileName(name) {
    return name
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function qs(route) {
    return '#' + route;
  }

  function routeParts() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (!hash) return [];
    return hash.split('/').filter(Boolean);
  }

  function renderBreadcrumb(parts) {
    const crumbs = [{ label: 'Početna', href: qs('') }];
    if (parts[0] === 'category' && parts[1]) {
      const cat = window.CATALOG[parts[1]];
      crumbs.push({ label: cat ? cat.label : parts[1], href: qs(`category/${parts[1]}`) });
    }
    if (parts[0] === 'team' && parts[1] && parts[2]) {
      const cat = window.CATALOG[parts[1]];
      const team = cat?.teams?.find(t => slugify(t) === parts[2]);
      crumbs.push({ label: cat ? cat.label : parts[1], href: qs(`category/${parts[1]}`) });
      crumbs.push({ label: team || parts[2], href: null });
    }

    breadcrumb.innerHTML = crumbs.map((crumb, i) => {
      const isLast = i === crumbs.length - 1;
      if (isLast || !crumb.href) {
        return `<span class="crumb current">${crumb.label}</span>`;
      }
      return `<a class="crumb" href="${crumb.href}">${crumb.label}</a>`;
    }).join('<span>/</span>');
  }

  function slugify(str) {
    return str.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  function getTeamFolder(categoryKey, teamName) {
    return `catalog/${categoryKey}/${slugify(teamName)}`;
  }

  async function fetchFolderImages(categoryKey, teamName) {
    const { owner, repo, branch } = repoInfo();
    if (!owner || !repo) return { ok: false, reason: 'missing-repo' };
    const path = getTeamFolder(categoryKey, teamName);
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    try {
      const res = await fetch(url);
      if (!res.ok) return { ok: false, reason: 'not-found' };
      const items = await res.json();
      const images = (items || []).filter(item => /\.(jpg|jpeg|png|webp|gif)$/i.test(item.name));
      return { ok: true, images };
    } catch (e) {
      return { ok: false, reason: 'fetch-error' };
    }
  }

  function renderHome(filter = '') {
    const cards = Object.entries(window.CATALOG)
      .map(([key, category]) => {
        const teamMatch = category.teams.some(team => team.toLowerCase().includes(filter.toLowerCase()));
        const categoryMatch = category.label.toLowerCase().includes(filter.toLowerCase());
        if (filter && !teamMatch && !categoryMatch) return '';
        return `
          <a class="card card-link" href="${qs(`category/${key}`)}">
            <h2>${category.label}</h2>
            <p>${category.teams.length} podsekcija / timova</p>
            <span class="pill">Otvori kategoriju</span>
          </a>
        `;
      }).join('');

    app.innerHTML = `
      <h2 class="page-title">Kategorije</h2>
      <p class="page-text">Ovde su sve glavne sekcije. Klikni kategoriju pa tim.</p>
      <div class="grid">${cards || '<div class="empty">Nema rezultata za ovu pretragu.</div>'}</div>
    `;
  }

  function renderCategory(categoryKey, filter = '') {
    const category = window.CATALOG[categoryKey];
    if (!category) {
      app.innerHTML = '<div class="empty">Kategorija nije pronađena.</div>';
      return;
    }
    const cards = category.teams
      .filter(team => !filter || team.toLowerCase().includes(filter.toLowerCase()))
      .map(team => `
        <a class="card card-link" href="${qs(`team/${categoryKey}/${slugify(team)}`)}">
          <h3>${team}</h3>
          <p>Ovde će se prikazati svi dresovi koje ubaciš u folder ovog tima.</p>
          <span class="pill">Otvori tim</span>
        </a>
      `).join('');

    app.innerHTML = `
      <h2 class="page-title">${category.label}</h2>
      <p class="page-text">Izaberi tim ili reprezentaciju.</p>
      <div class="grid">${cards || '<div class="empty">Nema timova za ovu pretragu.</div>'}</div>
    `;
  }

  async function renderTeam(categoryKey, teamSlug) {
    const category = window.CATALOG[categoryKey];
    if (!category) {
      app.innerHTML = '<div class="empty">Kategorija nije pronađena.</div>';
      return;
    }
    const teamName = category.teams.find(team => slugify(team) === teamSlug);
    if (!teamName) {
      app.innerHTML = '<div class="empty">Tim nije pronađen.</div>';
      return;
    }

    app.innerHTML = `
      <h2 class="page-title">${teamName}</h2>
      <p class="page-text">Učitavam slike iz foldera za ovaj tim...</p>
    `;

    const result = await fetchFolderImages(categoryKey, teamName);

    if (!result.ok) {
      const folderPath = getTeamFolder(categoryKey, teamName);
      app.innerHTML = `
        <h2 class="page-title">${teamName}</h2>
        <div class="empty">
          Još nema slika u ovom folderu ili repo nije pravilno podešen.<br><br>
          Ubaci slike u folder:<br>
          <strong>${folderPath}</strong><br><br>
          Posle commit/publish osveži stranicu.
        </div>
      `;
      return;
    }

    if (!result.images.length) {
      const folderPath = getTeamFolder(categoryKey, teamName);
      app.innerHTML = `
        <h2 class="page-title">${teamName}</h2>
        <div class="empty">
          Folder postoji, ali još nema slika.<br><br>
          Ubaci .jpg, .jpeg, .png ili .webp fajlove u:<br>
          <strong>${folderPath}</strong>
        </div>
      `;
      return;
    }

    const gallery = result.images.map(image => `
      <div class="photo-card">
        <img src="${image.download_url}" alt="${teamName}" loading="lazy" />
        <div class="caption">${prettifyFileName(image.name)}</div>
      </div>
    `).join('');

    app.innerHTML = `
      <h2 class="page-title">${teamName}</h2>
      <p class="page-text">Ukupno modela u folderu: ${result.images.length}</p>
      <div class="gallery">${gallery}</div>
    `;
  }

  async function render() {
    const parts = routeParts();
    renderBreadcrumb(parts);

    if (!parts.length) {
      renderHome(searchInput.value.trim());
      return;
    }

    if (parts[0] === 'category' && parts[1]) {
      renderCategory(parts[1], searchInput.value.trim());
      return;
    }

    if (parts[0] === 'team' && parts[1] && parts[2]) {
      await renderTeam(parts[1], parts[2]);
      return;
    }

    app.innerHTML = '<div class="empty">Stranica nije pronađena.</div>';
  }

  searchInput.addEventListener('input', () => {
    const parts = routeParts();
    if (!parts.length || parts[0] === 'category') render();
  });

  window.addEventListener('hashchange', render);
  render();
})();
