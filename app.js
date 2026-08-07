const dataUrl = "data/projects.json";

const groupsEl = document.querySelector("#project-groups");
const filtersEl = document.querySelector("#project-filters");
const playlistGridEl = document.querySelector("#playlist-grid");
const statProjectsEl = document.querySelector("#stat-projects");
const statOnlineEl = document.querySelector("#stat-online");
const showcaseListEl = document.querySelector("#showcase-list");
const showcaseCountEl = document.querySelector("#showcase-count");

const playlists = [
  ["Sottosfondo", "Lo-fi · Chill", "https://open.spotify.com/playlist/30I943TwY7ANxtmVrgoeLZ", "01"],
  ["Definitivamente bella", "Hit · Mix", "https://open.spotify.com/playlist/5wp0oohWN1HoAzvZqhIcBV", "02"],
  ["Rap Italiano", "Hip-Hop", "https://open.spotify.com/playlist/2Qp1dOfNXOrGJrxxFxqcvh", "03"],
  ["Astare Relax", "Ambient", "https://open.spotify.com/playlist/3tbfFbIRVELTifW86O2rNj", "04"],
  ["Bassbondanza", "Bass · Electronic", "https://open.spotify.com/playlist/1DUsXa8l2dIIhG7YkuOirK", "05"],
  ["ElectroThings", "Electro · Synth", "https://open.spotify.com/playlist/26QxZ2aHgTIBXzLPH1NPMG", "06"],
  ["Italiana", "Pop italiano", "https://open.spotify.com/playlist/6CJtiJA4E4ItJ888qSs2mW", "07"],
  ["Love It", "Romantic", "https://open.spotify.com/playlist/2fGlkkuU6bpTJQzekgPMGm", "08"],
  ["Reggae Music", "Reggae · Dub", "https://open.spotify.com/playlist/1kL5LBxd53GpYwx7c4LOj5", "09"],
  ["Rock, Metal & Il Diavolo", "Rock · Metal", "https://open.spotify.com/playlist/25Y6Kt39iokGDYheflbjfx", "10"],
  ["Straniera", "Internazionale", "https://open.spotify.com/playlist/0cp6DP806RkTK8UHQ2MfI6", "11"],
  ["Anime", "OST · J-Pop", "https://open.spotify.com/playlist/5O04i4e6B9KtRbh5t248iI", "12"]
];

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function projectLinks(project) {
  const links = [];

  if (project.publicUrl) {
    const cta = project.cta || "Apri il progetto";
    links.push(`<a class="project-link project-link--cta" href="${esc(project.publicUrl)}" target="_blank" rel="noopener">${esc(cta)} <span aria-hidden="true">↗</span></a>`);
  }

  if (project.repositoryUrl) {
    links.push(`<a class="project-link project-link--soft" href="${esc(project.repositoryUrl)}" target="_blank" rel="noopener">Codice su GitHub <span aria-hidden="true">↗</span></a>`);
  }

  return links.length ? `<div class="project-actions">${links.join("")}</div>` : "";
}

function projectCard(project, index, variant) {
  const description = project.pitch
    ? `<p class="project-description">${esc(project.pitch)}</p>`
    : "";

  const intestazione = `
    <p class="project-kind"><span class="project-index">${pad(index)}</span>${esc(project.kind)}</p>
    <div class="project-title-row">
      <span class="project-dot" aria-hidden="true"></span>
      <h4>${esc(project.name)}</h4>
    </div>
    <p class="project-tagline">${esc(project.tagline)}</p>
  `;

  const dettaglio = `
    ${description}
    <p class="project-role"><strong>Ruolo:</strong> ${esc(project.role)}</p>
    ${projectLinks(project)}
  `;

  const corpo = variant === "feature"
    ? `<div class="project-card__body"><div>${intestazione}</div><div>${dettaglio}</div></div>`
    : `<div class="project-card__body">${intestazione}${dettaglio}</div>`;

  return `
    <article class="project-card project-card--${esc(variant)} reveal" id="${esc(project.id)}" data-tone="${esc(project.tone || "violet")}">
      <div class="project-media">
        <img src="${esc(project.image)}" alt="${esc(project.alt)}" loading="${index <= 2 ? "eager" : "lazy"}">
      </div>
      ${corpo}
    </article>
  `;
}

function renderProjects(groups) {
  let index = 0;

  groupsEl.innerHTML = groups.map((group, position) => {
    const variant = position === 0 ? "feature" : "compact";
    const cards = group.projects.map((project) => {
      index += 1;
      return projectCard(project, index, variant);
    }).join("");

    const description = group.description
      ? `<p>${esc(group.description)}</p>`
      : "";

    return `
      <section class="project-group project-group--${variant}" data-group="${esc(group.id)}">
        <div class="group-heading">
          <h3>${esc(group.title)}</h3>
          ${description}
        </div>
        <div class="project-list">${cards}</div>
      </section>
    `;
  }).join("");
}

function renderFilters(groups) {
  const total = groups.reduce((sum, group) => sum + group.projects.length, 0);

  const buttons = [`<button class="filter-button is-active" type="button" data-filter="all">Tutti <span>${pad(total)}</span></button>`]
    .concat(groups.map((group) => `
      <button class="filter-button" type="button" data-filter="${esc(group.id)}">
        ${esc(group.label || group.title)} <span>${pad(group.projects.length)}</span>
      </button>
    `));

  filtersEl.innerHTML = buttons.join("");
}

function renderShowcase(groups) {
  if (!showcaseListEl) return;

  const projects = groups.flatMap((group) => group.projects);

  if (showcaseCountEl) showcaseCountEl.textContent = `${pad(projects.length)} progetti`;

  showcaseListEl.innerHTML = projects.map((project, position) => `
    <li class="showcase-item" data-tone="${esc(project.tone || "violet")}">
      <a href="#${esc(project.id)}">
        <span class="showcase-dot" aria-hidden="true"></span>
        <span class="showcase-name">${esc(project.name)}</span>
        <span class="showcase-kind">${esc(project.kind)}</span>
        <span class="showcase-index" aria-hidden="true">${pad(position + 1)}</span>
      </a>
    </li>
  `).join("");
}

function renderStats(groups) {
  const all = groups.flatMap((group) => group.projects);
  if (statProjectsEl) statProjectsEl.textContent = pad(all.length);
  if (statOnlineEl) statOnlineEl.textContent = pad(all.filter((project) => project.publicUrl).length);
}

function renderPlaylists() {
  playlistGridEl.innerHTML = playlists.map((item, index) => `
    <a class="playlist-card reveal" href="${esc(item[2])}" target="_blank" rel="noopener"
       aria-label="${esc(item[0])} — ${esc(item[1])}">
      <img class="playlist-cover" src="assets/playlists/${esc(item[3])}.jpg"
           alt="Copertina della playlist ${esc(item[0])}" loading="lazy">
      <span class="playlist-arrow" aria-hidden="true">↗</span>
    </a>
  `).join("");
}

function setupFilters() {
  const buttons = [...document.querySelectorAll(".filter-button")];
  const groups = [...document.querySelectorAll(".project-group")];

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.toggle("is-active", item === button));
      const filter = button.dataset.filter;
      groups.forEach((group) => {
        group.hidden = filter !== "all" && group.dataset.group !== filter;
      });
    });
  });
}

function setupNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const next = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", next);
    toggle.setAttribute("aria-expanded", String(next));
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

function setupReveal() {
  const elements = [...document.querySelectorAll(".reveal")];

  if (!("IntersectionObserver" in window)) {
    elements.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {threshold: 0.12, rootMargin: "0px 0px -40px"});

  elements.forEach((item) => observer.observe(item));
}

async function init() {
  const response = await fetch(dataUrl);
  if (!response.ok) throw new Error(`Catalogo non disponibile (${response.status})`);

  const data = await response.json();
  const groups = data.groups;

  renderFilters(groups);
  renderProjects(groups);
  renderShowcase(groups);
  renderStats(groups);
  setupFilters();
  setupReveal();
}

renderPlaylists();
setupNavigation();
document.querySelector("#year").textContent = new Date().getFullYear();

init().catch((error) => {
  groupsEl.innerHTML = `<p class="load-error">Non riesco a caricare i progetti. ${esc(error.message)}</p>`;
});
