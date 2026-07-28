(function () {
  "use strict";

  const grid = document.querySelector("#project-grid");
  const filterButtons = [...document.querySelectorAll(".filter")];
  const menuButton = document.querySelector(".menu-button");
  const mobileNav = document.querySelector("#mobile-nav");
  const progress = document.querySelector("#progress");

  const suiteLabels = {
    utility: "Utility",
    editorial: "Editorial",
    play: "Play",
    story: "Story"
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
    const displayName = escapeHtml(project.displayName || project.name).replaceAll("\\n", "<br>");
    const links = [];
    if (project.publicUrl) {
      links.push(`<a class="text-link" href="${escapeHtml(project.publicUrl)}" target="_blank" rel="noopener">Apri il progetto ↗</a>`);
    }
    if (project.repositoryUrl && project.repositoryPublic) {
      links.push(`<a class="text-link" href="${escapeHtml(project.repositoryUrl)}" target="_blank" rel="noopener">Repository ↗</a>`);
    }
    if (!links.length) {
      links.push(`<span class="text-link project-coming-soon">In sviluppo · aggiornamenti futuri</span>`);
    }

    return `
      <article class="project-card" data-suite="${escapeHtml(project.suite)}" style="--accent:${escapeHtml(project.accent)};--visual-ink:${escapeHtml(project.visualInk || "#090a0d")}">
        <div class="project-visual" data-code="${String(index + 1).padStart(2, "0")}">
          <span class="visual-suite">${escapeHtml(suiteLabels[project.suite])}</span>
          <span class="visual-word">${displayName}</span>
        </div>
        <div class="project-body">
          <div class="project-meta">
            <span class="project-state">${escapeHtml(project.status)}</span>
            <span class="project-phase">${escapeHtml(project.phase)}</span>
          </div>
          <h3>${escapeHtml(project.name)}</h3>
          <p class="project-summary">${escapeHtml(project.summary)}</p>
          <p class="project-proof"><span>Prova reale</span>${escapeHtml(project.proof)}</p>
          <div class="project-actions">${links.join("")}</div>
        </div>
      </article>`;
  }

  function render(projects) {
    const presentProjects = projects.filter((project) => project.present !== false);
    grid.innerHTML = presentProjects.map(projectCard).join("");
    const count = document.querySelector("#hero-project-count");
    if (count) count.textContent = String(presentProjects.length).padStart(2, "0");
    const label = document.querySelector("#hero-project-label");
    if (label) label.textContent = `${presentProjects.length} progetti`;
    const filterCount = document.querySelector("#filter-total-count");
    if (filterCount) filterCount.textContent = String(presentProjects.length);
  }

  function applyFilter(filter) {
    document.querySelectorAll(".project-card").forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.suite !== filter;
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.toggle("active", item === button));
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
  }

  function updateProgress() {
    const root = document.documentElement;
    const max = root.scrollHeight - root.clientHeight;
    progress.style.transform = `scaleX(${max > 0 ? root.scrollTop / max : 0})`;
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  document.querySelector("#year").textContent = new Date().getFullYear();

  fetch("studio/projects.public.json")
    .then((response) => {
      if (!response.ok) throw new Error("Catalogo non disponibile");
      return response.json();
    })
    .then((data) => render(data.projects))
    .catch(() => {
      grid.innerHTML = `<p class="loading">Il catalogo non si è caricato. Riprova dalla versione online del sito.</p>`;
    });
})();
