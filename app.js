const dataUrl = "data/projects.json";

const projectList = document.querySelector("#project-list");
const jumpList = document.querySelector("#project-jump-list");
const dialog = document.querySelector("#project-dialog");
const closeDialogButton = dialog.querySelector(".dialog-close");

const accentByTheme = {
  guardalo: "#0b97c4",
  organizzamici: "#25d5c5",
  smem0: "#3b2cc3",
  chatfreevideo: "#8b5cf6",
  politicometro: "#d72828",
  ragequit: "#ff5a1f",
  frattura: "#e58b39"
};

let projects = [];

const visualAltById = {
  guardalo: "La home reale di GUARDALO con ricerca, generi e percorsi editoriali.",
  organizzamici: "La home reale di Organizzamici con il pulsante per creare un evento.",
  smem0: "L’interfaccia reale di Smem0 con una conversazione, una scadenza e le fonti collegate.",
  webchat: "La home reale di ChatFreeVideo con accesso immediato a chat e videochat.",
  politicometro: "Concept editoriale di Politicometro con promessa, fatto, prova ed esito.",
  ragequit: "L’artwork di RAGEQUIT con un arciere colpito nell’arena.",
  frattura: "La copertina di Frattura, una città verticale spezzata nel buio."
};

function normalizeProject(item) {
  const copy = item.publicCopy;
  const dialogAction = {
    label: copy.dialogCta,
    dialog: true,
    primary: !item.publicUrl
  };

  let secondAction;
  if (item.publicUrl) {
    secondAction = {
      label: copy.cta,
      href: item.publicUrl,
      external: true,
      primary: true
    };
  } else if (item.repositoryPublic && item.repositoryUrl) {
    secondAction = {
      label: "Vedi il repository",
      href: item.repositoryUrl,
      external: true
    };
  } else {
    secondAction = {
      label: "Parliamone",
      href: "#contatti"
    };
  }

  return {
    id: item.id,
    name: item.displayName || item.name,
    kind: copy.kind,
    status: copy.status,
    theme: copy.theme,
    logo: copy.logo,
    visual: copy.visual,
    visualAlt: visualAltById[item.id] || `Anteprima di ${item.displayName || item.name}.`,
    strap: copy.tagline,
    pitch: copy.pitch,
    role: copy.role.replaceAll(" · ", ", "),
    actions: item.publicUrl ? [secondAction, dialogAction] : [dialogAction, secondAction],
    detail: copy.detail
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

function brandMarkup(project, compact = false) {
  const name = escapeHtml(project.name);

  if (project.logo) {
    const full = project.theme === "ragequit";
    const imageClass = compact
      ? `dialog-logo${full ? " dialog-logo--full" : ""}`
      : `project-logo${full ? " project-logo--full" : ""}`;

    return `
      <img class="${imageClass}" src="${escapeHtml(project.logo)}" alt="">
      ${full ? "" : `<${compact ? "strong" : "span"} class="${compact ? "" : "project-wordmark"}">${name}</${compact ? "strong" : "span"}>`}
    `;
  }

  return `<${compact ? "strong" : "span"} class="${compact ? "" : `project-wordmark project-wordmark--${escapeHtml(project.theme)}`}">${name}</${compact ? "strong" : "span"}>`;
}

function actionMarkup(action, project, location = "card") {
  const className = location === "dialog"
    ? "dialog-action"
    : `project-action${action.primary ? " project-action--primary" : ""}`;
  const label = escapeHtml(action.label);

  if (action.dialog) {
    return `<button class="${className}" type="button" data-project-dialog="${escapeHtml(project.id)}">${label} <span aria-hidden="true">→</span></button>`;
  }

  const external = action.external ? ' target="_blank" rel="noopener"' : "";
  const arrow = action.external ? "↗" : "→";
  return `<a class="${className}" href="${escapeHtml(action.href)}"${external}>${label} <span aria-hidden="true">${arrow}</span></a>`;
}

function renderJumpList() {
  jumpList.innerHTML = projects.map((project, index) => `
    <li>
      <a href="#${escapeHtml(project.id)}">
        <span class="jump-index">${String(index + 1).padStart(2, "0")}</span>
        <span class="jump-name">${escapeHtml(project.name)}</span>
        <span class="jump-state">${escapeHtml(project.status)}</span>
      </a>
    </li>
  `).join("");
}

function renderProjects() {
  projectList.innerHTML = projects.map((project, index) => `
    <article class="project-story project-story--${escapeHtml(project.theme)}" id="${escapeHtml(project.id)}" data-project="${escapeHtml(project.id)}">
      <div class="project-copy">
        <div class="project-brand">
          ${brandMarkup(project)}
        </div>
        <div class="project-meta">
          <span>${String(index + 1).padStart(2, "0")} · ${escapeHtml(project.kind)}</span>
          <span class="project-status">${escapeHtml(project.status)}</span>
        </div>
        <h3>${escapeHtml(project.strap)}</h3>
        <p class="project-pitch">${escapeHtml(project.pitch)}</p>
        <p class="project-role">${escapeHtml(project.role)}</p>
        <div class="project-actions">
          ${project.actions.map((action) => actionMarkup(action, project)).join("")}
        </div>
      </div>
      <div class="project-visual">
        <div class="project-shot-wrap">
          <img
            class="project-shot"
            src="${escapeHtml(project.visual)}"
            alt="${escapeHtml(project.visualAlt)}"
            ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}
          >
        </div>
      </div>
    </article>
  `).join("");
}

function openProjectDialog(projectId) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return;

  dialog.style.setProperty("--dialog-accent", accentByTheme[project.theme] || "#171713");
  dialog.querySelector("#dialog-brand").innerHTML = brandMarkup(project, true);
  dialog.querySelector("#dialog-kind").textContent = `${project.kind} · ${project.status}`;
  dialog.querySelector("#dialog-title").textContent = project.strap;
  dialog.querySelector("#dialog-lead").textContent = project.detail.lead;
  dialog.querySelector("#dialog-body").textContent = project.detail.body;
  dialog.querySelector("#dialog-now").textContent = project.detail.now;

  const publicActions = project.actions.filter((action) => !action.dialog);
  dialog.querySelector("#dialog-actions").innerHTML = publicActions.length
    ? publicActions.map((action) => actionMarkup(action, project, "dialog")).join("")
    : `<a class="dialog-action" href="#contatti">Parliamone <span aria-hidden="true">→</span></a>`;

  document.body.classList.add("dialog-open");
  dialog.showModal();
}

function closeProjectDialog() {
  dialog.close();
  document.body.classList.remove("dialog-open");
}

async function init() {
  const response = await fetch(dataUrl);
  if (!response.ok) {
    throw new Error(`Catalogo non disponibile (${response.status})`);
  }

  const data = await response.json();
  projects = data.projects.map(normalizeProject);
  renderJumpList();
  renderProjects();
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-project-dialog]");
  if (trigger) {
    openProjectDialog(trigger.dataset.projectDialog);
  }

  const dialogAnchor = event.target.closest(".project-dialog a[href^='#']");
  if (dialogAnchor) {
    closeProjectDialog();
  }
});

closeDialogButton.addEventListener("click", closeProjectDialog);

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    closeProjectDialog();
  }
});

dialog.addEventListener("cancel", () => {
  document.body.classList.remove("dialog-open");
});

document.querySelector("#year").textContent = new Date().getFullYear();

init().catch((error) => {
  projectList.innerHTML = `<p class="load-error">Non riesco a caricare i progetti. ${escapeHtml(error.message)}</p>`;
});
