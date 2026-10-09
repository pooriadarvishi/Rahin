/* RAHIN interactions. Content lives in content.js. No framework or network required. */
"use strict";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const local = (en, fa) => (state.lang === "fa" ? fa : en);
function readLanguage() {
  try {
    return localStorage.getItem("rahin-lang") === "en" ? "en" : "fa";
  } catch {
    return "fa";
  }
}
const state = {
  lang: readLanguage(),
  challenge: "unclear",
  role: null,
  flowRole: null,
  method: 0,
  journey: 0,
  opener: null,
  modal: null,
};
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const mobileLayout = matchMedia("(max-width: 700px)");
const methodColors = ['blue', 'purple', 'green', 'orange'];
const outputs = [
  ['A written agreement on the work, price and dates', 'توافق مکتوب درباره‌ی کار، هزینه و زمان'],
  ['Screen designs you have seen and approved', 'طرح صفحه‌هایی که دیده و تأیید کرده‌اید'],
  ['A working version for you to try', 'نسخه‌ای که بتوانید با آن کار کنید'],
  ['The finished work, files and instructions', 'کار آماده، فایل‌ها و راهنمای استفاده']
];
const methodDetails = [
  ['We ask about your work and what you want to change. Then we agree on what is included before building starts.', 'درباره‌ی کارتان و چیزی که می‌خواهید تغییر کند می‌پرسیم. پیش از ساخت، کارهای لازم و هزینه‌ی آن‌ها را با هم مشخص می‌کنیم.'],
  ['You see what the visitor will see and how they will use it. This is the time to discuss changes to the design.', 'می‌بینید بازدیدکننده با چه صفحه‌هایی روبه‌رو می‌شود و چطور از آن‌ها استفاده می‌کند. همین‌جا درباره‌ی تغییر طرح گفت‌وگو می‌کنیم.'],
  ['You try the main tasks, such as sending a request. We check for problems and review any changes together.', 'کارهای اصلی، مثل فرستادن درخواست، را امتحان می‌کنید. ایرادها را پیدا می‌کنیم و تغییرات لازم را با هم بررسی می‌کنیم.'],
  ['We hand over the agreed files and access, show you how to use the site or tool, and clarify any help agreed for later.', 'فایل‌ها و دسترسی‌های توافق‌شده را تحویل می‌دهیم، روش استفاده را توضیح می‌دهیم و کمک احتمالی پس از تحویل را مشخص می‌کنیم.']
];
const journeyDescriptions = [
 ['Which features are included, what they cost and how any extra work will be agreed.', 'چه امکاناتی ساخته می‌شوند، هزینه چقدر است و اگر کار تازه‌ای اضافه شود چطور درباره‌اش توافق می‌کنیم.'],
 ['What you will be able to see or use at each step, and which files you receive at the end.', 'در هر مرحله چه چیزی را می‌بینید یا با آن کار می‌کنید و در پایان چه فایل‌هایی تحویل می‌گیرید.'],
 ['Who follows up with you, who prepares photos and text, and who approves the work.', 'چه کسی با شما در ارتباط است، عکس و متن را چه کسی آماده می‌کند و تأیید نهایی با چه کسی است.'],
 ['When each part will be ready and when we need your information or feedback.', 'هر بخش چه زمانی آماده می‌شود و چه زمانی به اطلاعات یا نظر شما نیاز داریم.'],
 ['What we will try together to check that the website or tool does what you need.', 'چه کارهایی را با هم امتحان می‌کنیم تا مطمئن شویم سایت یا برنامه همان کاری را انجام می‌دهد که خواسته‌اید.'],
 ['Whether you need help after delivery, what it includes, how long it lasts and what it costs.', 'آیا پس از تحویل به کمک نیاز دارید؟ این کمک شامل چه کارهایی است، تا چه زمانی ادامه دارد و چقدر هزینه دارد؟']
];
const challengePaths = {
  "unclear": {
    "order": [
      "analyst",
      "visionary",
      "creative",
      "coordinator",
      "executor"
    ],
    "actions": [
      [
        "Hear what you need",
        "شنیدن نیاز شما"
      ],
      [
        "Pick the first features",
        "انتخاب امکانات لازم"
      ],
      [
        "Show the screens",
        "دیدن شکل صفحه‌ها"
      ],
      [
        "Agree on timing",
        "توافق درباره‌ی زمان"
      ],
      [
        "Try the first version",
        "امتحان‌کردن نسخه‌ی اول"
      ]
    ],
    "note": [
      "First, we list what the website needs to do: for example, show products, display prices and take orders. Then we discuss the cost and timing.",
      "اول مشخص می‌کنیم سایت باید چه کار کند؛ مثلاً محصولات را نشان دهد، قیمت‌ها را نمایش دهد و سفارش بگیرد. بعد درباره‌ی هزینه و زمان صحبت می‌کنیم."
    ]
  },
  "ambitious": {
    "order": [
      "visionary",
      "analyst",
      "creative",
      "coordinator",
      "executor"
    ],
    "actions": [
      [
        "Describe the idea",
        "توضیح ایده"
      ],
      [
        "Check who needs it",
        "شناخت نیاز مخاطب"
      ],
      [
        "Show how it works",
        "دیدن روش استفاده"
      ],
      [
        "Plan a small first step",
        "برنامه‌ی ساخت نمونه"
      ],
      [
        "Try the idea",
        "امتحان‌کردن ایده"
      ]
    ],
    "note": [
      "We suggest a small version that lets you try the main idea before deciding whether to build more.",
      "یک نسخه‌ی ساده پیشنهاد می‌دهیم تا بخش اصلی ایده را امتحان کنید؛ بعد با شناخت بیشتری درباره‌ی ادامه‌ی ساخت تصمیم بگیرید."
    ]
  },
  "messy": {
    "order": [
      "coordinator",
      "analyst",
      "visionary",
      "creative",
      "executor"
    ],
    "actions": [
      [
        "See how you work now",
        "شناخت کارهای روزانه"
      ],
      [
        "Find the delays",
        "پیداکردن علت تأخیر"
      ],
      [
        "Choose what to fix first",
        "انتخاب تغییر مهم‌تر"
      ],
      [
        "Plan a simpler way",
        "طراحی روش ساده‌تر"
      ],
      [
        "Try it in daily work",
        "امتحان در کار روزانه"
      ]
    ],
    "note": [
      "We follow one everyday task from start to finish. For example, we look at how an order arrives, is recorded and gets delivered, then suggest a simpler way.",
      "یکی از کارهای روزانه را از اول تا آخر بررسی می‌کنیم؛ مثلاً سفارش چطور دریافت، ثبت و تحویل می‌شود. بعد راهی ساده‌تر برای انجامش پیشنهاد می‌دهیم."
    ]
  }
};
const resolveRole = (id) => roles.find((role) => role.id === id);
const number = (n) => String(n).padStart(2, "0");
// Own only our interaction animations; never cancel CSS transitions or scene assembly.
const interactionAnimations = new Map();
function playInteraction(element, frames, options) {
  if (reducedMotion.matches || document.hidden || !element.animate) return;
  interactionAnimations.get(element)?.cancel();
  const animation = element.animate(frames, options);
  interactionAnimations.set(element, animation);
  const release = () => {
    if (interactionAnimations.get(element) === animation) interactionAnimations.delete(element);
  };
  animation.addEventListener('finish', release, { once: true });
  animation.addEventListener('cancel', release, { once: true });
}
function stopInteractions(root = document) {
  for (const [element, animation] of interactionAnimations) {
    if (root.contains(element)) {
      animation.cancel();
      interactionAnimations.delete(element);
    }
  }
}
function animateUpdate(element, delay = 0) {
  playInteraction(element, [
    { opacity: .25, transform: 'translate3d(0,8px,0)' },
    { opacity: 1, transform: 'translate3d(0,0,0)' }
  ], { duration: 460, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
}

function animatePress(element) {
  playInteraction(element, [{ transform: 'scale(1)' }, { transform: 'scale(.96)', offset: .3 }, { transform: 'scale(1)' }],
    { duration: 330, easing: 'cubic-bezier(.2,.7,.2,1)' });
}
function animateMethodScene() {
  animateUpdate($('.scene-label'));
}
function animateNetwork(id) {
  const role = resolveRole(id);
  motionScene.style.setProperty('--scene-accent', role.color);
  motionScene.classList.add('has-selection');
  if (reducedMotion.matches || !sceneVisible || document.hidden) return;
  // A brief response to tap works on mobile without tilt sensors or hover.
  const object = $('.sculpture-object');
  playInteraction(object, [
    { transform: 'rotateX(54deg) rotateZ(-34deg) translateZ(0)' },
    { transform: 'rotateX(44deg) rotateZ(-27deg) translateZ(10px)', offset: .45 },
    { transform: 'rotateX(54deg) rotateZ(-34deg) translateZ(0)' }
  ], { duration: 850, easing: 'cubic-bezier(.16,1,.3,1)' });
  const line = $(`[data-line="${id}"]`);
  playInteraction(line, [{strokeDashoffset:0},{strokeDashoffset:-44}], {duration:750,easing:'ease-out'});
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
  $('[data-role-grid]').innerHTML=roles.map((role,index)=>`<article class="role-panel reveal role-${role.id}"><span class="role-panel-index" dir="ltr">${number(index+1)}</span><div><h3>${local(role.service,role.faService)}</h3><p>${local(role.description,role.faDescription)}</p></div><div class="role-fact"><span>${local('What you receive','آنچه تحویل می‌گیرید')}</span><strong>${local(role.output,role.faOutput)}</strong></div></article>`).join('');
}

function renderMethod() {
  $("[data-method-track]").innerHTML = methods
    .map(
      (step, index) =>
        `<article class="method-step reveal color-${methodColors[index]}"><button type="button" data-method="${index}" aria-pressed="${state.method === index}"><span class="method-dot" aria-hidden="true"></span><span>${number(index + 1)}</span><strong>${local(step[0], step[1])}</strong></button><p>${local(step[2], step[3])}</p></article>`,
    )
    .join("");
  updateMethod(state.method, { force: true });
  $("[data-cycle-note]").textContent = local(
    "If something needs changing, we discuss it before moving on. You stay informed throughout.",
    "اگر بخشی نیاز به تغییر داشته باشد، پیش از ادامه درباره‌اش صحبت می‌کنیم. در تمام مسیر از پیشرفت کار باخبر می‌مانید.",
  );
}
function updateMethod(index, { force = false } = {}) {
  if (!force && state.method === index) return;
  state.method = index;
  $$("[data-method]").forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(Number(button.dataset.method) === index),
    ),
  );
  $('[data-method-scene]').dataset.stage = index;
  $('[data-method-scene]').style.setProperty('--stage-progress', index / (methods.length - 1));
  $('[data-method-detail]').innerHTML = `<span class="eyebrow">${local('WHAT YOU RECEIVE', 'آنچه تحویل می‌گیرید')}</span><h3>${local(...outputs[index])}</h3><p>${local(...methodDetails[index])}</p>`;
  $('[data-method-step-label]').textContent = `${number(index + 1)} / ${local(methods[index][0], methods[index][1])}`;
  if (!force) {
    animateUpdate($('[data-method-detail]'));
    animateMethodScene();
  }

}
function renderJourney() {
  $("[data-journey-note]").textContent = local(
    "Choose a topic to see what we agree on before starting.",
    "هر مورد را انتخاب کنید تا ببینید پیش از شروع درباره‌ی چه چیزهایی توافق می‌کنیم.",
  );
  $("[data-journey-line]").innerHTML = journey
    .map(
      (point, index) =>
        `<article class="journey-point reveal ${index === state.journey ? "active" : ""}"><span>${point[0]}</span><button type="button" data-journey="${index}" aria-pressed="${index === state.journey}">${local(point[1], point[2])}</button><span class="journey-indicator" aria-hidden="true">+</span></article>`,
    )
    .join("");
  updateJourney(state.journey, { force: true });
}
function updateJourney(index, { force = false } = {}) {
  if (!force && state.journey === index) return;
  state.journey = index;
  $$("[data-journey]").forEach((button) => {
    const active = Number(button.dataset.journey) === index;
    button.setAttribute("aria-pressed", String(active));
    button.closest("article").classList.toggle("active", active);
  });
  $("[data-journey-detail]").textContent = local(...journeyDescriptions[index]);
  if (!force) animateUpdate($("[data-journey-detail]"));
}
function renderFlow({ animate = false } = {}) {
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
        `<div class="flow-step role-${id}"><button class="flow-icon" type="button" data-flow-role="${id}" aria-pressed="${state.flowRole === id}" aria-label="${local(resolveRole(id).service,resolveRole(id).faService)}">${number(index + 1)}</button><strong>${local(resolveRole(id).service,resolveRole(id).faService)}</strong><small>${local(...path.actions[index])}</small></div>`,
    )
    .join("");
  const role = resolveRole(state.flowRole);
  $("[data-reactor-note]").textContent = role ? local(role.description, role.faDescription) : local(...path.note);
  if (animate) $$(".flow-step").forEach((step, index) => animateUpdate(step, index * 55));
}
function selectRole(id, { animate = true, force = false } = {}) {
  const changed = state.role !== id;
  if (!changed && !force) return;
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
  if (changed && animate) animateNetwork(id);
}
function renderContact() {
  $('[data-brief-open]').textContent = local('Write down your idea ↗', 'ایده‌تان را بنویسید ↖');
  $('[data-contact-note]').textContent = local('Your answers are saved as a file on your device. This form does not send them to our team.', 'پاسخ‌ها در یک فایل روی دستگاه شما ذخیره می‌شوند. این فرم چیزی برای تیم ارسال نمی‌کند.');
  const language = state.lang.toUpperCase();
  $('[data-contact-links]').innerHTML = `<a href="output/pdf/RAHIN-Team-Portfolio-${language}.pdf" download hreflang="${state.lang}">${local('Download our introduction in English · PDF', 'دانلود معرفی تیم به فارسی · <bdi>PDF</bdi>')} <span aria-hidden="true">↓</span></a>`;
}

function applyLanguage() {
  revealObserver?.disconnect();
  $("[data-member-count]").textContent = number(members.length);
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === "fa" ? "rtl" : "ltr";
  document.title = local(
    "RAHIN | Websites & online tools",
    "راهین | طراحی سایت و ساخت ابزارهای آنلاین",
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
    "You explain the need. We work through the details together.",
    "شما از نیازتان بگویید؛ جزئیات را با هم روشن می‌کنیم.",
  );
  $$("[data-role-node]").forEach((button) => {
    const role=resolveRole(button.dataset.roleNode);
    $("strong", button).textContent=local(role.service,role.faService);
  });
  renderPeople();
  renderRoles();
  renderMethod();
  renderJourney();
  renderFlow();
  renderContact();
  if (state.role) selectRole(state.role, { animate: false, force: true });
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
function openBrief(opener) {
  openModal(
    `<span class="modal-kicker">${local("YOUR IDEA", "ایده‌ی شما")}</span><h2 id="modal-title">${local("Tell us what you have in mind.", "از چیزی که در ذهن دارید بگویید.")}</h2><p class="modal-lede">${local("A few sentences are enough. Save your answers to a file and share it later. Nothing is sent to our team from this form.", "چند جمله کافی است. پاسخ‌ها را در یک فایل ذخیره کنید و بعداً به اشتراک بگذارید. این فرم چیزی برای تیم ارسال نمی‌کند.")}</p><form data-brief-form><label>${local("What would you like to do?", "می‌خواهید چه کاری انجام دهید؟")}<textarea name="problem" required maxlength="2000" rows="3" dir="auto" placeholder="${local('For example: show my products online and let customers place an order.', 'مثلاً محصولاتم را در اینترنت معرفی کنم و مشتری بتواند سفارش بدهد.')}"></textarea></label><label>${local("Who will use it?", "چه کسانی قرار است از آن استفاده کنند؟")}<input name="audience" required maxlength="300" dir="auto"></label><label>${local("Budget, timing or anything else we should know (optional)", "بودجه، زمان یا نکته‌ی دیگری که باید بدانیم (اختیاری)")}<textarea name="constraints" maxlength="1500" rows="2" dir="auto"></textarea></label><button class="button button-primary" type="submit">${local("Save my answers ↓", "ذخیره‌ی پاسخ‌ها در فایل ↓")}</button><p class="form-feedback" role="status" data-brief-feedback></p></form>`,
    opener,
  );
}
function downloadBrief(form) {
  const values = new FormData(form);
  const text = `RAHIN — ${local("Project overview", "شرح پروژه")}\n\n${local("Problem", "مسئله")}: ${values.get("problem")}\n\n${local("Audience", "مخاطب")}: ${values.get("audience")}\n\n${local("Budget / timing / notes", "بودجه / زمان / توضیحات")}: ${values.get("constraints") || "—"}\n`;
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
  if (open) $$('.nav-menu a,.nav-menu .language-toggle').forEach((item, index) => animateUpdate(item, index * 35));
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
  if (target.matches(".button,.language-toggle")) animatePress(target);
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
    if (state.challenge === target.dataset.challenge) return;
    state.challenge = target.dataset.challenge;
    state.flowRole = null;
    renderFlow({ animate: true });
    selectRole(challengePaths[state.challenge].order[0]);
  }
  if (target.matches("[data-flow-role]")) {
    const role = resolveRole(target.dataset.flowRole);
    if (state.flowRole === role.id) return;
    state.flowRole = role.id;
    $$('[data-flow-role]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.flowRole === role.id)));
    animatePress(target);
    selectRole(role.id);
    $("[data-reactor-note]").textContent = local(
      role.description,
      role.faDescription,
    );
  }
  if (target.matches("[data-method]")) {
    updateMethod(Number(target.dataset.method));
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
    stopInteractions();
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
if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
  sceneVisible = entries[0].isIntersecting;
  if (sceneVisible) motionScene.classList.add('scene-entered');
  else { resetSculpture(); stopInteractions(motionScene); }
}, { threshold: .25 }).observe(motionScene);
else motionScene.classList.add('scene-entered');
document.addEventListener('visibilitychange', () => { if (document.hidden) { resetSculpture(); stopInteractions(); } });
reducedMotion.addEventListener('change',syncMotionPreference);
pointerFine.addEventListener('change',resetSculpture);
applyLanguage();
updateScrollUI();
