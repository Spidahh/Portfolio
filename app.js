(function () {
  "use strict";

  const grid = document.querySelector("#project-grid");
  const filterButtons = [...document.querySelectorAll(".filter")];
  const menuButton = document.querySelector(".menu-button");
  const mobileNav = document.querySelector("#mobile-nav");
  const progress = document.querySelector("#progress");
  const toast = document.querySelector("#toast");
  const backToTop = document.querySelector("#back-to-top");
  const filterStatus = document.querySelector("#filter-status");
  let allProjects = [];

  const suiteLabels = {
    utility: "App & strumenti",
    editorial: "Contenuti",
    play: "Giochi",
    story: "Storie"
  };

  const phaseLabels = {
    Live: "Puoi provarlo",
    Pilot: "In collaudo",
    Prototype: "In costruzione",
    Production: "In scrittura"
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function projectCard(project, index) {
    const displayName = escapeHtml(project.displayName || project.name);
    const copy = project.publicCopy || {};
    const longNameClass = displayName.length > 10 ? " long-name" : "";
    const links = [];
    if (project.publicUrl) {
      links.push(`<a class="text-link" href="${escapeHtml(project.publicUrl)}" target="_blank" rel="noopener">${escapeHtml(copy.cta || "Apri il progetto")} ↗</a>`);
    }
    if (project.repositoryUrl && project.repositoryPublic) {
      links.push(`<a class="text-link secondary-link" href="${escapeHtml(project.repositoryUrl)}" target="_blank" rel="noopener">Guarda il codice ↗</a>`);
    }
    if (!links.length) {
      links.push(`<span class="project-coming-soon">${escapeHtml(copy.availability || "Non è ancora pubblico.")}</span>`);
    }
    links.push(`<button class="share-button" type="button" data-share-project="${escapeHtml(project.id)}" data-share-name="${escapeHtml(project.name)}">Condividi</button>`);

    return `
      <article class="project-card" id="${escapeHtml(project.id)}" data-suite="${escapeHtml(project.suite)}" style="--accent:${escapeHtml(project.accent)};--visual-ink:${escapeHtml(project.visualInk || "#090a0d")}">
        <div class="project-visual" data-code="${String(index + 1).padStart(2, "0")}">
          <span class="visual-suite">${escapeHtml(suiteLabels[project.suite])}</span>
          <span class="visual-word${longNameClass}">${displayName}</span>
        </div>
        <div class="project-body">
          <div class="project-meta">
            <span class="project-state">${escapeHtml(suiteLabels[project.suite])}</span>
            <span class="project-phase">${escapeHtml(phaseLabels[project.phase] || project.phase)}</span>
          </div>
          <h3>${escapeHtml(project.name)}</h3>
          <p class="project-tagline">${escapeHtml(copy.tagline)}</p>
          <p class="project-story">${escapeHtml(copy.story)}</p>
          <div class="project-now"><span>Dove siamo adesso</span><p>${escapeHtml(copy.now)}</p></div>
          <div class="project-actions">${links.join("")}</div>
        </div>
      </article>`;
  }

  function render(projects) {
    const presentProjects = projects.filter((project) => project.present !== false);
    allProjects = presentProjects;
    grid.innerHTML = presentProjects.map(projectCard).join("");
    const count = document.querySelector("#hero-project-count");
    if (count) count.textContent = String(presentProjects.length).padStart(2, "0");
    const label = document.querySelector("#hero-project-label");
    if (label) label.textContent = `${presentProjects.length} progetti`;
    const filterCount = document.querySelector("#filter-total-count");
    if (filterCount) filterCount.textContent = String(presentProjects.length);
    bindShareButtons();
    applyFilter("all");
    revealHashProject();
  }

  function applyFilter(filter) {
    let visibleCount = 0;
    document.querySelectorAll(".project-card").forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.suite !== filter;
      if (!card.hidden) visibleCount += 1;
    });
    if (filterStatus) {
      filterStatus.textContent = `${visibleCount} ${visibleCount === 1 ? "progetto mostrato" : "progetti mostrati"}.`;
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.toggle("active", item === button));
      filterButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      applyFilter(button.dataset.filter);
    });
  });

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobileNav.hidden = expanded;
    });
    mobileNav.addEventListener("click", (event) => {
      if (event.target.matches("a")) {
        mobileNav.hidden = true;
        menuButton.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        mobileNav.hidden = true;
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.focus();
      }
    });
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.remove("visible"), 2400);
  }

  function projectShareUrl(projectId) {
    return `${window.location.origin}${window.location.pathname}#${projectId}`;
  }

  function bindShareButtons() {
    document.querySelectorAll("[data-share-project]").forEach((button) => {
      button.addEventListener("click", async () => {
        const projectId = button.dataset.shareProject;
        const projectName = button.dataset.shareName;
        const url = projectShareUrl(projectId);
        if (navigator.share) {
          try {
            await navigator.share({
              title: `${projectName} — un progetto di Spidah`,
              text: `Guarda ${projectName}, uno dei progetti di Francesco Magistà.`,
              url
            });
            return;
          } catch (error) {
            if (error && error.name === "AbortError") return;
          }
        }
        try {
          await navigator.clipboard.writeText(url);
          showToast(`Link di ${projectName} copiato.`);
        } catch {
          showToast(`Link: ${url}`);
        }
      });
    });
  }

  function revealHashProject() {
    const projectId = window.location.hash.slice(1);
    if (!projectId || !allProjects.some((project) => project.id === projectId)) return;
    const card = document.getElementById(projectId);
    if (!card) return;
    card.classList.add("is-targeted");
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => card.classList.remove("is-targeted"), 2600);
  }

  function updateProgress() {
    const root = document.documentElement;
    const max = root.scrollHeight - root.clientHeight;
    progress.style.transform = `scaleX(${max > 0 ? root.scrollTop / max : 0})`;
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("scroll", () => {
    if (backToTop) backToTop.classList.toggle("visible", window.scrollY > 900);
  }, { passive: true });
  updateProgress();

  if (backToTop) {
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  document.querySelector("#year").textContent = new Date().getFullYear();

  fetch("data/projects.json")
    .then((response) => {
      if (!response.ok) throw new Error("Catalogo non disponibile");
      return response.json();
    })
    .then((data) => render(data.projects))
    .catch(() => {
      grid.innerHTML = `<p class="loading">Il catalogo non si è caricato. Riprova dalla versione online del sito.</p>`;
    });
})();
