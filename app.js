(function () {
  const app = document.getElementById("app");
  const breadcrumb = document.getElementById("breadcrumb");
  const searchInput = document.getElementById("searchInput");
  const heroViberBtn = document.getElementById("heroViberBtn");

  const contact = {
    whatsappNumber:
      window.CONTACT?.whatsappNumber ||
      window.CONTACT_INFO?.whatsappNumber ||
      "381600000000",
    viberNumber:
      window.CONTACT?.viberNumber ||
      window.CONTACT_INFO?.viberNumber ||
      "+381600000000",
  };

  let manifest = { generatedAt: null, items: {} };

  function qs(route) {
    return "#" + route;
  }

  function routeParts() {
    const hash = window.location.hash.replace(/^#\/?/, "");
    if (!hash) return [];
    return hash.split("/").filter(Boolean);
  }

  function slugify(str) {
    return str
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function cleanPhone(phone, keepPlus = false) {
    if (!phone) return "";
    return keepPlus ? phone.replace(/[^\d+]/g, "") : phone.replace(/\D/g, "");
  }

  function shortCode(str) {
    const cleaned = slugify(str || "")
      .replace(/[^a-z0-9]/g, "")
      .toUpperCase();
    return (cleaned.slice(0, 3) || "GEN").padEnd(3, "X");
  }

  function buildProductCode(categoryKey, teamName, index) {
    const categoryPart = shortCode(categoryKey);
    const teamPart = teamName ? shortCode(teamName) : "CAT";
    const numberPart = String(index + 1).padStart(3, "0");
    return `${categoryPart}-${teamPart}-${numberPart}`;
  }

  function normalizeProductCode(value) {
    return (value || "").toUpperCase().replace(/\s+/g, "").replace(/_/g, "-");
  }

  function isProductCode(value) {
    return /^[A-Z0-9]{3}-[A-Z0-9]{3}-\d{3}$/.test(value);
  }

  function getSearchCode() {
    const code = normalizeProductCode(searchInput.value.trim());
    return isProductCode(code) ? code : null;
  }

  function findProductByCode(code) {
    for (const [categoryKey, category] of Object.entries(window.CATALOG)) {
      const isLeafCategory = !category.teams || category.teams.length === 0;

      if (isLeafCategory) {
        const images = manifest.items[categoryKey] || [];
        for (let index = 0; index < images.length; index += 1) {
          const currentCode = buildProductCode(categoryKey, null, index);
          if (currentCode === code) {
            return {
              categoryKey,
              teamSlug: null,
            };
          }
        }
        continue;
      }

      for (const teamName of category.teams) {
        const key = teamManifestKey(categoryKey, teamName);
        const images = manifest.items[key] || [];
        for (let index = 0; index < images.length; index += 1) {
          const currentCode = buildProductCode(categoryKey, teamName, index);
          if (currentCode === code) {
            return {
              categoryKey,
              teamSlug: slugify(teamName),
            };
          }
        }
      }
    }

    return null;
  }

  function buildOrderMessage({ categoryLabel, teamName, src, productCode }) {
    const lines = [
      "Zdravo, zelim da porucim ovaj dres.",
      `Sifra: ${productCode}`,
      `Kategorija: ${categoryLabel}`,
    ];

    if (teamName) {
      lines.push(`Tim: ${teamName}`);
    }

    return lines.join("\n");
  }

  function getWhatsAppLink(message) {
    const number = cleanPhone(contact.whatsappNumber);
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  function getViberLink(message) {
    const number = cleanPhone(contact.viberNumber, true);
    const encoded = encodeURIComponent(message);

    if (number) {
      return `viber://chat?number=${encodeURIComponent(number)}&text=${encoded}`;
    }

    return `viber://forward?text=${encoded}`;
  }

  function orderActions(categoryLabel, teamName, src, productCode) {
    const message = buildOrderMessage({
      categoryLabel,
      teamName,
      src,
      productCode,
    });

    return `
      <div class="order-actions">
        <div class="product-code">Sifra: ${productCode}</div>
        <a class="order-btn order-wa" href="${getWhatsAppLink(message)}" target="_blank" rel="noopener">Poruci na WhatsApp</a>
        <a class="order-btn order-viber" href="${getViberLink(message)}" target="_blank" rel="noopener">Poruci na Viber</a>
      </div>
    `;
  }

  function bindHeroLinks() {
    if (!heroViberBtn) return;

    const configuredLink =
      window.CONTACT?.viberGroupLink ||
      window.CONTACT_INFO?.viberGroupLink ||
      "https://invite.viber.com/";

    heroViberBtn.href = configuredLink;
  }

  function renderBreadcrumb(parts) {
    const crumbs = [{ label: "Početna", href: qs("") }];
    if (parts[0] === "category" && parts[1]) {
      const cat = window.CATALOG[parts[1]];
      crumbs.push({
        label: cat ? cat.label : parts[1],
        href: qs(`category/${parts[1]}`),
      });
    }
    if (parts[0] === "team" && parts[1] && parts[2]) {
      const cat = window.CATALOG[parts[1]];
      const team = cat?.teams?.find((t) => slugify(t) === parts[2]);
      crumbs.push({
        label: cat ? cat.label : parts[1],
        href: qs(`category/${parts[1]}`),
      });
      crumbs.push({ label: team || parts[2], href: null });
    }

    breadcrumb.innerHTML = crumbs
      .map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        if (isLast || !crumb.href) {
          return `<span class="crumb current">${crumb.label}</span>`;
        }
        return `<a class="crumb" href="${crumb.href}">${crumb.label}</a>`;
      })
      .join("<span>/</span>");
  }

  function getTeamFolder(categoryKey, teamName) {
    return `catalog/${categoryKey}/${slugify(teamName)}`;
  }

  function teamManifestKey(categoryKey, teamName) {
    return `${categoryKey}/${slugify(teamName)}`;
  }

  function teamLogoPath(categoryKey, teamName) {
    return `images/logos/teams/${categoryKey}/${slugify(teamName)}.png`;
  }

  function renderHome(filter = "") {
    const cards = Object.entries(window.CATALOG)
      .map(([key, category]) => {
        const displayTeamCount =
          key === "world-cup-2026" ? 48 : category.teams.length;
        const teamMatch = category.teams.some((team) =>
          team.toLowerCase().includes(filter.toLowerCase()),
        );
        const categoryMatch = category.label
          .toLowerCase()
          .includes(filter.toLowerCase());
        if (filter && !teamMatch && !categoryMatch) return "";
        return `
        <a class="card card-link" href="${qs(`category/${key}`)}">
          <div class="category-head">
            ${
              category.logo
                ? `<img class="category-logo" src="${category.logo}" alt="${category.label} logo" />`
                : ""
            }
            <h2>${category.label}</h2>
          </div>
          <p>${displayTeamCount} timova</p>
          <span class="pill">Izaberi tim</span>
        </a>
      `;
      })
      .join("");

    app.innerHTML = `
      <h2 class="page-title">Kategorije</h2>
      <p class="page-text">Ovde su sve glavne sekcije. Klikni kategoriju pa tim.</p>
      <div class="grid">${
        cards || '<div class="empty">Nema rezultata za ovu pretragu.</div>'
      }</div>
    `;
  }

  function renderCategory(categoryKey, filter = "") {
    const category = window.CATALOG[categoryKey];
    if (!category) {
      app.innerHTML = '<div class="empty">Kategorija nije pronađena.</div>';
      return;
    }

    const searchCode = getSearchCode();

    if (!category.teams || category.teams.length === 0) {
      const images = manifest.items[categoryKey] || [];

      if (!images.length) {
        app.innerHTML = `
          <h2 class="page-title">${category.label}</h2>
          <div class="empty">
            Još nema slika za ovu kategoriju.<br><br>
            Ubaci slike u folder:<br>
            <strong>catalog/${categoryKey}</strong><br><br>
            Zatim pokreni:<br>
            <strong>python3 generate_manifest.py</strong>
          </div>
        `;
        return;
      }

      const gallery = images
        .map((src, index) => ({ src, index }))
        .filter(({ index }) => {
          if (!searchCode) return true;
          return buildProductCode(categoryKey, null, index) === searchCode;
        })
        .map(({ src, index }) => {
          const productCode = buildProductCode(categoryKey, null, index);
          return `
        <div class="photo-card">
          <img class="zoomable" src="${src}" alt="${category.label}" loading="lazy" />
          ${orderActions(category.label, null, src, productCode)}
        </div>
      `;
        })
        .join("");

      app.innerHTML = `
        <h2 class="page-title">${category.label}</h2>
        <p class="page-text">Ukupno modela: ${searchCode ? gallery.length : images.length}</p>
        <div class="gallery">${gallery || '<div class="empty">Nema rezultata za ovu sifru u ovoj kategoriji.</div>'}</div>
      `;

      bindLightbox();
      return;
    }

    const cards = category.teams
      .filter(
        (team) => !filter || team.toLowerCase().includes(filter.toLowerCase()),
      )
      .map((team) => {
        const count = (manifest.items[teamManifestKey(categoryKey, team)] || [])
          .length;
        const logo = teamLogoPath(categoryKey, team);
        return `
          <a class="card card-link" href="${qs(
            `team/${categoryKey}/${slugify(team)}`,
          )}">
            <div class="team-head">
              <img class="team-logo" src="${logo}" alt="${team} logo" loading="lazy" onerror="this.style.display='none'" />
              <h3>${team}</h3>
            </div>
            <p>${
              count ? `Trenutno ${count} modela` : "Klikni da otvoriš tim."
            }</p>
            <span class="pill">Otvori tim</span>
          </a>
        `;
      })
      .join("");

    app.innerHTML = `
      <h2 class="page-title">${category.label}</h2>
      <p class="page-text">Izaberi tim ili reprezentaciju.</p>
      <div class="grid">${
        cards || '<div class="empty">Nema timova za ovu pretragu.</div>'
      }</div>
    `;
  }

  function bindLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxClose = document.getElementById("lightboxClose");
    if (!lightbox || !lightboxImg || !lightboxClose) return;

    document.querySelectorAll(".zoomable").forEach((img) => {
      img.onclick = () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || "Uvećana slika";
        lightbox.classList.add("open");
      };
    });

    lightboxClose.onclick = () => {
      lightbox.classList.remove("open");
      lightboxImg.src = "";
    };

    lightbox.onclick = (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove("open");
        lightboxImg.src = "";
      }
    };
  }

  function renderTeam(categoryKey, teamSlug) {
    const category = window.CATALOG[categoryKey];
    if (!category) {
      app.innerHTML = '<div class="empty">Kategorija nije pronađena.</div>';
      return;
    }
    const teamName = category.teams.find((team) => slugify(team) === teamSlug);
    if (!teamName) {
      app.innerHTML = '<div class="empty">Tim nije pronađen.</div>';
      return;
    }

    const key = teamManifestKey(categoryKey, teamName);
    const images = manifest.items[key] || [];
    const searchCode = getSearchCode();

    if (!images.length) {
      const folderPath = getTeamFolder(categoryKey, teamName);
      app.innerHTML = `
        <h2 class="page-title">${teamName}</h2>
        <div class="empty">
          Još nema slika za ovaj tim.<br><br>
          Ubaci slike u folder:<br>
          <strong>${folderPath}</strong><br><br>
          Zatim pokreni komandu:<br>
          <strong>python3 generate_manifest.py</strong><br><br>
          Posle uradi commit i push.
        </div>
      `;
      return;
    }

    const gallery = images
      .map((src, index) => ({ src, index }))
      .filter(({ index }) => {
        if (!searchCode) return true;
        return buildProductCode(categoryKey, teamName, index) === searchCode;
      })
      .map(({ src, index }) => {
        const productCode = buildProductCode(categoryKey, teamName, index);
        return `
      <div class="photo-card">
        <img class="zoomable" src="${src}" alt="${teamName}" loading="lazy" />
        ${orderActions(category.label, teamName, src, productCode)}
      </div>
    `;
      })
      .join("");

    app.innerHTML = `
      <h2 class="page-title">${teamName}</h2>
      <p class="page-text">Ukupno modela: ${searchCode ? gallery.length : images.length}</p>
      <div class="gallery">${gallery || '<div class="empty">Nema rezultata za ovu sifru u ovom timu.</div>'}</div>
    `;

    bindLightbox();
  }

  async function loadManifest() {
    try {
      const res = await fetch(`manifest.json?v=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("manifest error");
      manifest = await res.json();
    } catch (e) {
      manifest = { generatedAt: null, items: {} };
    }
  }

  function render() {
    const parts = routeParts();
    renderBreadcrumb(parts);

    if (!parts.length) {
      renderHome(searchInput.value.trim());
      return;
    }

    if (parts[0] === "category" && parts[1]) {
      renderCategory(parts[1], searchInput.value.trim());
      return;
    }

    if (parts[0] === "team" && parts[1] && parts[2]) {
      renderTeam(parts[1], parts[2]);
      return;
    }

    app.innerHTML = '<div class="empty">Stranica nije pronađena.</div>';
  }

  searchInput.addEventListener("input", () => {
    const searchCode = getSearchCode();

    if (searchCode) {
      const target = findProductByCode(searchCode);
      if (target) {
        const targetHash = target.teamSlug
          ? qs(`team/${target.categoryKey}/${target.teamSlug}`)
          : qs(`category/${target.categoryKey}`);

        if (window.location.hash !== targetHash) {
          window.location.hash = targetHash;
          return;
        }
      }
    }

    render();
  });

  window.addEventListener("hashchange", render);

  bindHeroLinks();
  loadManifest().then(render);
})();
