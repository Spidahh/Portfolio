const dataUrl = "data/projects.json";

const projectList = document.querySelector("#project-list");
const jumpList = document.querySelector("#project-jump-list");
const jumpCount = document.querySelector("#jump-count");
const projectsCount = document.querySelector("#projects-count");

let projects = [];

function normalizeProject(item) {
  const copy = item.publicCopy;

  return {
    id: item.id,
    name: item.name,
    kind: copy.kind,
    visual: copy.visual,
    visualAlt: copy.visualAlt,
    visualFit: copy.visualFit || "cover",
    tagline: copy.tagline,
    pitch: copy.pitch,
    role: copy.role || "",
    linkLabel: copy.linkLabel || "Apri il progetto",
    publicUrl: item.publicUrl
  };
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function projectNumber(index) {
  return String(index + 1).padStart(2, "0");
}

function renderJumpList() {
  jumpList.innerHTML = projects.map((project, index) => `
    <li>
      <a href="#${escapeHtml(project.id)}">
        <span class="jump-index">${projectNumber(index)}</span>
        <span class="jump-name">${escapeHtml(project.name)}</span>
      </a>
    </li>
  `).join("");
}

function actionMarkup(project) {
  if (!project.publicUrl) return "";

  return `
    <a class="project-action" href="${escapeHtml(project.publicUrl)}" target="_blank" rel="noopener">
      ${escapeHtml(project.linkLabel)} <span aria-hidden="true">↗</span>
    </a>
  `;
}

function pitchMarkup(project) {
  if (!project.pitch) return "";

  return `<p class="project-pitch">${escapeHtml(project.pitch)}</p>`;
}

function roleMarkup(project) {
  if (!project.role) return "";

  return `<p class="project-role"><span>Ruolo</span> ${escapeHtml(project.role)}</p>`;
}

function mediaMarkup(project, index) {
  if (!project.visual) {
    return `
      <div class="project-media project-media--identity" aria-hidden="true">
        <span class="identity-number">${projectNumber(index)}</span>
        <strong>${escapeHtml(project.name)}</strong>
        <span class="identity-kind">${escapeHtml(project.kind)}</span>
      </div>
    `;
  }

  const image = `
    <img
      src="${escapeHtml(project.visual)}"
      alt="${escapeHtml(project.visualAlt)}"
      ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}
    >
  `;

  const mediaClass = project.visualFit === "contain"
    ? "project-media project-media--contain"
    : "project-media";

  if (!project.publicUrl) {
    return `<div class="${mediaClass}">${image}</div>`;
  }

  return `
    <a class="${mediaClass}" href="${escapeHtml(project.publicUrl)}" target="_blank" rel="noopener" aria-label="${escapeHtml(project.linkLabel)}">
      ${image}
    </a>
  `;
}

function renderProjects() {
  projectList.innerHTML = projects.map((project, index) => `
    <article class="project-entry" id="${escapeHtml(project.id)}">
      <p class="project-number" aria-hidden="true">${projectNumber(index)}</p>
      <div class="project-copy">
        <p class="project-kind">${escapeHtml(project.kind)}</p>
        <h3>${escapeHtml(project.name)}</h3>
        <p class="project-tagline">${escapeHtml(project.tagline)}</p>
        ${pitchMarkup(project)}
        ${roleMarkup(project)}
        ${actionMarkup(project)}
      </div>
      ${mediaMarkup(project, index)}
    </article>
  `).join("");
}

function updateCount() {
  const count = String(projects.length).padStart(2, "0");
  jumpCount.textContent = count;
  projectsCount.textContent = count;
}

function initSectionNavigation() {
  const navLinks = [...document.querySelectorAll(".main-nav a")];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${visible.target.id}`;
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }, {
    rootMargin: "-20% 0px -62%",
    threshold: [0, 0.1, 0.35]
  });

  sections.forEach((section) => observer.observe(section));
}

async function init() {
  const response = await fetch(dataUrl);
  if (!response.ok) {
    throw new Error(`Catalogo non disponibile (${response.status})`);
  }

  const data = await response.json();
  projects = data.projects.map(normalizeProject);
  updateCount();
  renderJumpList();
  renderProjects();
  initSectionNavigation();
}

document.querySelector("#year").textContent = new Date().getFullYear();

init().catch((error) => {
  projectList.innerHTML = `<p class="load-error">Non riesco a caricare i progetti. ${escapeHtml(error.message)}</p>`;
});
