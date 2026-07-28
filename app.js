(function () {
  "use strict";

  const categories = [
    {
      id: "app-web",
      index: "A",
      label: "APP / WEB",
      title: "Meno caos. Più tempo."
    },
    {
      id: "community",
      index: "B",
      label: "COMMUNITY",
      title: "Internet, con qualcuno dentro."
    },
    {
      id: "editoriale",
      index: "C",
      label: "EDITORIALE",
      title: "La politica senza il teatrino."
    },
    {
      id: "giochi",
      index: "D",
      label: "GIOCHI",
      title: "Perdere bene è quasi vincere."
    },
    {
      id: "storie",
      index: "E",
      label: "STORIE",
      title: "Il fondo di Vaekh è solo l’inizio."
    }
  ];

  const root = document.querySelector("#project-sections");
  const progress = document.querySelector("#progress");
  const menuButton = document.querySelector(".menu-button");
  const mobileNav = document.querySelector("#mobile-nav");
  const toastNode = document.querySelector("#toast");
  const backToTop = document.querySelector("#back-to-top");
  let allProjects = [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderArt(project) {
    const copy = project.publicCopy || {};
    if (copy.variant === "press") {
      return `
        <div class="project-art press-art" aria-hidden="true">
          <span>FATTI / DATE / CONSEGUENZE</span>
          <strong>PRIMA<br>IL FATTO.</strong>
          <i>FONTI, NON CURVE.</i>
        </div>
      `;
    }

    if (copy.visual) {
      return `
        <div class="project-art">
          <img src="${escapeHtml(copy.visual)}" alt="" loading="lazy">
          <span class="art-label">${escapeHtml(copy.status || project.phase)}</span>
        </div>
      `;
    }

    return `
      <div class="project-art type-art" aria-hidden="true">
        <strong>${escapeHtml(project.displayName)}</strong>
      </div>
    `;
  }

  function renderActions(project) {
    const copy = project.publicCopy || {};
    const primary = project.publicUrl && copy.cta
      ? `<a class="project-cta" href="${escapeHtml(project.publicUrl)}" target="_blank" rel="noopener">${escapeHtml(copy.cta)} <span>↗</span></a>`
      : `<span class="project-status">${escapeHtml(copy.status || project.phase)}</span>`;

    return `
      <div class="project-actions">
        ${primary}
        <button class="share-button" type="button" data-share-project="${escapeHtml(project.id)}" data-share-name="${escapeHtml(project.displayName)}">Condividi</button>
      </div>
    `;
  }

  function renderProject(project) {
    const copy = project.publicCopy || {};
    const variant = String(copy.variant || "default").replace(/[^a-z0-9-]/gi, "");
    return `
      <article class="project-card project--${escapeHtml(variant)}" id="${escapeHtml(project.id)}">
        ${renderArt(project)}
        <div class="project-copy">
          <div class="project-topline">
            <span>${escapeHtml(copy.role || "Progetto personale")}</span>
            <span>${escapeHtml(copy.status || project.phase)}</span>
          </div>
          <h3>${escapeHtml(project.displayName)}</h3>
          <p class="project-tagline">${escapeHtml(copy.tagline || "")}</p>
          <p class="project-pitch">${escapeHtml(copy.pitch || "")}</p>
          ${renderActions(project)}
        </div>
      </article>
    `;
  }

  function renderCategory(category, projects) {
    if (!projects.length) return "";
    return `
      <section class="category category--${escapeHtml(category.id)} shell" aria-labelledby="category-${escapeHtml(category.id)}">
        <header class="category-head">
          <div class="category-index">${escapeHtml(category.index)}</div>
          <div>
            <p>${escapeHtml(category.label)} · ${projects.length.toString().padStart(2, "0")}</p>
            <h2 id="category-${escapeHtml(category.id)}">${escapeHtml(category.title)}</h2>
          </div>
        </header>
        <div class="category-grid">
          ${projects.map(renderProject).join("")}
        </div>
      </section>
    `;
  }

  function render(projects) {
    allProjects = projects;
    root.innerHTML = categories.map((category) =>
      renderCategory(category, projects.filter((project) => project.publicCopy?.category === category.id))
    ).join("");
    bindShareButtons();
    revealHashProject();
  }

  function showToast(message) {
    if (!toastNode) return;
    toastNode.textContent = message;
    toastNode.classList.add("visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toastNode.classList.remove("visible"), 2200);
  }

  function projectShareUrl(projectId) {
    return `${window.location.origin}${window.location.pathname}#${projectId}`;
  }

  function bindShareButtons() {
    document.querySelectorAll("[data-share-project]").forEach((button) => {
      button.addEventListener("click", async () => {
        const url = projectShareUrl(button.dataset.shareProject);
        const name = button.dataset.shareName;
        if (navigator.share) {
          try {
            await navigator.share({
              title: `${name} — Spidah`,
              text: `Guarda ${name}, un progetto di Francesco Magistà.`,
              url
            });
            return;
          } catch (error) {
            if (error?.name === "AbortError") return;
          }
        }
        try {
          await navigator.clipboard.writeText(url);
          showToast(`Link di ${name} copiato.`);
        } catch {
          showToast(url);
        }
      });
    });
  }

  function revealHashProject() {
    const id = window.location.hash.slice(1);
    if (!id || !allProjects.some((project) => project.id === id)) return;
    const card = document.getElementById(id);
    if (!card) return;
    card.classList.add("is-targeted");
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => card.classList.remove("is-targeted"), 2400);
  }

  function updateProgress() {
    const page = document.documentElement;
    const max = page.scrollHeight - page.clientHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? page.scrollTop / max : 0})`;
    if (backToTop) backToTop.classList.toggle("visible", window.scrollY > 900);
  }

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!open));
      mobileNav.hidden = open;
    });
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.hidden = true;
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("hashchange", revealHashProject);
  if (backToTop) {
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
  document.querySelector("#year").textContent = new Date().getFullYear();
  updateProgress();

  fetch("data/projects.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Catalogo non disponibile");
      return response.json();
    })
    .then((data) => render(data.projects || []))
    .catch(() => {
      root.innerHTML = `<p class="loading shell">Il catalogo non si è caricato. Riprova tra poco.</p>`;
    });
})();
