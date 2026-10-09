/* RAHIN interactions. Content lives in content.js. No framework or network required. */
"use strict";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const local = (en, fa) => (state.lang === "fa" ? fa : en);
const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function readLanguage() {
  try {
    return (localStorage.getItem("rahin-lang") || localStorage.getItem("nexus-lang")) === "fa" ? "fa" : "en";
  } catch {
    return "en";
  }
}
const state = {
  lang: readLanguage(),
  challenge: "unclear",
  role: null,
  method: 0,
  journey: 0,
  opener: null,
  modal: null,
};
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const mobileLayout = matchMedia("(max-width: 700px)");
const methodColors = [
  "green",
  "blue",
  "purple",
  "orange",
  "pink",
  "green",
  "blue",
];
const outputs = [
  ["An agreed project brief", "شرح پروژه‌ی مورد توافق"],
  ["Assumptions and constraint map", "نقشه‌ی فرض‌ها و محدودیت‌ها"],
  ["A shortlist of possible directions", "فهرست کوتاه مسیرهای ممکن"],
  ["A concept sketch and an experience flow", "طرح مفهومی و جریان تجربه"],
  ["A small, testable prototype", "نمونه‌ی اولیه‌ی کوچک و قابل آزمایش"],
  [
    "Review notes and agreed changes",
    "گزارش بررسی و تغییرات توافق‌شده",
  ],
  ["Feedback log and the next experiment", "فهرست بازخورد و آزمایش بعدی"],
];
const methodRoles = [
  ["analyst", "coordinator"],
  ["analyst", "executor"],
  ["visionary", "creative"],
  ["creative", "visionary"],
  ["executor", "creative"],
  ["coordinator", "executor"],
  ["analyst", "visionary", "creative", "executor", "coordinator"],
];
const journeyDescriptions = [["What is included, and what needs a separate decision.", "چه کارهایی در پروژه قرار می‌گیرند و چه مواردی به تصمیم جداگانه نیاز دارند."], ["What will be ready at each review, and in which format.", "در هر مرحله چه چیزی، با چه قالبی برای بررسی آماده می‌شود."], ["Who follows up, who reviews and who makes each decision.", "چه کسی پیگیری می‌کند، چه کسی بررسی می‌کند و تصمیم نهایی با چه کسی است."], ["Milestones, review time and dependencies on your team.", "زمان نقاط اصلی پروژه، فرصت بازبینی و وابستگی به اطلاعات یا تصمیم‌های شما."], ["How we will check the output against the agreed needs.", "خروجی را چطور با نیازها و معیارهای توافق‌شده می‌سنجیم."], ["Files, documentation and any support agreed for after delivery.", "فایل‌ها، مستندات و پشتیبانی احتمالی پس از تحویل که از قبل درباره‌اش توافق می‌شود."]];
const challengePaths = {
  unclear: {
    order: ["analyst", "visionary", "creative", "coordinator", "executor"],
    actions: [
      ["Define the requirements", "تعریف نیازها"],
      ["Compare options", "مقایسه‌ی گزینه‌ها"],
      ["Explore alternatives", "کشف راه‌های جایگزین"],
      ["Align next steps", "هماهنگی قدم‌ها"],
      ["Test a first version", "آزمودن نسخه‌ی اولیه"],
    ],
    note: [
      "Suggested first output: a brief with the scope, users and evaluation criteria.",
      "خروجی اولیه‌ی پیشنهادی: شرح پروژه شامل دامنه‌ی کار، کاربران و معیار ارزیابی.",
    ],
  },
  ambitious: {
    order: ["visionary", "analyst", "creative", "coordinator", "executor"],
    actions: [
      ["Define the goal", "تعیین هدف"],
      ["Test assumptions", "سنجش فرض‌ها"],
      ["Shape the experience", "شکل دادن تجربه"],
      ["Sequence the work", "ترتیب دادن کارها"],
      ["Build a first proof", "ساخت اولین نمونه"],
    ],
    note: [
      "Suggested first output: a small prototype to evaluate the main idea.",
      "خروجی اولیه‌ی پیشنهادی: یک نمونه‌ی کوچک برای بررسی ایده‌ی اصلی.",
    ],
  },
  messy: {
    order: ["coordinator", "analyst", "visionary", "creative", "executor"],
    actions: [
      ["Map the current process", "شناخت فرآیند فعلی"],
      ["Map the bottlenecks", "شناسایی گلوگاه‌ها"],
      ["Set priorities", "تعیین اولویت‌ها"],
      ["Simplify the process", "ساده‌سازی فرآیند"],
      ["Move the next piece", "اجرای قدم بعدی"],
    ],
    note: [
      "Suggested first output: a map of the current process and a prioritized improvement plan.",
      "خروجی اولیه‌ی پیشنهادی: نقشه‌ی فرآیند فعلی و فهرست اولویت‌های بهبود.",
    ],
  },
};
const resolveRole = (id) => roles.find((role) => role.id === id);
const number = (n) => String(n).padStart(2, "0");
const fact = (label, value) =>
  `<div class="modal-fact"><span>${label}</span><p>${value}</p></div>`;

function animateUpdate(element, delay = 0) {
  if (reducedMotion.matches || !element.animate) return;
  element.getAnimations().forEach(animation => animation.cancel());
  element.animate([
    { opacity: .25, transform: 'translate3d(0,8px,0)' },
    { opacity: 1, transform: 'translate3d(0,0,0)' }
  ], { duration: 460, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
}

function renderPeople() {
  $('[data-people-grid]').innerHTML = members.map((member,index) => `<article class="person-card reveal person-${member.tone}">
    <span class="person-index"><bdi>${number(index+1)}</bdi></span>
    <img class="person-avatar" src="${member.avatar}" width="100" height="100" alt="" loading="lazy">
    <h3>${local(member.latin,member.name)}</h3>
    <p class="person-tagline">${local(member.line, member.faLine)}</p>
    <p class="person-contribution">${local(member.bio,member.faBio)}</p>
  </article>`).join('');
}

function renderRoles() {
  $('[data-role-grid]').innerHTML=roles.map((role,index)=>`<article class="role-panel reveal role-${role.id}"><span class="role-panel-index" dir="ltr">${number(index+1)}</span><div><h3>${local(role.service,role.faService)}</h3><p>${local(role.description,role.faDescription)}</p></div><div class="role-fact"><span>${local('Typical output','خروجی پیشنهادی')}</span><strong>${local(role.output,role.faOutput)}</strong></div></article>`).join('');
}

function renderMethod() {
  $("[data-method-track]").innerHTML = methods
    .map(
      (step, index) =>
        `<article class="method-step reveal color-${methodColors[index]}"><button type="button" data-method="${index}" aria-pressed="${state.method === index}"><span class="method-dot" aria-hidden="true"></span><span>${number(index + 1)}</span><strong>${local(step[0], step[1])}</strong></button><p>${local(step[2], step[3])}</p></article>`,
    )
    .join("");
  updateMethod(state.method);
  $("[data-cycle-note]").textContent = local(
    "Review may take us back to an earlier step. Coordination continues throughout the project.",
    "ممکن است پس از بررسی، به مرحله‌ی قبل برگردیم. هماهنگی و پیگیری در تمام مسیر ادامه دارد.",
  );
}
function updateMethod(index) {
  state.method = index;
  $$("[data-method]").forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(Number(button.dataset.method) === index),
    ),
  );
  $("[data-method-detail]").innerHTML =
    `<span class="eyebrow">${local("EXPECTED OUTPUT", "خروجی مورد انتظار")}</span><h3>${local(...outputs[index])}</h3><p>${local("Work involved: ", "فعالیت‌های مرتبط: ")}${methodRoles[index].map((id) => local(resolveRole(id).service,resolveRole(id).faService)).join(" · ")}</p>`;
}
function renderCases() {
  $("[data-cases-grid]").innerHTML = cases
    .map(
      (item, index) =>
        `<article class="case-card reveal"><div class="case-art case-art-${index}" aria-hidden="true"><span></span><span></span><span></span><b>${item.number}</b></div><div class="case-top"><span>${item.number} / ${local("CASE", "نمونه")}</span><span class="case-status">${local("CONCEPT STUDY", "نمونه‌ی مفهومی")}</span></div><h3>${local(item.title, item.faTitle)}</h3><p>${local(item.description, item.faDescription)}</p><button class="case-link" type="button" data-case="${index}">${local("Read the approach", "ببینید چطور پیش می‌رویم")} <span aria-hidden="true">↗</span></button></article>`,
    )
    .join("");
}
function renderJourney() {
  $("[data-journey-note]").textContent = local(
    "These are the points we clarify before committing to a project.",
    "این موارد پیش از توافق نهایی مشخص می‌شوند تا انتظارها و مسئولیت‌ها روشن باشند.",
  );
  $("[data-journey-line]").innerHTML = journey
    .map(
      (point, index) =>
        `<article class="journey-point reveal ${index === state.journey ? "active" : ""}"><span>${point[0]}</span><button type="button" data-journey="${index}" aria-pressed="${index === state.journey}">${local(point[1], point[2])}</button><span class="journey-indicator" aria-hidden="true">+</span></article>`,
    )
    .join("");
  updateJourney(state.journey);
}
function updateJourney(index) {
  state.journey = index;
  $$("[data-journey]").forEach((button) => {
    const active = Number(button.dataset.journey) === index;
    button.setAttribute("aria-pressed", String(active));
    button.closest("article").classList.toggle("active", active);
  });
  $("[data-journey-detail]").textContent = local(...journeyDescriptions[index]);
  animateUpdate($("[data-journey-detail]"));
}
function renderFlow() {
  const path = challengePaths[state.challenge];
  $$("[data-challenge]").forEach((button) => {
    const active = button.dataset.challenge === state.challenge;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  $("[data-reactor-label]").textContent =
    translations[state.lang][`challenge.${state.challenge}.title`];
  $("[data-reactor-flow]").innerHTML = path.order
    .map(
      (id, index) =>
        `<div class="flow-step role-${id}"><button class="flow-icon" type="button" data-flow-role="${id}" aria-label="${local(resolveRole(id).service,resolveRole(id).faService)}">${number(index + 1)}</button><strong>${local(resolveRole(id).service,resolveRole(id).faService)}</strong><small>${local(...path.actions[index])}</small></div>`,
    )
    .join("");
  $("[data-reactor-note]").textContent = local(...path.note);
  $$(".flow-step").forEach((step, index) => animateUpdate(step, index * 55));
}
function selectRole(id) {
  state.role = id;
  const role = resolveRole(id);
  $$("[data-role-node]").forEach((button) => {
    const active = button.dataset.roleNode === id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  $$("[data-line]").forEach((line) =>
    line.classList.toggle("active", line.dataset.line === id),
  );
  $("[data-network-caption]").textContent =
    `${local(role.service,role.faService)}: ${local(role.description, role.faDescription)}`;
}
function renderContact() {
  $('[data-brief-open]').textContent=local('Prepare a project overview ↗','شرح پروژه را آماده کنید ↖');
  $('[data-contact-note]').textContent=local('This form prepares a downloadable file. It does not send a message.','این فرم یک فایل قابل دانلود آماده می‌کند و پیامی ارسال نمی‌کند.');
  $('[data-contact-links]').innerHTML=`<a href="output/pdf/RAHIN-Team-Portfolio-FA.pdf" download>${local('Download team profile · PDF','دانلود معرفی تیم · <bdi>PDF</bdi>')} <span aria-hidden="true">↓</span></a>`;
}

function applyLanguage() {
  revealObserver?.disconnect();
  $("[data-member-count]").textContent = number(members.length);
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === "fa" ? "rtl" : "ltr";
  document.title = local(
    "RAHIN — Research, design & development",
    "راهین — تحلیل، طراحی و توسعه",
  );
  $$("[data-i18n]").forEach((element) => {
    element.innerHTML =
      translations[state.lang][element.dataset.i18n] ||
      translations.en[element.dataset.i18n] ||
      "";
  });
  $("[data-language-toggle]").textContent = local("فا", "EN");
  $("[data-language-toggle]").setAttribute(
    "aria-label",
    local("تغییر زبان به فارسی", "Switch language to English"),
  );
  $(".nav").setAttribute(
    "aria-label",
    local("Primary navigation", "ناوبری اصلی"),
  );
  $(".hero-visual").setAttribute(
    "aria-label",
    local("Explore our areas of work", "آشنایی با حوزه‌های همکاری"),
  );
  $(".reactor-choices").setAttribute(
    "aria-label",
    local("Choose a challenge", "انتخاب نوع چالش"),
  );
  $("[data-modal-close]").setAttribute(
    "aria-label",
    local("Close dialog", "بستن پنجره"),
  );
  $("[data-back-top]").setAttribute(
    "aria-label",
    local("Back to top", "بازگشت به بالا"),
  );
  $("[data-brand-promise]").textContent = local(
    "A clear scope. Regular reviews. An agreed next step.",
    "دامنه‌ی مشخص، بررسی منظم، قدم بعدی روشن.",
  );
  $$("[data-role-node]").forEach((button) => {
    const role=resolveRole(button.dataset.roleNode);
    $("strong", button).textContent=local(role.service,role.faService);
  });
  renderPeople();
  renderRoles();
  renderMethod();
  renderCases();
  renderJourney();
  renderFlow();
  renderContact();
  if (state.role) selectRole(state.role);
  else $("[data-network-caption]").textContent = translations[state.lang]["network.caption"];
  $("meta[name=description]").content = translations[state.lang]["hero.lede"];
  observeReveals();
  syncMenu();
  $("[data-menu-toggle]").setAttribute("aria-label", $("[data-menu-toggle]").getAttribute("aria-expanded") === "true" ? local("Close menu", "بستن منو") : local("Open menu", "باز کردن منو"));
  syncMotionPreference();
}
const modal = $("[data-modal]");
function openModal(html, opener) {
  state.opener = opener || document.activeElement;
  $("[data-modal-content]").innerHTML = html;
  modal.showModal();
  document.body.classList.add("dialog-open");
  $(".modal-inner").scrollTop = 0;
  $("[data-modal-close]").focus({ preventScroll: true });
}
function closeModal() {
  if (modal.open) modal.close();
}
modal.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  state.opener?.focus({ preventScroll: true });
  state.modal = null;
});
// Native dialog supplies the inert background and Escape. Explicit wrapping
// also retains focus when the only focusable element is the close button.
modal.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const controls = $$(
    "button:not([disabled]), a[href], input, textarea, select, [tabindex='0']",
    modal,
  );
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
modal.addEventListener("click", (event) => {
  if (event.target !== modal) return;
  const box = modal.getBoundingClientRect();
  if (
    event.clientX < box.left ||
    event.clientX > box.right ||
    event.clientY < box.top ||
    event.clientY > box.bottom
  )
    closeModal();
});
function openCase(index, opener) {
  const item = cases[index];
  const details = caseDetails[index];
  openModal(
    `<span class="modal-kicker">${item.number} / ${local(item.category, item.faCategory)}</span><h2 id="modal-title">${local(item.title, item.faTitle)}</h2><p class="modal-lede">${local(item.description, item.faDescription)}</p><p class="content-note">${local("Concept study · proposed approach and deliverables.", "نمونه‌ی مفهومی · رویکرد و خروجی‌های پیشنهادی.")}</p><div class="modal-facts">${details.map((row) => fact(local(row[0], row[1]), local(row[2], row[3]))).join("")}</div>`,
    opener,
  );
}

function openBrief(opener) {
  openModal(
    `<span class="modal-kicker">${local("PROJECT OVERVIEW", "شرح اولیه‌ی پروژه")}</span><h2 id="modal-title">${local("A few details to start.", "چند نکته برای شروع همکاری.")}</h2><p class="modal-lede">${local("Describe the project in a few sentences. You can download the overview and share it later. This form does not send a request.", "پروژه را در چند جمله توضیح دهید. می‌توانید فایل شرح پروژه را دانلود و بعداً به اشتراک بگذارید. این فرم درخواست را ارسال نمی‌کند.")}</p><form data-brief-form><label>${local("What would you like to build or improve?", "چه چیزی می‌خواهید بسازید یا بهتر کنید؟")}<textarea name="problem" required maxlength="2000" rows="3" dir="auto"></textarea></label><label>${local("Who is it for?", "مخاطب یا کاربران چه کسانی هستند؟")}<input name="audience" required maxlength="300" dir="auto"></label><label>${local("Timeline, constraints or expected result (optional)", "زمان‌بندی، محدودیت‌ها یا نتیجه‌ی مورد انتظار (اختیاری)")}<textarea name="constraints" maxlength="1500" rows="2" dir="auto"></textarea></label><button class="button button-primary" type="submit">${local("Download my brief ↓", "دانلود شرح پروژه ↓")}</button><p class="form-feedback" role="status" data-brief-feedback></p></form>`,
    opener,
  );
}
function downloadBrief(form) {
  const values = new FormData(form);
  const text = `RAHIN — ${local("Project overview", "شرح پروژه")}\n\n${local("Problem", "مسئله")}: ${values.get("problem")}\n\n${local("Audience", "مخاطب")}: ${values.get("audience")}\n\n${local("Constraints / outcome", "محدودیت‌ها / نتیجه")}: ${values.get("constraints") || "—"}\n`;
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", text], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "rahin-brief.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $("[data-brief-feedback]").textContent = local(
    "Download prepared. Your text has not been sent anywhere.",
    "فایل آماده شد. متن شما به جایی ارسال نشده است.",
  );
}
function showReveal(element, delay = 0) {
  element.style.setProperty('--reveal-delay', delay + 'ms');
  element.classList.add('visible');
  revealObserver?.unobserve(element);
}
const revealObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => {
      const groups = new Map();
      entries.filter(entry => entry.isIntersecting).forEach(entry => {
        const element = entry.target;
        const group = element.parentElement;
        const index = groups.get(group) || 0;
        showReveal(element, reducedMotion.matches ? 0 : Math.min(index * 90, 270));
        groups.set(group, index + 1);
      });
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' })
  : null;
function observeReveals() {
  $$('.reveal:not(.visible)').forEach(element => {
    element.classList.add('observed');
    if (revealObserver && !reducedMotion.matches) revealObserver.observe(element);
    else showReveal(element);
  });
}
// Keyboard navigation must never focus a control hidden by a reveal.
document.addEventListener('focusin', event => {
  let element = event.target.closest('.reveal');
  while (element) {
    showReveal(element);
    element = element.parentElement?.closest('.reveal');
  }
});
function syncMenu() {
  const menu = $(".nav-menu");
  const expanded =
    $("[data-menu-toggle]").getAttribute("aria-expanded") === "true";
  menu.inert = mobileLayout.matches && !expanded;
}
function setMenu(open, { restore = false } = {}) {
  $(".nav-menu").classList.toggle("open", open);
  $("[data-menu-toggle]").setAttribute("aria-expanded", String(open));
  $("[data-menu-toggle]").setAttribute(
    "aria-label",
    open ? local("Close menu", "بستن منو") : local("Open menu", "باز کردن منو"),
  );
  syncMenu();
  if (restore) $("[data-menu-toggle]").focus();
}
mobileLayout.addEventListener("change", () => setMenu(false));
function updateScrollUI() {
  const y = scrollY;
  const range = document.documentElement.scrollHeight - innerHeight;
  $("#site-header").style.setProperty("--reading-progress", range > 0 ? Math.min(1, Math.max(0, y / range)) : 0);
  $("#site-header").classList.toggle("scrolled", y > 20);
  const back = $("[data-back-top]");
  const show = y > 700;
  back.classList.toggle("visible", show);
  back.tabIndex = show ? 0 : -1;
  back.setAttribute("aria-hidden", String(!show));
  let active = "home";
  $$("main section[id]").forEach((section) => {
    if (section.offsetTop <= y + 150) active = section.id;
  });
  if (active === "people") active = "team";
  if (active === "reactor") active = "roles";
  if (active === "journey") active = "method";
  $$("[data-nav]").forEach((link) => {
    const match = link.dataset.nav === active;
    link.classList.toggle("active", match);
    if (match) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}
let scrollPending = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => {
      updateScrollUI();
      scrollPending = false;
    });
  },
  { passive: true },
);
document.addEventListener("click", (event) => {
  const target = event.target.closest("button,a");
  if (!target) return;
  if (target.matches("[data-language-toggle]")) {
    state.lang = state.lang === "en" ? "fa" : "en";
    try {
      localStorage.setItem("rahin-lang", state.lang);
    } catch {}
    applyLanguage();
    updateScrollUI();
  }
  if (target.matches("[data-menu-toggle]"))
    setMenu(target.getAttribute("aria-expanded") !== "true");
  if (target.matches(".nav-menu a")) setMenu(false);
  if (target.matches("[data-role-node]")) selectRole(target.dataset.roleNode);
  if (target.matches("[data-challenge]")) {
    state.challenge = target.dataset.challenge;
    renderFlow();
    selectRole(challengePaths[state.challenge].order[0]);
  }
  if (target.matches("[data-flow-role]")) {
    const role = resolveRole(target.dataset.flowRole);
    selectRole(role.id);
    $("[data-reactor-note]").textContent = local(
      role.description,
      role.faDescription,
    );
  }
  if (target.matches("[data-case]"))
    openCase(Number(target.dataset.case), target);
  if (target.matches("[data-method]")) {
    updateMethod(Number(target.dataset.method));
    animateUpdate($("[data-method-detail]"));
  }
  if (target.matches("[data-journey]"))
    updateJourney(Number(target.dataset.journey));
  if (target.matches("[data-modal-close]")) closeModal();
  if (target.matches("[data-brief-open]")) openBrief(target);
  if (target.matches("[data-back-top]")) {
    scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
    $(".brand").focus({ preventScroll: true });
  }
});
document.addEventListener("submit", (event) => {
  if (event.target.matches("[data-brief-form]")) {
    event.preventDefault();
    downloadBrief(event.target);
  }
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    !modal.open &&
    $("[data-menu-toggle]").getAttribute("aria-expanded") === "true"
  )
    setMenu(false, { restore: true });
});
$$("[data-role-node]").forEach((button) => {
  button.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") selectRole(button.dataset.roleNode);
  });
  button.addEventListener("focus", () => selectRole(button.dataset.roleNode));
});
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) {
    $$(".reveal").forEach(element => showReveal(element));
    document.getAnimations().forEach(animation => animation.cancel());
  }
});
// Motion only affects decorative geometry; labels and hit targets remain stable.
const pointerFine = matchMedia('(hover: hover) and (pointer: fine)');
const motionScene = $('[data-network]');
const sculpture = $('.sculpture');
let sceneVisible = true;
let motionFrame = 0;
let pointerPosition = null;
function resetSculpture() {
  if (motionFrame) cancelAnimationFrame(motionFrame);
  motionFrame = 0;
  pointerPosition = null;
  sculpture.style.removeProperty('--tilt-x');
  sculpture.style.removeProperty('--tilt-y');
}
function syncMotionPreference() {
  document.documentElement.dataset.motion = reducedMotion.matches ? 'off' : 'on';
  if (reducedMotion.matches) resetSculpture();
}
motionScene.addEventListener('pointermove',event=>{
  if (reducedMotion.matches || !pointerFine.matches || !sceneVisible || document.hidden) return;
  const rect=motionScene.getBoundingClientRect();
  pointerPosition={x:(event.clientX-rect.left)/rect.width-.5,y:(event.clientY-rect.top)/rect.height-.5};
  if (motionFrame) return;
  motionFrame=requestAnimationFrame(()=>{
    motionFrame=0;
    if (!pointerPosition) return;
    sculpture.style.setProperty('--tilt-x',`${-pointerPosition.y*9}deg`);
    sculpture.style.setProperty('--tilt-y',`${pointerPosition.x*12}deg`);
  });
},{passive:true});
motionScene.addEventListener('pointerleave',resetSculpture);
if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{sceneVisible=entries[0].isIntersecting;if(!sceneVisible)resetSculpture();}).observe(motionScene);
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetSculpture();});
reducedMotion.addEventListener('change',syncMotionPreference);
pointerFine.addEventListener('change',resetSculpture);
applyLanguage();
updateScrollUI();
