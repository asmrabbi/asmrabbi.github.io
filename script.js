const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".main-nav");

function closeMenu() {
  navigation.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.textContent = "Menu";
  document.body.classList.remove("menu-open");
}

menuButton.addEventListener("click", () => {
  const shouldOpen = menuButton.getAttribute("aria-expanded") !== "true";
  navigation.classList.toggle("open", shouldOpen);
  menuButton.setAttribute("aria-expanded", String(shouldOpen));
  menuButton.textContent = shouldOpen ? "Close" : "Menu";
  document.body.classList.toggle("menu-open", shouldOpen);
});

navigation.addEventListener("click", (event) => {
  if (event.target.matches("a")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("open")) {
    closeMenu();
    menuButton.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) closeMenu();
});

const reflectionDate = document.querySelector("#life-reflection-date");

function updateReflectionDate() {
  if (!reflectionDate) return;
  const now = new Date();
  reflectionDate.dateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  reflectionDate.textContent = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(now);
}

updateReflectionDate();
window.setInterval(updateReflectionDate, 60 * 60 * 1000);

function renderManagedUpdates(updates) {
  const container = document.querySelector("#managed-updates");
  const toggle = document.querySelector("#toggle-updates");
  if (!container || !Array.isArray(updates)) return;

  const publishedUpdates = updates.filter((update) => update.published !== false);
  const articles = publishedUpdates.map((update, index) => {
    const article = document.createElement("article");
    if (index >= 3) {
      article.dataset.updateExtra = "";
      article.hidden = true;
    }

    const time = document.createElement("time");
    time.dateTime = update.date || "";
    time.textContent = update.display_date || update.date || "";

    const body = document.createElement("div");
    const category = document.createElement("p");
    category.className = "status-label";
    category.textContent = update.category || "Update";
    const title = document.createElement("h3");
    title.textContent = update.title || "Untitled update";
    const summary = document.createElement("p");
    summary.textContent = update.summary || "";
    body.append(category, title, summary);
    article.append(time, body);
    return article;
  });

  container.replaceChildren(...articles);
  if (toggle) {
    toggle.hidden = publishedUpdates.length <= 3;
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Show all updates";
  }
}

function sharedLinks(links = [], className = "") {
  const line = document.createElement("p");
  if (className) line.className = className;
  links.forEach((entry, index) => {
    if (index) line.append(" · ");
    const link = document.createElement("a");
    link.href = entry.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `${entry.label} →`;
    line.append(link);
  });
  return line;
}

function sharedTags(keywords = []) {
  const tags = document.createElement("p");
  tags.className = "publication-tags";
  tags.textContent = keywords.join(" · ");
  return tags;
}

function appendHighlightedAuthorLine(container, item) {
  if (!item.authors && !item.venue) return;
  const line = document.createElement("p");
  const authors = item.authors || "";
  const matches = [...authors.matchAll(/L\. R\. Rabbi|Rabbi, Lutfor Rahman/g)];
  let cursor = 0;
  matches.forEach((match) => {
    line.append(authors.slice(cursor, match.index));
    const strong = document.createElement("strong");
    strong.textContent = match[0];
    line.append(strong);
    cursor = match.index + match[0].length;
  });
  line.append(authors.slice(cursor));
  if (item.venue) line.append(`${authors ? ". " : ""}${item.venue}.`);
  container.append(line);
}

function renderSharedPublication(item, extra = false) {
  const row = document.createElement("li");
  row.id = `work-${item.id}`;
  if (extra) {
    row.dataset.publicationExtra = "";
    row.hidden = true;
  }
  const year = document.createElement("div");
  year.className = "publication-year";
  year.textContent = item.year || "—";
  const content = document.createElement("div");
  const heading = document.createElement("h3");
  heading.dataset.profileTerm = `publication-${item.id}`;
  heading.textContent = item.title;
  content.append(heading);
  appendHighlightedAuthorLine(content, item);
  if (item.body) {
    const summary = document.createElement("p");
    summary.textContent = item.body;
    content.append(summary);
  }
  if (item.links?.length) content.append(sharedLinks(item.links));
  if (item.keywords?.length) content.append(sharedTags(item.keywords));
  row.append(year, content);
  return row;
}

function renderSharedPublications(outputs = []) {
  const published = outputs.filter((item) => item.publication !== false && !item.ongoing);
  const primary = document.querySelector("#publications > .publication-list");
  const secondary = document.querySelector("#more-publication-content .secondary-publications");
  const workGrid = document.querySelector("#more-publication-content .work-grid");
  if (!primary || !secondary || !workGrid) return;
  primary.replaceChildren(...published.slice(0, 5).map((item, index) => renderSharedPublication(item, index >= 3)));
  secondary.replaceChildren(...published.slice(5).map((item) => renderSharedPublication(item)));
  const ongoing = outputs.filter((item) => item.ongoing);
  workGrid.replaceChildren(...ongoing.map((item) => {
    const article = document.createElement("article");
    article.id = `work-${item.id}`;
    const status = document.createElement("p");
    status.className = "status-label";
    status.textContent = item.meta || "Ongoing work";
    const heading = document.createElement("h3");
    heading.dataset.profileTerm = `publication-${item.id}`;
    heading.textContent = item.title;
    const body = document.createElement("p");
    body.textContent = item.body || "";
    article.append(status, heading, body);
    if (item.keywords?.length) article.append(sharedTags(item.keywords));
    if (item.links?.length) article.append(sharedLinks(item.links));
    return article;
  }));
  setPublicationsExpanded(false);
}

function renderSharedProjects(projects = {}) {
  const academic = projects.academic || [];
  const featured = document.querySelector("#academic-projects .featured-project");
  const more = document.querySelector("#more-academic-projects");
  const professional = document.querySelector("#professional-projects .professional-project-list");
  if (featured && academic[0]) {
    const item = academic[0];
    const content = document.createElement("div");
    content.className = "featured-project-text";
    const meta = document.createElement("p"); meta.className = "status-label"; meta.textContent = item.meta || "";
    const heading = document.createElement("h3"); heading.dataset.profileTerm = item.id; heading.textContent = item.title;
    const body = document.createElement("p"); body.textContent = item.body || "";
    content.append(meta, heading, body);
    if (item.timeline?.length) {
      const timeline = document.createElement("ol"); timeline.className = "cycle-timeline"; timeline.setAttribute("aria-label", `${item.title} roles by cycle`);
      item.timeline.forEach((stage) => {
        const li = document.createElement("li");
        const label = document.createElement("span"); label.textContent = stage.label;
        const role = document.createElement("strong"); role.textContent = stage.role;
        const time = document.createElement("time"); time.textContent = stage.period;
        li.append(label, role, time); timeline.append(li);
      });
      content.append(timeline);
    }
    if (item.keywords?.length) content.append(sharedTags(item.keywords));
    if (item.links?.length) content.append(sharedLinks(item.links));
    featured.replaceChildren(content);
  }
  if (more) {
    const list = document.createElement("div"); list.className = "project-list single-project";
    academic.slice(1).forEach((item) => {
      const article = document.createElement("article");
      const meta = document.createElement("p"); meta.className = "status-label"; meta.textContent = item.meta || "";
      const heading = document.createElement("h3"); heading.dataset.profileTerm = item.id; heading.textContent = item.title;
      const body = document.createElement("p"); body.textContent = item.body || "";
      article.append(meta, heading, body);
      if (item.keywords?.length) article.append(sharedTags(item.keywords));
      if (item.links?.length) article.append(sharedLinks(item.links));
      list.append(article);
    });
    more.replaceChildren(list);
  }
  if (professional) {
    professional.replaceChildren(...(projects.professional || []).map((organisation) => {
      const article = document.createElement("article"); article.className = "professional-portfolio";
      const meta = document.createElement("p"); meta.className = "status-label"; meta.textContent = `${organisation.title}${organisation.meta ? ` · ${organisation.meta}` : ""}`;
      const heading = document.createElement("h3"); heading.dataset.profileTerm = organisation.id; heading.textContent = organisation.title;
      const body = document.createElement("p"); body.textContent = organisation.body || "";
      const portfolio = document.createElement("div"); portfolio.className = "portfolio-projects";
      (organisation.items || []).forEach((item) => {
        const section = document.createElement("section");
        const h4 = document.createElement("h4"); h4.dataset.profileTerm = item.id; h4.textContent = item.title;
        const itemMeta = document.createElement("p"); itemMeta.className = "status-label"; itemMeta.textContent = item.meta || "";
        const itemBody = document.createElement("p"); itemBody.textContent = item.body || "";
        section.append(h4, itemMeta, itemBody);
        if (item.keywords?.length) section.append(sharedTags(item.keywords));
        portfolio.append(section);
      });
      article.append(meta, heading, body, portfolio);
      return article;
    }));
  }
  setAcademicExpanded(false);
}

function renderSharedTeaching(items = []) {
  const grid = document.querySelector("#teaching .course-grid");
  if (!grid) return;
  grid.replaceChildren(...items.map((item) => {
    const article = document.createElement("article"); article.className = "course"; article.dataset.institution = item.institution;
    const meta = document.createElement("p"); meta.className = "course-meta"; meta.textContent = `${item.institution_label || item.institution.toUpperCase()} · ${item.role || ""}`;
    const heading = document.createElement("h3"); heading.dataset.profileTerm = `course-${item.id}`;
    const headingLink = document.createElement("a"); headingLink.href = item.links?.[0]?.url || "#"; headingLink.target = "_blank"; headingLink.rel = "noopener noreferrer"; headingLink.textContent = `${item.title} →`; heading.append(headingLink);
    const semesters = document.createElement("p"); semesters.className = "course-semesters";
    const semesterLabel = document.createElement("strong"); semesterLabel.textContent = item.semesters?.length === 1 ? "Semester" : "Semesters";
    const semesterText = document.createElement("span"); semesterText.textContent = (item.semesters || []).join(" · "); semesters.append(semesterLabel, semesterText);
    const links = document.createElement("div"); links.className = `course-links${item.links?.length > 1 ? " course-links-multiple" : ""}`;
    const linkLabel = document.createElement("strong"); linkLabel.textContent = item.links?.length > 1 ? "Course pages" : "Course page"; links.append(linkLabel);
    if (item.links?.length > 1) {
      const ul = document.createElement("ul"); item.links.forEach((entry) => { const li = document.createElement("li"); const a = document.createElement("a"); a.href = entry.url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = `${entry.label} ↗`; li.append(a); ul.append(li); }); links.append(ul);
    } else if (item.links?.[0]) { const a = document.createElement("a"); a.href = item.links[0].url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = `${item.links[0].label} ↗`; links.append(a); }
    const body = document.createElement("p"); body.textContent = item.body || "";
    const keywords = document.createElement("ul"); keywords.className = "keyword-list"; (item.keywords || []).forEach((keyword) => { const li = document.createElement("li"); li.textContent = keyword; keywords.append(li); });
    article.append(meta, heading, semesters, links, body, keywords);
    return article;
  }));
  courses = [...grid.querySelectorAll("[data-institution]")];
  coursesExpanded = false;
  renderCourses();
}

function renderSharedExperience(experience = {}) {
  [["academic", "#academic-experience .experience-list"], ["professional", "#professional-experience .experience-list"]].forEach(([type, selector]) => {
    const list = document.querySelector(selector);
    if (!list) return;
    list.replaceChildren(...(experience[type] || []).map((item, index) => {
      const row = document.createElement("li");
      if (type === "professional" && index >= 3) { row.dataset.experienceExtra = type; row.hidden = true; }
      const date = document.createElement("p"); date.className = "experience-date"; date.textContent = item.meta || "";
      const heading = document.createElement("h3"); heading.dataset.profileTerm = item.id; heading.textContent = item.title;
      const org = document.createElement("p"); org.className = "experience-org"; org.textContent = item.organisation || "";
      const body = document.createElement("p"); body.textContent = item.body || "";
      row.append(date, heading, org, body);
      if (item.keywords?.length) row.append(sharedTags(item.keywords));
      if (item.links?.length) row.append(sharedLinks(item.links));
      return row;
    }));
  });
  setExperienceExpanded("professional", false);
}

function renderSharedEducation(items = []) {
  const grid = document.querySelector("#background .background-grid");
  if (!grid) return;
  grid.replaceChildren(...items.map((item) => {
    const card = document.createElement("div");
    const heading = document.createElement("h3"); heading.dataset.profileTerm = `education-${item.id}`; heading.textContent = item.title;
    const meta = document.createElement("p"); meta.className = "degree-meta"; meta.textContent = [item.duration, item.credits].filter(Boolean).join(" · ");
    const list = document.createElement("ul"); list.className = "plain-list";
    const row = document.createElement("li"); const institution = document.createElement("strong"); institution.textContent = `${item.institution}${item.year ? `, ${item.year}` : ""}. `; row.append(institution, item.body || ""); list.append(row);
    card.append(heading, meta, list); return card;
  }));
}

function buildSharedOrbitTopics(profile) {
  const leaf = (item, term) => ({ label: item.compact_title || item.title, term });
  const publications = (profile.research?.outputs || []).filter((item) => item.publication !== false).map((item) => leaf(item, `publication-${item.id}`));
  const academicProjects = (profile.projects?.academic || []).map((item) => ({ ...leaf(item, item.id), children: (item.keywords || []).map((keyword) => ({ label: keyword, term: item.id })) }));
  const professionalProjects = (profile.projects?.professional || []).map((organisation) => ({ label: organisation.title, term: organisation.id, children: (organisation.items || []).map((item) => leaf(item, item.id)) }));
  const teachingGroups = Object.values((profile.teaching || []).reduce((groups, item) => {
    const id = item.institution;
    groups[id] ||= { label: item.institution_label || id.toUpperCase(), children: [] };
    groups[id].children.push(leaf(item, `course-${item.id}`));
    return groups;
  }, {}));
  return {
    research: (profile.research?.topics || []).map((item) => leaf(item, `research-${item.id}`)),
    publications,
    projects: [{ label: "Academic", children: academicProjects }, { label: "Professional", children: professionalProjects }],
    teaching: teachingGroups,
    experience: [
      { label: "Academic & research", children: (profile.experience?.academic || []).map((item) => leaf(item, item.id)) },
      { label: "Industry & practice", children: (profile.experience?.professional || []).map((item) => leaf(item, item.id)) }
    ],
    education: (profile.education || []).map((item) => leaf(item, `education-${item.id}`))
  };
}

function applySharedProfile(profile) {
  const research = profile.research || {};
  if (research.topics?.length) {
    const tabs = document.querySelector("#research .domain-tabs");
    tabs?.replaceChildren(...research.topics.map((item, index) => {
      const button = document.createElement("button");
      button.className = `domain-tab${index === 0 ? " active" : ""}`;
      button.id = `domain-${item.id}`;
      button.dataset.profileTerm = `research-${item.id}`;
      button.dataset.domainTitle = item.title;
      button.dataset.domainCopy = item.body || "";
      button.type = "button"; button.role = "tab"; button.setAttribute("aria-selected", String(index === 0)); button.setAttribute("aria-controls", "domain-detail"); button.textContent = item.title;
      return button;
    }));
    domainTabs = [...document.querySelectorAll(".domain-tab")];
    selectedDomain = domainTabs[0];
    bindDomainTabs();
    showDomain(selectedDomain, true);
  }
  if (research.group) {
    const box = document.querySelector("#retech .retech-box");
    const heading = box?.querySelector("h2"); const affiliation = box?.querySelector(".affiliation"); const prose = box?.querySelector(".prose");
    if (heading) heading.textContent = research.group.title;
    if (affiliation) affiliation.textContent = research.group.meta || "";
    if (prose) {
      const paragraphs = (research.group.paragraphs || []).map((text) => { const p = document.createElement("p"); p.textContent = text; return p; });
      if (research.group.links?.length) paragraphs.push(sharedLinks(research.group.links, "link-row"));
      prose.replaceChildren(...paragraphs);
    }
  }
  if (research.topics && research.outputs && research.connections) rebuildResearchNetwork(research);
  renderSharedPublications(research.outputs || []);
  renderSharedProjects(profile.projects || {});
  renderSharedTeaching(profile.teaching || []);
  renderSharedExperience(profile.experience || {});
  renderSharedEducation(profile.education || []);
  Object.assign(orbitTopics, buildSharedOrbitTopics(profile));
}

async function loadManagedContent() {
  try {
    const content = await (window.ProfileContent?.ready || Promise.resolve(null));
    if (!content) throw new Error("Managed content unavailable");

    const managedText = [
      ["[data-cms='hero-kicker']", content.hero?.kicker],
      ["[data-cms='hero-availability']", content.hero?.availability],
      ["[data-cms='hero-role']", content.hero?.role],
      ["[data-cms='hero-intro']", content.hero?.intro],
      ["[data-cms='now-eyebrow']", content.now?.eyebrow],
      ["[data-cms='now-updated']", content.now?.updated],
      ["[data-cms='now-title']", content.now?.title],
      ["[data-cms='now-body']", content.now?.body],
      ["[data-cms='now-deadline']", content.now?.deadline],
      ["[data-cms='now-link-label']", content.now?.link_label],
      ["[data-cms='contact-intro']", content.contact?.intro],
      ["#life-reflection-heading", content.reflection?.title],
      [".life-reflection-more", content.reflection?.more_label]
    ];
    managedText.forEach(([selector, value]) => {
      if (typeof value !== "string") return;
      const element = document.querySelector(selector);
      if (element) element.textContent = value;
    });

    const nowLink = document.querySelector("[data-cms-href='now-link']");
    if (nowLink && typeof content.now?.link === "string" && /^https?:\/\//.test(content.now.link)) {
      nowLink.href = content.now.link;
    }

    const reflectionProse = document.querySelector("#life-reflection-prose");
    if (reflectionProse && Array.isArray(content.reflection?.paragraphs)) {
      const paragraphs = content.reflection.paragraphs
        .filter((paragraph) => typeof paragraph === "string" && paragraph.trim())
        .map((paragraph) => {
          const element = document.createElement("p");
          element.textContent = paragraph;
          return element;
        });
      if (paragraphs.length) reflectionProse.replaceChildren(...paragraphs);
    }

    renderManagedUpdates(content.updates);
    if (content.profile) applySharedProfile(content.profile);
  } catch {
    // The embedded HTML remains a complete fallback for file previews and offline use.
  }
}

loadManagedContent();

const linkedinNowShareButton = document.querySelector("#share-now-linkedin");
const linkedinShareStatus = document.querySelector("#linkedin-share-status");

function getNowShareUrl() {
  const configuredShareUrl = document.querySelector('meta[property="og:url"]')?.content;
  const homepageUrl = new URL(configuredShareUrl || window.location.href, window.location.href);
  if (!configuredShareUrl) {
    homepageUrl.pathname = homepageUrl.pathname.replace(/\/index\.html$/, "/");
    homepageUrl.search = "";
    homepageUrl.hash = "now";
  }
  return homepageUrl;
}

function getNowPostSummary(homepageUrl) {
  const body = document.querySelector("[data-cms='now-body']")?.textContent.trim() || "";
  const deadline = document.querySelector("[data-cms='now-deadline']")?.textContent.trim() || "";
  const firstSentence = body.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || body;
  const cleanDeadline = deadline.replace(/[.!?]+$/, "");
  return `${firstSentence}\n\n${cleanDeadline}.\n\nFound on the personal website of Rabbi, Lutfor Rahman: ${homepageUrl.href}`;
}

async function copyNowPostText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.append(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    return copied;
  }
}

linkedinNowShareButton?.addEventListener("click", async () => {
  const homepageUrl = getNowShareUrl();
  const postSummary = getNowPostSummary(homepageUrl);
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(homepageUrl.href)}`;
  const shareWindow = window.open(linkedinShareUrl, "_blank", "noopener,noreferrer");
  if (shareWindow) shareWindow.opener = null;
  const copied = await copyNowPostText(postSummary);
  if (linkedinShareStatus) {
    linkedinShareStatus.hidden = false;
    linkedinShareStatus.textContent = copied
      ? "Summary copied. Paste it into LinkedIn with ⌘V or Ctrl+V."
      : "LinkedIn is open. Copy the announcement text from this section into your post.";
  }
});

const introSteps = [...document.querySelectorAll(".intro-step")];
const introDetail = document.querySelector("#intro-detail");

function showIntroStage(step) {
  const separator = step.dataset.introCopy.indexOf("|");
  const heading = step.dataset.introCopy.slice(0, separator);
  const detail = step.dataset.introCopy.slice(separator + 1);

  introSteps.forEach((candidate) => {
    const active = candidate === step;
    candidate.classList.toggle("active", active);
    candidate.setAttribute("aria-pressed", String(active));
  });
  introDetail.replaceChildren();
  const strong = document.createElement("strong");
  strong.textContent = `${heading}.`;
  introDetail.append(strong, ` ${detail}`);
}

introSteps.forEach((step) => {
  step.addEventListener("pointerenter", () => showIntroStage(step));
  step.addEventListener("focus", () => showIntroStage(step));
  step.addEventListener("click", () => showIntroStage(step));
});

let domainTabs = [...document.querySelectorAll(".domain-tab")];
const domainDetail = document.querySelector("#domain-detail");
let selectedDomain = domainTabs[0];

function showDomain(tab, commit = false) {
  if (commit) selectedDomain = tab;
  domainTabs.forEach((candidate) => {
    const active = candidate === tab;
    candidate.classList.toggle("active", active);
    candidate.setAttribute("aria-selected", String(commit ? candidate === selectedDomain : active));
  });
  domainDetail.setAttribute("aria-labelledby", tab.id);
  domainDetail.querySelector("h3").textContent = tab.dataset.domainTitle;
  domainDetail.querySelector("p").textContent = tab.dataset.domainCopy;
}

function bindDomainTabs() {
  domainTabs.forEach((tab) => {
    tab.addEventListener("pointerenter", () => showDomain(tab));
    tab.addEventListener("pointerleave", () => showDomain(selectedDomain, true));
    tab.addEventListener("focus", () => showDomain(tab));
    tab.addEventListener("blur", () => showDomain(selectedDomain, true));
    tab.addEventListener("click", () => showDomain(tab, true));
  });
}

bindDomainTabs();

const courseButtons = [...document.querySelectorAll("[data-course-filter]")];
let courses = [...document.querySelectorAll("[data-institution]")];
const courseStatus = document.querySelector("#course-filter-status");
const toggleCoursesButton = document.querySelector("#toggle-courses");
let activeCourseFilter = "all";
let coursesExpanded = false;

function renderCourses() {
  const matchingCourses = courses.filter((course) => activeCourseFilter === "all" || course.dataset.institution === activeCourseFilter);
  courses.forEach((course) => {
    const matchingIndex = matchingCourses.indexOf(course);
    course.hidden = matchingIndex === -1 || (!coursesExpanded && matchingIndex >= 2);
  });

  const visible = coursesExpanded ? matchingCourses.length : Math.min(2, matchingCourses.length);
  const institutionLabel = activeCourseFilter === "all" ? "" : `${activeCourseFilter.toUpperCase()} `;
  toggleCoursesButton.hidden = matchingCourses.length <= 2;
  toggleCoursesButton.setAttribute("aria-expanded", String(coursesExpanded));
  toggleCoursesButton.textContent = coursesExpanded
    ? `See fewer ${institutionLabel}courses`
    : `See all ${matchingCourses.length} ${institutionLabel}courses`;
  courseStatus.textContent = visible === matchingCourses.length
    ? `Showing ${visible} course${visible === 1 ? "" : "s"}.`
    : `Showing ${visible} of ${matchingCourses.length} courses.`;
}

courseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCourseFilter = button.dataset.courseFilter;
    coursesExpanded = false;
    courseButtons.forEach((candidate) => {
      const active = candidate === button;
      candidate.classList.toggle("active", active);
      candidate.setAttribute("aria-pressed", String(active));
    });
    renderCourses();
  });
});

toggleCoursesButton.addEventListener("click", () => {
  coursesExpanded = !coursesExpanded;
  renderCourses();
});

renderCourses();

const SVG_NS = "http://www.w3.org/2000/svg";
const network = document.querySelector("#research-network");
const mapStatus = document.querySelector("#map-status");
const resetMapButton = document.querySelector("#reset-map");

let topics = [
  { id: "ethics", label: "AI Ethics & Techno-Ethics" },
  { id: "hci", label: "Human-Computer Interaction" },
  { id: "requirements", label: "Requirements Engineering" },
  { id: "responsible", label: "Responsible AI & Governance" },
  { id: "participatory", label: "Participatory & VSD" },
  { id: "sociotechnical", label: "Socio-technical Systems" },
  { id: "ai4se", label: "AI for Software Engineering" },
  { id: "public", label: "Public-sector Digitalisation" },
  { id: "data", label: "Data Governance" }
];

let works = [
  { id: "justice", label: "Designing for Justice (2026)" },
  { id: "informant", label: "AI Informants (2026)" },
  { id: "alignment", label: "Value Alignment Analyser" },
  { id: "paradigm", label: "AI Paradigm Shift" },
  { id: "citizen-science", label: "Data-driven Citizen Science" },
  { id: "mobilizer", label: "Digital Mobilizer App (2025)" },
  { id: "clones", label: "AI Clones & Data Rights" },
  { id: "thesis", label: "Value Sensitive Design Project (2025)" },
  { id: "ecoclareza", label: "EcoClareza Project (2024)" },
  { id: "surveillance", label: "Interpersonal Surveillance (2024)" }
];

let connections = {
  ethics: ["justice", "informant", "alignment", "paradigm", "citizen-science", "clones", "thesis", "surveillance"],
  hci: ["justice", "informant", "alignment", "thesis", "surveillance"],
  requirements: ["justice", "informant", "alignment", "paradigm", "thesis", "ecoclareza"],
  responsible: ["justice", "informant", "alignment", "paradigm", "citizen-science", "clones", "thesis"],
  participatory: ["justice", "informant", "alignment", "mobilizer", "thesis", "ecoclareza"],
  sociotechnical: ["justice", "informant", "paradigm", "citizen-science", "mobilizer", "thesis", "ecoclareza", "surveillance"],
  ai4se: ["informant", "alignment", "paradigm"],
  public: ["justice", "citizen-science", "mobilizer", "thesis", "ecoclareza"],
  data: ["citizen-science", "mobilizer", "clones", "thesis", "ecoclareza"]
};

let topicById = Object.fromEntries(topics.map((topic) => [topic.id, topic]));
let workById = Object.fromEntries(works.map((work) => [work.id, work]));
let selectedNode = null;
let showAllMode = false;

function makeSvgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function nodeCenter(index) {
  return 20 + index * 42 + 14;
}

function addNetworkEdge(topic, topicIndex, work, workIndex) {
  const path = makeSvgElement("path", {
    class: "network-edge",
    d: `M 250 ${nodeCenter(topicIndex)} C 380 ${nodeCenter(topicIndex)}, 470 ${nodeCenter(workIndex)}, 575 ${nodeCenter(workIndex)}`,
    "data-topic": topic.id,
    "data-work": work.id,
    "aria-hidden": "true"
  });
  network.appendChild(path);
}

function addNetworkNode(item, index, type) {
  const isTopic = type === "topic";
  const x = isTopic ? 25 : 575;
  const width = isTopic ? 225 : 300;
  const y = 20 + index * 42;
  const group = makeSvgElement("g", {
    class: `network-node ${type}`,
    role: "button",
    tabindex: "0",
    "aria-label": `${isTopic ? "Research topic" : "Research output"}: ${item.label}`,
    "aria-pressed": "false",
    "data-node-id": item.id,
    "data-node-type": type
  });
  group.appendChild(makeSvgElement("rect", { x, y, width, height: 28, rx: 2 }));
  const text = makeSvgElement("text", { x: x + 10, y: y + 19 });
  text.textContent = item.label;
  group.appendChild(text);

  group.addEventListener("click", () => selectNetworkNode(type, item.id));
  group.addEventListener("pointerenter", () => previewNetworkNode(type, item.id));
  group.addEventListener("pointerleave", restoreNetworkSelection);
  group.addEventListener("focus", () => previewNetworkNode(type, item.id));
  group.addEventListener("blur", restoreNetworkSelection);
  group.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectNetworkNode(type, item.id);
    }
  });
  network.appendChild(group);
}

function rebuildResearchNetwork(research = null) {
  if (research) {
    topics = research.topics.map((item) => ({ id: item.id, label: item.compact_title || item.title, detail: item.body || "" }));
    works = research.outputs
      .filter((item) => item.matrix !== false)
      .map((item) => ({ id: item.id, label: item.matrix_title || item.compact_title || item.title, detail: item.compact_body || item.body || "" }));
    connections = research.connections;
    topicById = Object.fromEntries(topics.map((topic) => [topic.id, topic]));
    workById = Object.fromEntries(works.map((work) => [work.id, work]));
  }
  network.querySelectorAll(".network-edge, .network-node").forEach((element) => element.remove());
  topics.forEach((topic, topicIndex) => {
    (connections[topic.id] || []).forEach((workId) => {
      const workIndex = works.findIndex((work) => work.id === workId);
      if (workIndex >= 0) addNetworkEdge(topic, topicIndex, works[workIndex], workIndex);
    });
  });
  topics.forEach((topic, index) => addNetworkNode(topic, index, "topic"));
  works.forEach((work, index) => addNetworkNode(work, index, "work"));
  setNetworkIdle();
}

function clearNetworkPresentation() {
  network.classList.remove("has-selection", "is-idle", "show-all");
  network.querySelectorAll(".selected, .connected").forEach((element) => {
    element.classList.remove("selected", "connected");
  });
  network.querySelectorAll("[aria-pressed]").forEach((element) => element.setAttribute("aria-pressed", "false"));
}

function setNetworkIdle() {
  selectedNode = null;
  showAllMode = false;
  clearNetworkPresentation();
  network.classList.add("is-idle");
  mapStatus.textContent = "Choose a topic or output, or show all connections.";
}

function showAllNetwork() {
  selectedNode = null;
  showAllMode = true;
  clearNetworkPresentation();
  network.classList.add("show-all");
  mapStatus.textContent = "Showing all connections.";
}

function renderNetworkNode(type, id, pressed = false) {
  clearNetworkPresentation();
  network.classList.add("has-selection");

  const selected = network.querySelector(`[data-node-type="${type}"][data-node-id="${id}"]`);
  selected.classList.add("selected");
  selected.setAttribute("aria-pressed", String(pressed));

  if (type === "topic") {
    const relatedWorks = connections[id];
    relatedWorks.forEach((workId) => {
      network.querySelector(`[data-node-type="work"][data-node-id="${workId}"]`).classList.add("connected");
      network.querySelector(`[data-topic="${id}"][data-work="${workId}"]`).classList.add("connected");
    });
    mapStatus.textContent = `${topicById[id].label} connects to ${relatedWorks.map((workId) => workById[workId].label).join(", ")}.`;
  } else {
    const relatedTopics = topics.filter((topic) => connections[topic.id].includes(id));
    relatedTopics.forEach((topic) => {
      network.querySelector(`[data-node-type="topic"][data-node-id="${topic.id}"]`).classList.add("connected");
      network.querySelector(`[data-topic="${topic.id}"][data-work="${id}"]`).classList.add("connected");
    });
    mapStatus.textContent = `${workById[id].label} connects to ${relatedTopics.map((topic) => topic.label).join(", ")}.`;
  }
}

function selectNetworkNode(type, id) {
  const key = `${type}:${id}`;
  if (selectedNode === key) {
    setNetworkIdle();
    return;
  }

  showAllMode = false;
  selectedNode = key;
  renderNetworkNode(type, id, true);
}

function previewNetworkNode(type, id) {
  renderNetworkNode(type, id, selectedNode === `${type}:${id}`);
}

function restoreNetworkSelection() {
  if (!selectedNode) {
    if (showAllMode) showAllNetwork();
    else setNetworkIdle();
    return;
  }

  const separator = selectedNode.indexOf(":");
  const type = selectedNode.slice(0, separator);
  const id = selectedNode.slice(separator + 1);
  renderNetworkNode(type, id, true);
}

resetMapButton.addEventListener("click", showAllNetwork);
rebuildResearchNetwork();

const keywordNetwork = document.querySelector("#keyword-network");
const keywordDetail = document.querySelector("#keyword-network-detail");
const keywordSectionLink = document.querySelector("#keyword-section-link");
const orbitBackButton = document.querySelector("#orbit-back");
const orbitBreadcrumbs = document.querySelector("#orbit-breadcrumbs");
const profileOrbit = document.querySelector("#profile-orbit");
const lifeReflectionPanel = document.querySelector("#life-reflection");
const orbitAvatarHome = document.querySelector("#orbit-avatar-home");
const orbitAvatarImages = [...document.querySelectorAll("[data-avatar-section]")];
const orbitAnchor = keywordNetwork.querySelector(".avatar-pulse");
const orbitCentre = { x: 430, y: 220 };
const orbitCategories = [
  { id: "research", label: "Research", section: "research" },
  { id: "publications", label: "Publications", section: "publications" },
  { id: "projects", label: "Projects", section: "projects" },
  { id: "teaching", label: "Teaching", section: "teaching" },
  { id: "experience", label: "Experience", section: "experience" },
  { id: "education", label: "Education", section: "background" },
  { id: "reflection", label: "Life Reflection", section: "keyword-navigator" }
].map((category, index, categories) => ({
  ...category,
  angle: -Math.PI / 2 + (Math.PI * 2 * index) / categories.length
}));

const orbitTopics = {
  research: [
    { label: "AI & Techno-Ethics", term: "ai-ethics" },
    { label: "HCI & Human–AI", term: "hci" },
    { label: "Requirements Engineering", term: "requirements-engineering" },
    { label: "Public Digitalisation", term: "public-digitalisation" }
  ],
  publications: [
    { label: "Generative AI & personas", children: [
      { label: "AI informants", term: "publication-informant" },
      { label: "Comparative evaluation", term: "publication-evaluation" }
    ] },
    { label: "Design justice & VSD", children: [
      { label: "Designing for justice", term: "publication-justice" },
      { label: "VSD system project", term: "publication-thesis" }
    ] },
    { label: "Data governance & citizen science", children: [
      { label: "Environmental citizen science", term: "publication-citizen" }
    ] },
    { label: "Participation & education", children: [
      { label: "Digital Mobilizer", term: "publication-mobilizer" },
      { label: "EcoClareza", term: "publication-ecoclareza" }
    ] },
    { label: "Privacy & surveillance", children: [
      { label: "Family location tracking", term: "publication-surveillance" }
    ] },
    { label: "AI systems in development", term: "publication-development" }
  ],
  teaching: [
    { label: "Python, R & Data/ML", selector: "#teaching .course:nth-child(1) h3" },
    { label: "Emerging Tech & AI Ethics", selector: "#teaching .course:nth-child(2) h3" },
    { label: "Digital Transformation", selector: "#teaching .course:nth-child(3) h3" },
    { label: "Green Transitions", selector: "#teaching .course:nth-child(4) h3" },
    { label: "IT Programme Management", selector: "#teaching .course:nth-child(5) h3" },
    { label: "Public Digitalisation", selector: "#teaching .course:nth-child(6) h3" },
    { label: "Process Automation", selector: "#teaching .course:nth-child(7) h3" },
    { label: "Complexity & Mapping", selector: "#teaching .course:nth-child(8) h3" },
    { label: "Analytics, STS & RRI", selector: "#teaching .course:nth-child(10) h3" }
  ],
  projects: [
    { label: "Academic", children: [
      { label: "Egalitarian", term: "egalitarian", children: [
        { label: "Ethnography", term: "ethnography" }, { label: "Co-design", term: "co-design" },
        { label: "Workshops", term: "workshops" }, { label: "Personas", term: "personas" },
        { label: "Scenarios", term: "scenarios" }, { label: "Value Sensitive Design", term: "value-sensitive-design" },
        { label: "Requirements elicitation", term: "requirements-elicitation" }, { label: "Academic writing", term: "academic-writing" }
      ] },
      { label: "Baby Balance", term: "baby-balance", children: [
        { label: "Digital health", term: "digital-health" }, { label: "Caregiving", term: "caregiving" },
        { label: "Tracking tool", term: "tracking-tool" }, { label: "Product development", term: "product-development" }
      ] }
    ] },
    { label: "Professional", children: [
      { label: "Axis · security technology", term: "axis-projects", children: [
        { label: "OSINT integration", term: "axis-osint" },
        { label: "CDR analysis", term: "axis-cdr" },
        { label: "EOD robotics", term: "axis-eod" },
        { label: "IMSI systems", term: "axis-imsi" },
        { label: "Speed detection", term: "axis-speed" }
      ] },
      { label: "BASIS · policy & sector", term: "basis-projects", children: [
        { label: "APICTA Awards", term: "basis-apicta" },
        { label: "AGM & annual publication", term: "basis-agm" },
        { label: "Japan–Bangladesh ICT", term: "basis-japan" },
        { label: "Ride-sharing policy", term: "basis-ridesharing" },
        { label: "Digital health", term: "basis-digital-health" },
        { label: "e-Procurement", term: "basis-eprocurement" }
      ] },
      { label: "Technolive · platforms", term: "it-projects", children: [
        { label: "Learning platforms", term: "technolive-lms" },
        { label: "Hospital systems", term: "technolive-hms" },
        { label: "ERP, CRM & inventory", term: "technolive-erp" },
        { label: "Public e-Procurement", term: "technolive-eprocurement" },
        { label: "AI & financial tools", term: "technolive-ai-fintech" }
      ] },
      { label: "BAT · EHS audit", term: "bat-ehs" }
    ] }
  ],
  experience: [
    { label: "Academic & research", children: [
      { label: "AAU Lecturer", term: "experience-aau" },
      { label: "ITU Assistant Lecturer", term: "experience-itu" },
      { label: "Egalitarian role", term: "experience-egalitarian" },
      { label: "DTU Teaching Assistant", term: "experience-dtu" }
    ] },
    { label: "Industry & practice", children: [
      { label: "TechLabs", term: "experience-techlabs" },
      { label: "Senior Engineer", term: "experience-technolive" },
      { label: "Business Development", term: "experience-axis" },
      { label: "BASIS", term: "experience-basis" },
      { label: "IT project portfolio", term: "experience-projects" }
    ] }
  ],
  education: [
    { label: "MSc Techno-Anthropology", selector: "#background .background-grid > div:nth-child(1) h3" },
    { label: "MS Information Systems", selector: "#background .background-grid > div:nth-child(2) h3" },
    { label: "BSc Electrical Engineering", selector: "#background .background-grid > div:nth-child(3) h3" }
  ]
};

let orbitRotation = 0;
let orbitSelected = null;
let orbitPaused = false;
let orbitSecondaryNodes = [];
let orbitSecondaryEdges = [];
let orbitTopicParent = null;
let orbitCurrentItems = [];
let orbitTrail = [];
let orbitSelectedLeaf = null;
let orbitAnimationTime = performance.now();
let orbitAvatarAnimationFrame = null;

function addOrbitLine(className = "orbit-edge") {
  const line = makeSvgElement("line", { class: className, "aria-hidden": "true" });
  keywordNetwork.insertBefore(line, orbitAnchor);
  return line;
}

function addOrbitNode(item, type) {
  const width = type === "primary" ? 126 : Math.max(96, Math.min(210, item.label.length * 6.1 + 24));
  const height = type === "primary" ? 40 : 30;
  const group = makeSvgElement("g", {
    class: `orbit-node ${type}`,
    role: "button",
    tabindex: "0",
    "aria-label": `${type === "primary" ? "Profile area" : "Related topic"}: ${item.label}`,
    "aria-pressed": "false"
  });
  group.appendChild(makeSvgElement("rect", { x: -width / 2, y: -height / 2, width, height, rx: type === "primary" ? 20 : 15 }));
  const label = makeSvgElement("text", { y: "0.36em" });
  label.textContent = item.label;
  group.appendChild(label);
  if (item.children) {
    group.classList.add("branch");
    group.appendChild(makeSvgElement("circle", { class: "orbit-branch-marker", cx: width / 2 - 10, cy: 0, r: 3.5 }));
  }
  group.addEventListener("pointerenter", () => {
    orbitPaused = true;
    profileOrbit.classList.add("is-paused");
  });
  group.addEventListener("pointerleave", () => {
    orbitPaused = false;
    profileOrbit.classList.remove("is-paused");
  });
  keywordNetwork.appendChild(group);
  return group;
}

const orbitCategoryElements = orbitCategories.map((category) => {
  const edge = addOrbitLine();
  const element = addOrbitNode(category, "primary");
  element.dataset.category = category.id;
  element.addEventListener("click", () => selectOrbitCategory(category.id));
  element.addEventListener("pointerenter", () => setOrbitAvatar(category.id, { preview: true, animate: false }));
  element.addEventListener("pointerleave", () => setOrbitAvatar(orbitSelected || "home", { animate: false }));
  element.addEventListener("focus", () => setOrbitAvatar(category.id, { preview: true, animate: false }));
  element.addEventListener("blur", () => setOrbitAvatar(orbitSelected || "home", { animate: false }));
  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectOrbitCategory(category.id);
    }
  });
  return { category, edge, element, x: 0, y: 0 };
});

function clearOrbitSecondary() {
  orbitSecondaryNodes.forEach(({ element }) => element.remove());
  orbitSecondaryEdges.forEach((edge) => edge.remove());
  orbitSecondaryNodes = [];
  orbitSecondaryEdges = [];
  orbitCategoryElements.forEach(({ element }) => element.classList.remove("selected", "related"));
}

function updateOrbitStatus(title, copy, section) {
  keywordDetail.querySelector("p").replaceChildren();
  const strong = document.createElement("strong");
  strong.textContent = `${title}.`;
  keywordDetail.querySelector("p").append(strong, ` ${copy}`);
  keywordSectionLink.href = `#${section}`;
  const category = orbitCategories.find((item) => item.id === section || item.section === section);
  keywordSectionLink.textContent = `Open ${category ? category.label.toLowerCase() : section} →`;
}

function setOrbitAvatar(section = "home", { preview = false, animate = true } = {}) {
  const hasSectionImage = orbitAvatarImages.some((image) => image.dataset.avatarSection === section);
  const avatarSection = hasSectionImage ? section : "home";
  orbitAvatarImages.forEach((image) => image.classList.toggle("is-active", image.dataset.avatarSection === avatarSection));
  profileOrbit.dataset.activeSection = section;
  profileOrbit.classList.toggle("is-avatar-preview", preview);
  if (orbitAvatarAnimationFrame) cancelAnimationFrame(orbitAvatarAnimationFrame);
  profileOrbit.classList.remove("avatar-just-changed");
  if (animate && !reduceOrbitMotion) {
    orbitAvatarAnimationFrame = requestAnimationFrame(() => {
      orbitAvatarAnimationFrame = requestAnimationFrame(() => profileOrbit.classList.add("avatar-just-changed"));
    });
  }
}

function openOrbitContext(contexts, index) {
  const selectedCategory = orbitCategories.find(({ id }) => id === orbitSelected);
  const context = contexts[index];
  orbitSelectedLeaf = null;
  orbitTrail = contexts.slice(0, index).map((item) => ({ items: item.items, parent: item.parent }));
  renderOrbitTopics(context.items, context.parent);
  updateOrbitStatus(selectedCategory.label, index === 0 ? "Choose a route." : `${context.parent.label} routes are visible.`, selectedCategory.section);
}

function updateOrbitBreadcrumbs() {
  orbitBreadcrumbs.replaceChildren();
  const home = document.createElement("button");
  home.type = "button";
  home.className = `orbit-crumb${orbitSelected ? "" : " current"}`;
  home.textContent = "Home";
  home.setAttribute("aria-current", orbitSelected ? "false" : "page");
  home.addEventListener("click", resetOrbit);
  orbitBreadcrumbs.append(home);

  if (!orbitSelected) return;
  const selectedCategory = orbitCategories.find(({ id }) => id === orbitSelected);
  const contexts = [...orbitTrail, { items: orbitCurrentItems, parent: orbitTopicParent }];
  contexts.forEach((context, index) => {
    const separator = document.createElement("span");
    separator.className = "orbit-crumb-separator";
    separator.textContent = "/";
    separator.setAttribute("aria-hidden", "true");
    orbitBreadcrumbs.append(separator);

    const crumb = document.createElement("button");
    crumb.type = "button";
    crumb.className = `orbit-crumb${index === contexts.length - 1 && !orbitSelectedLeaf ? " current" : ""}`;
    crumb.textContent = index === 0 ? selectedCategory.label : context.parent.label;
    if (index === contexts.length - 1 && !orbitSelectedLeaf) crumb.setAttribute("aria-current", "page");
    crumb.addEventListener("click", () => openOrbitContext(contexts, index));
    orbitBreadcrumbs.append(crumb);
  });

  if (orbitSelectedLeaf) {
    const separator = document.createElement("span");
    separator.className = "orbit-crumb-separator";
    separator.textContent = "/";
    separator.setAttribute("aria-hidden", "true");
    const leaf = document.createElement("span");
    leaf.className = "orbit-crumb current";
    leaf.textContent = orbitSelectedLeaf.label;
    leaf.setAttribute("aria-current", "page");
    orbitBreadcrumbs.append(separator, leaf);
  }
}

function resetOrbit() {
  orbitSelected = null;
  orbitTopicParent = null;
  orbitCurrentItems = [];
  orbitTrail = [];
  orbitSelectedLeaf = null;
  orbitBackButton.hidden = true;
  lifeReflectionPanel.hidden = true;
  keywordSectionLink.hidden = false;
  profileOrbit.classList.remove("has-category-selection");
  document.querySelectorAll(".term-highlight").forEach((item) => item.classList.remove("term-highlight"));
  setOrbitAvatar("home", { animate: true });
  clearOrbitSecondary();
  orbitCategoryElements.forEach(({ element, edge }) => {
    element.setAttribute("aria-pressed", "false");
    edge.classList.remove("dimmed");
  });
  updateOrbitStatus("Choose a section", "Seven pathways provide a visual index to the website.", "research");
  updateOrbitBreadcrumbs();
}

function activateProfileTarget(topic) {
  document.querySelectorAll(".term-highlight").forEach((item) => item.classList.remove("term-highlight"));
  const selector = topic.term ? `[data-profile-term="${topic.term}"]` : topic.selector;
  const target = document.querySelector(selector);
  if (!target) return;

  if (target.closest("#publications")) setPublicationsExpanded(true);
  if (target.closest("#more-academic-projects")) setAcademicExpanded(true);
  if (target.closest("#professional-projects")) showProjectPanel("professional-projects");
  else if (target.closest("#academic-projects")) showProjectPanel("academic-projects");
  const experiencePanel = target.closest(".experience-panel");
  if (experiencePanel) showExperiencePanel(experiencePanel.id);
  if (target.closest("#teaching")) {
    activeCourseFilter = "all";
    coursesExpanded = true;
    courseButtons.forEach((button) => {
      const active = button.dataset.courseFilter === "all";
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderCourses();
  }
  const extraExperience = target.closest("[data-experience-extra]");
  if (extraExperience) setExperienceExpanded(extraExperience.dataset.experienceExtra, true);
  if (target.matches(".domain-tab")) target.click();

  target.classList.add("term-highlight");
  const section = target.closest("section");
  if (section) history.replaceState(null, "", `#${section.id}`);
  requestAnimationFrame(() => target.scrollIntoView({ behavior: reduceOrbitMotion ? "auto" : "smooth", block: "center" }));
}

function renderOrbitTopics(items, parent = null) {
  orbitSecondaryNodes.forEach(({ element }) => element.remove());
  orbitSecondaryEdges.forEach((edge) => edge.remove());
  orbitSecondaryNodes = [];
  orbitSecondaryEdges = [];
  orbitTopicParent = parent;
  orbitCurrentItems = items;
  orbitBackButton.hidden = orbitTrail.length === 0;

  items.forEach((topic, index) => {
    const edge = addOrbitLine("orbit-edge topic-edge");
    const element = addOrbitNode(topic, "secondary");
    const choose = () => selectOrbitTopic(topic, element);
    element.addEventListener("click", choose);
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        choose();
      }
    });
    orbitSecondaryNodes.push({ topic, index, element, edge, x: 0, y: 0, phase: index * 1.73 + items.length * 0.37 });
    orbitSecondaryEdges.push(edge);
  });
  renderOrbit();
  updateOrbitBreadcrumbs();
}

function selectOrbitTopic(topic, element) {
  orbitSecondaryNodes.forEach(({ element: candidate }) => candidate.classList.toggle("selected", candidate === element));
  if (topic.children) {
    orbitSelectedLeaf = null;
    orbitTrail.push({ items: orbitCurrentItems, parent: orbitTopicParent });
    renderOrbitTopics(topic.children, topic);
    updateOrbitStatus(topic.label, `${topic.children.length} connected topics are ready to explore.`, orbitSelected);
    return;
  }
  orbitSelectedLeaf = topic;
  updateOrbitBreadcrumbs();
  updateOrbitStatus(topic.label, "Opening the exact place where this appears.", orbitSelected);
  activateProfileTarget(topic);
}

function selectOrbitCategory(id) {
  if (orbitSelected === id && !orbitTopicParent) {
    resetOrbit();
    return;
  }

  orbitSelected = id;
  orbitTrail = [];
  orbitSelectedLeaf = null;
  orbitTopicParent = null;
  orbitCurrentItems = [];
  lifeReflectionPanel.hidden = true;
  keywordSectionLink.hidden = false;
  clearOrbitSecondary();
  profileOrbit.classList.add("has-category-selection");
  setOrbitAvatar(id, { animate: true });
  const selectedCategory = orbitCategories.find((category) => category.id === id);
  orbitCategoryElements.forEach(({ category, element, edge }) => {
    const selected = category.id === id;
    element.classList.toggle("selected", selected);
    element.setAttribute("aria-pressed", String(selected));
    edge.classList.toggle("dimmed", !selected);
  });

  if (id === "reflection") {
    orbitBackButton.hidden = true;
    lifeReflectionPanel.hidden = false;
    keywordSectionLink.hidden = true;
    updateOrbitBreadcrumbs();
    updateOrbitStatus("Life Reflection", "A pause for the life that happens around the work.", selectedCategory.section);
    keywordSectionLink.hidden = true;
    return;
  }

  renderOrbitTopics(orbitTopics[id]);
  updateOrbitStatus(selectedCategory.label, `${orbitTopics[id].length} clear routes are now visible. Choose one to jump to it.`, selectedCategory.section);
}

orbitBackButton.addEventListener("click", () => {
  if (!orbitSelected || orbitTrail.length === 0) return;
  const parentLabel = orbitTopicParent?.label;
  const selectedCategory = orbitCategories.find(({ id }) => id === orbitSelected);
  const previous = orbitTrail.pop();
  orbitSelectedLeaf = null;
  renderOrbitTopics(previous.items, previous.parent);
  updateOrbitStatus(selectedCategory.label, parentLabel ? `Back from ${parentLabel}. Choose another route.` : "Choose a route.", selectedCategory.section);
});

orbitAvatarHome.addEventListener("click", resetOrbit);
orbitAvatarHome.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    resetOrbit();
  }
});

function renderOrbit(time = orbitAnimationTime) {
  orbitCategoryElements.forEach((entry, index) => {
    const angle = entry.category.angle + orbitRotation;
    const radiusX = 188 + Math.sin(time * 0.0011 + index) * 6;
    const radiusY = 126 + Math.cos(time * 0.0013 + index * 0.8) * 5;
    entry.x = orbitCentre.x + Math.cos(angle) * radiusX;
    entry.y = orbitCentre.y + Math.sin(angle) * radiusY;
    entry.element.setAttribute("transform", `translate(${entry.x.toFixed(2)} ${entry.y.toFixed(2)})`);
    entry.edge.setAttribute("x1", orbitCentre.x);
    entry.edge.setAttribute("y1", orbitCentre.y);
    entry.edge.setAttribute("x2", entry.x.toFixed(2));
    entry.edge.setAttribute("y2", entry.y.toFixed(2));
  });

  if (!orbitSelected) return;
  const source = orbitCategoryElements.find(({ category }) => category.id === orbitSelected);
  const total = orbitSecondaryNodes.length;
  orbitSecondaryNodes.forEach((entry) => {
    const startAngle = total === 2 ? Math.PI : -Math.PI / 2;
    const angle = startAngle + orbitRotation * 0.34 + (Math.PI * 2 * entry.index) / total;
    const driftX = Math.cos(time * 0.00145 + entry.phase) * 11;
    const driftY = Math.sin(time * 0.0017 + entry.phase) * 8;
    entry.x = orbitCentre.x + Math.cos(angle) * 320 + driftX;
    entry.y = orbitCentre.y + Math.sin(angle) * 176 + driftY;
    entry.element.setAttribute("transform", `translate(${entry.x.toFixed(2)} ${entry.y.toFixed(2)})`);
    entry.edge.setAttribute("x1", source.x.toFixed(2));
    entry.edge.setAttribute("y1", source.y.toFixed(2));
    entry.edge.setAttribute("x2", entry.x.toFixed(2));
    entry.edge.setAttribute("y2", entry.y.toFixed(2));
  });
}

profileOrbit.addEventListener("pointerleave", () => {
  orbitPaused = false;
  profileOrbit.classList.remove("is-paused");
});

let previousOrbitTime = performance.now();
const reduceOrbitMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateOrbit(time) {
  const elapsed = Math.min(40, time - previousOrbitTime);
  previousOrbitTime = time;
  orbitAnimationTime = time;
  if (!orbitPaused && !reduceOrbitMotion) orbitRotation += elapsed * 0.00036;
  renderOrbit(time);
  requestAnimationFrame(animateOrbit);
}

renderOrbit();
setOrbitAvatar("home", { animate: false });
updateOrbitBreadcrumbs();
requestAnimationFrame(animateOrbit);

const morePublicationContent = document.querySelector("#more-publication-content");
const togglePublicationsButton = document.querySelector("#toggle-publications");

function setPublicationsExpanded(expanded) {
  togglePublicationsButton.setAttribute("aria-expanded", String(expanded));
  morePublicationContent.hidden = !expanded;
  document.querySelectorAll("[data-publication-extra]").forEach((item) => { item.hidden = !expanded; });
  togglePublicationsButton.textContent = expanded ? "See less" : "See more publications";
}

togglePublicationsButton.addEventListener("click", () => {
  setPublicationsExpanded(togglePublicationsButton.getAttribute("aria-expanded") !== "true");
});

const toggleResearchMapButton = document.querySelector("#toggle-research-map");
const researchMap = document.querySelector("#research-map");

toggleResearchMapButton.addEventListener("click", () => {
  const expanded = toggleResearchMapButton.getAttribute("aria-expanded") !== "true";
  toggleResearchMapButton.setAttribute("aria-expanded", String(expanded));
  researchMap.hidden = !expanded;
  toggleResearchMapButton.querySelector(".map-reveal-label").textContent = expanded ? "Close the connection map ↑" : "Trace the research connections →";
});

const projectTabs = [...document.querySelectorAll("[data-project-panel]")];
const projectPanels = [...document.querySelectorAll(".project-panel")];
const moreAcademicProjects = document.querySelector("#more-academic-projects");
const toggleAcademicProjectsButton = document.querySelector("#toggle-academic-projects");

function showProjectPanel(panelId) {
  projectPanels.forEach((panel) => { panel.hidden = panel.id !== panelId; });
  projectTabs.forEach((tab) => {
    const active = tab.dataset.projectPanel === panelId;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

function setAcademicExpanded(expanded) {
  moreAcademicProjects.hidden = !expanded;
  toggleAcademicProjectsButton.setAttribute("aria-expanded", String(expanded));
  toggleAcademicProjectsButton.textContent = expanded ? "See less" : "See more academic projects";
}

projectTabs.forEach((tab) => tab.addEventListener("click", () => showProjectPanel(tab.dataset.projectPanel)));
toggleAcademicProjectsButton.addEventListener("click", () => {
  setAcademicExpanded(toggleAcademicProjectsButton.getAttribute("aria-expanded") !== "true");
});

const experienceTabs = [...document.querySelectorAll("[data-experience-panel]")];
const experiencePanels = [...document.querySelectorAll(".experience-panel")];
const experienceToggleButtons = [...document.querySelectorAll("[data-experience-toggle]")];

function showExperiencePanel(panelId) {
  experiencePanels.forEach((panel) => { panel.hidden = panel.id !== panelId; });
  experienceTabs.forEach((tab) => {
    const active = tab.dataset.experiencePanel === panelId;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

function setExperienceExpanded(type, expanded) {
  document.querySelectorAll(`[data-experience-extra="${type}"]`).forEach((item) => { item.hidden = !expanded; });
  const button = document.querySelector(`[data-experience-toggle="${type}"]`);
  button.setAttribute("aria-expanded", String(expanded));
  const label = type === "academic" ? "academic experience" : "industry experience";
  button.textContent = expanded ? `See less ${label}` : `See more ${label}`;
}

experienceTabs.forEach((tab) => tab.addEventListener("click", () => showExperiencePanel(tab.dataset.experiencePanel)));
experienceToggleButtons.forEach((button) => button.addEventListener("click", () => {
  setExperienceExpanded(button.dataset.experienceToggle, button.getAttribute("aria-expanded") !== "true");
}));

function setupSectionDisclosure(buttonSelector, itemSelector, openLabel, closedLabel) {
  const button = document.querySelector(buttonSelector);
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(expanded));
    document.querySelectorAll(itemSelector).forEach((item) => { item.hidden = !expanded; });
    button.textContent = expanded ? openLabel : closedLabel;
  });
}

setupSectionDisclosure("#toggle-updates", "[data-update-extra]", "Show fewer updates", "Show all updates");

const visitorCounter = document.querySelector("#visitor-counter");
const visitorCountValue = document.querySelector("#visitor-count-value");
const visitorCountLabel = document.querySelector("#visitor-count-label");
const isLocalPreview = location.protocol === "file:" || location.hostname === "127.0.0.1" || location.hostname === "localhost";
const counterCacheKey = "rabbi-profile-last-visit-count";

function readCachedVisitorCount() {
  try {
    const count = Number(localStorage.getItem(counterCacheKey));
    return Number.isFinite(count) && count > 0 ? count : null;
  } catch {
    return null;
  }
}

function showVisitorCount(count, cached = false) {
  visitorCounter.hidden = false;
  visitorCountValue.textContent = count.toLocaleString();
  visitorCountLabel.textContent = "page visits";
  visitorCounter.title = cached ? "Last available page-visit count; updating in the background" : "Counts page visits, not unique people";
}

async function requestVisitorCount(url) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error("Counter unavailable");
    const data = await response.json();
    const count = Number(data.count ?? data.value);
    if (!Number.isFinite(count)) throw new Error("Invalid counter response");
    return count;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function updateVisitorCounter() {
  if (isLocalPreview) {
    visitorCountValue.textContent = "Counter";
    visitorCountLabel.textContent = "starts when published";
    visitorCounter.title = "The page-visit counter activates after the website is published";
    return;
  }

  const counterBase = "https://api.counterapi.dev/v1/lutfor-rahman-rabbi-profile/page-visits/";
  const cachedCount = readCachedVisitorCount();
  if (cachedCount !== null) showVisitorCount(cachedCount, true);
  else {
    visitorCounter.hidden = false;
    visitorCountValue.textContent = "…";
    visitorCountLabel.textContent = "page visits";
    visitorCounter.title = "Updating the page-visit count";
  }

  let countedThisSession = false;
  try {
    countedThisSession = sessionStorage.getItem("rabbi-profile-visit-counted") === "yes";
  } catch {
    // The public count still works when a browser blocks session storage.
  }

  try {
    let count;
    try {
      count = await requestVisitorCount(countedThisSession ? counterBase : `${counterBase}up/`);
    } catch {
      // If incrementing was slow or rate-limited, retrieve the current value without incrementing again.
      count = await requestVisitorCount(counterBase);
    }

    showVisitorCount(count);
    try {
      localStorage.setItem(counterCacheKey, String(count));
    } catch {
      // The live value remains visible when persistent storage is blocked.
    }
    try {
      sessionStorage.setItem("rabbi-profile-visit-counted", "yes");
    } catch {
      // Do not hide a valid count when storage is unavailable.
    }
  } catch {
    visitorCounter.hidden = false;
    if (cachedCount === null) {
      visitorCountValue.textContent = "—";
      visitorCountLabel.textContent = "visits temporarily unavailable";
      visitorCounter.title = "The counter service is temporarily unavailable";
    }
  }
}

updateVisitorCounter();

document.querySelector("#current-year").textContent = new Date().getFullYear();

const siteGoTop = document.querySelector("#site-go-top");
if (siteGoTop) {
  const mobileGoTop = window.matchMedia("(max-width: 760px)");
  const updateGoTop = () => siteGoTop.classList.toggle("is-visible", mobileGoTop.matches && window.scrollY > 360);
  window.addEventListener("scroll", updateGoTop, { passive: true });
  mobileGoTop.addEventListener?.("change", updateGoTop);
  siteGoTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
  updateGoTop();
}

const navLinks = [...navigation.querySelectorAll('a[href^="#"]')];
const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!current) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${current.target.id}`;
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-25% 0px -65%", threshold: [0.01, 0.2] }
  );
  sections.forEach((section) => sectionObserver.observe(section));
}
