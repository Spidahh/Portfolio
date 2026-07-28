(function () {
  "use strict";

  const categoryLabels = {
    apps: "App & siti",
    games: "Giochi",
    stories: "Storie"
  };

  const root = document.querySelector("#project-grid");
  const progress = document.querySelector("#progress");
  const menuButton = document.querySelector(".menu-button");
  const mobileNav = document.querySelector("#mobile-nav");
  const toastNode = document.querySelector("#toast");
  const backToTop = document.querySelector("#back-to-top");
  const dialog = document.querySelector("#project-dialog");
  const dialogContent = document.querySelector("#dialog-content");
  const dialogClose = document.querySelector(".dialog-close");
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  let allProjects = [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function safeClass(value, fallback = "default") {
    const safe = String(value || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
    return safe || fallback;
  }

  function safeAccent(value) {
    return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? value : "#c8ff3d";
  }

  function renderArt(project, context = "card") {
    const copy = project.publicCopy || {};
    const status = copy.status || project.phase;

    if (copy.variant === "press") {
      return `
        <div class="project-art press-art" aria-hidden="true">
          <span>QUELLO CHE DICONO</span>
          <strong>FATTI<br>ALLA<br>MANO.</strong>
          <i>QUELLO CHE SUCCEDE</i>
        </div>
      `;
    }

    if (!copy.visual) {
      return `
        <div class="project-art type-art" aria-hidden="true">
          <strong>${escapeHtml(project.displayName)}</strong>
        </div>
      `;
    }

    return `
      <div class="project-art">
        <img
          src="${escapeHtml(copy.visual)}"
          alt="${context === "dialog" ? `Anteprima di ${escapeHtml(project.displayName)}` : ""}"
          loading="${context === "dialog" ? "eager" : "lazy"}">
        <span class="art-label">${escapeHtml(status)}</span>
      </div>
    `;
  }

  function renderCardLinks(project) {
    const copy = project.publicCopy || {};
    const links = [
      `<button class="project-more" type="button" data-open-project="${escapeHtml(project.id)}">SCOPRI <span>→</span></button>`
    ];

    if (project.publicUrl) {
      links.push(`<a class="project-link project-link--live" href="${escapeHtml(project.publicUrl)}" target="_blank" rel="noopener">${escapeHtml(copy.cta || "APRI")} <span>↗</span></a>`);
    } else if (project.repositoryPublic && project.repositoryUrl) {
      links.push(`<a class="project-link" href="${escapeHtml(project.repositoryUrl)}" target="_blank" rel="noopener">GITHUB <span>↗</span></a>`);
    }

    return links.join("");
  }

  function renderProject(project) {
    const copy = project.publicCopy || {};
    const variant = safeClass(copy.variant);
    const layout = safeClass(copy.layout, "standard");
    const category = safeClass(copy.category, "apps");

    return `
      <article
        class="project-card project--${variant} project--${layout}"
        id="${escapeHtml(project.id)}"
        data-category="${escapeHtml(category)}"
        style="--project-accent:${safeAccent(project.accent)}">
        <button class="project-visual-button" type="button" data-open-project="${escapeHtml(project.id)}" aria-label="Scopri ${escapeHtml(project.displayName)}">
          ${renderArt(project)}
        </button>
        <div class="project-copy">
          <div class="project-topline">
            <span>${escapeHtml(copy.kind || categoryLabels[category] || "Progetto")}</span>
            <span>${escapeHtml(copy.status || project.phase)}</span>
          </div>
          <h3>${escapeHtml(project.displayName)}</h3>
          <p class="project-tagline">${escapeHtml(copy.tagline || "")}</p>
          <p class="project-pitch">${escapeHtml(copy.pitch || "")}</p>
          <div class="project-actions">${renderCardLinks(project)}</div>
        </div>
      </article>
    `;
  }

  function render(projects) {
    allProjects = projects;
    root.innerHTML = projects.map(renderProject).join("");
    bindProjectButtons();
    revealHashProject();
  }

  function renderDialogActions(project) {
    const copy = project.publicCopy || {};
    const actions = [];

    if (project.publicUrl) {
      actions.push(`<a class="dialog-action dialog-action--primary" href="${escapeHtml(project.publicUrl)}" target="_blank" rel="noopener">${escapeHtml(copy.cta || "Apri il progetto")} <span>↗</span></a>`);
    }

    if (project.repositoryPublic && project.repositoryUrl) {
      actions.push(`<a class="dialog-action" href="${escapeHtml(project.repositoryUrl)}" target="_blank" rel="noopener">Vedi il codice <span>↗</span></a>`);
    }

    actions.push(`<button class="dialog-action" type="button" data-share-project="${escapeHtml(project.id)}" data-share-name="${escapeHtml(project.displayName)}">Condividi <span>↗</span></button>`);
    return actions.join("");
  }

  function openProject(projectId, updateHash = true) {
    const project = allProjects.find((item) => item.id === projectId);
    if (!project || !dialog || !dialogContent) return;

    const copy = project.publicCopy || {};
    const details = Array.isArray(copy.details) ? copy.details : [];
    dialog.style.setProperty("--project-accent", safeAccent(project.accent));
    dialog.dataset.variant = safeClass(copy.variant);
    dialogContent.innerHTML = `
      <div class="dialog-layout">
        <div class="dialog-art">${renderArt(project, "dialog")}</div>
        <div class="dialog-copy">
          <div class="dialog-meta">
            <span>${escapeHtml(categoryLabels[copy.category] || copy.kind || "Progetto")}</span>
            <span>${escapeHtml(copy.status || project.phase)}</span>
          </div>
          <p class="dialog-kind">${escapeHtml(copy.kind || "")}</p>
          <h2 id="dialog-title">${escapeHtml(project.displayName)}</h2>
          <p class="dialog-tagline">${escapeHtml(copy.tagline || "")}</p>
          <p class="dialog-pitch">${escapeHtml(copy.pitch || "")}</p>
          ${details.length ? `<ul class="dialog-details">${details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul>` : ""}
          <p class="dialog-role">${escapeHtml(copy.role || "")}</p>
          <div class="dialog-actions">${renderDialogActions(project)}</div>
        </div>
      </div>
    `;

    bindShareButtons(dialogContent);
    if (!dialog.open) dialog.showModal();
    if (updateHash) history.replaceState(null, "", `#${project.id}`);
  }

  function closeProjectDialog() {
    if (dialog?.open) dialog.close();
  }

  function bindProjectButtons() {
    document.querySelectorAll("[data-open-project]").forEach((button) => {
      button.addEventListener("click", () => openProject(button.dataset.openProject));
    });
  }

  function applyFilter(filter) {
    document.querySelectorAll(".project-card").forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.category !== filter;
    });

    filterButtons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
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

  function bindShareButtons(scope = document) {
    scope.querySelectorAll("[data-share-project]").forEach((button) => {
      button.addEventListener("click", async () => {
        const url = projectShareUrl(button.dataset.shareProject);
        const name = button.dataset.shareName;

        if (navigator.share) {
          try {
            await navigator.share({
              title: `${name} — Spidah`,
              text: `${name}, un progetto di Francesco Magistà.`,
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
    openProject(id, false);
  }

  function updateProgress() {
    const page = document.documentElement;
    const max = page.scrollHeight - page.clientHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? page.scrollTop / max : 0})`;
    if (backToTop) backToTop.classList.toggle("visible", window.scrollY > 900);
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.filter));
  });

  if (dialog) {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeProjectDialog();
    });
    dialog.addEventListener("close", () => {
      if (window.location.hash && allProjects.some((project) => `#${project.id}` === window.location.hash)) {
        history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      }
    });
  }

  dialogClose?.addEventListener("click", closeProjectDialog);

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
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.querySelector("#year").textContent = new Date().getFullYear();
  updateProgress();

  fetch("data/projects.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Catalogo non disponibile");
      return response.json();
    })
    .then((data) => render(data.projects || []))
    .catch(() => {
      root.innerHTML = `<p class="loading">Il catalogo non si è caricato. Riprova tra poco.</p>`;
    });
})();
