/* Generate both print sources from the current website copy and preserved short profiles. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const data = vm.runInNewContext(fs.readFileSync(path.join(root, 'content.js'), 'utf8') + '\n({translations, roles, members, methods});');
const summaries = {
  fa: [
    'خواسته‌ی شما را به مسیر تیم وصل می‌کند و با پیگیری تصمیم‌ها و جزئیات، پیشرفت کار را روشن نگه می‌دارد.',
    'با پرسش‌های دقیق و نگاه خلاق، ابهام‌ها را روشن می‌کند و راه‌های تازه‌ای برای پیش‌بردن کار پیدا می‌کند.',
    'با نظم و مسئولیت‌پذیری، تصمیم‌ها را به عمل می‌رساند و در شرایط متغیر، پیگیر ادامه‌ی کار می‌ماند.',
    'با نگاه به تصویر کلی و دقت در جزئیات، گزینه‌ها را می‌سنجد و مسیر انتخاب‌شده را با پشتکار پیش می‌برد.',
    'شناخت مخاطب را با خلاقیت و نگاه کسب‌وکار پیوند می‌دهد تا ایده‌ها به نیاز واقعی نزدیک‌تر شوند.',
    'با پرسش، جست‌وجو و توجه به جزئیات، به تیم کمک می‌کند نکته‌ای از قلم نیفتد و کار دقیق‌تر پیش برود.'
  ],
  en: [
    'Connects your priorities with the team’s work and keeps decisions and progress clear, without asking you to chase every detail.',
    'Uses careful questions and creative thinking to make problems clearer and find new ways forward.',
    'Carries decisions into action with discipline, adapting to changing conditions while following through on commitments.',
    'Sees the whole picture, weighs the details and follows the chosen direction through with care.',
    'Connects audience understanding with creativity and a business perspective to bring ideas closer to real needs.',
    'Combines research, careful questions and attention to detail to help the team avoid overlooking what matters.'
  ]
};
const printCopy = {
 fa: {label:'معرفی راهین', team:'شش نگاه، یک همکاری.', intro:'شش نفر با نگاه‌های متفاوت، برای فهمیدن نیاز شما و پیش‌بردن کار در کنار هم.', serviceHeading:'چطور از ایده به کار آماده می‌رسیم؟', before:'پیش از شروع، درباره‌ی کارهای لازم، هزینه، زمان و کمک پس از تحویل توافق می‌کنیم.', method:'از گفت‌وگو تا تحویل، در چهار قدم.', note:'در طول کار، آنچه آماده شده به شما نشان می‌دهیم و درباره‌ی تغییرات گفت‌وگو می‌کنیم.', contact:'برای شروع، بگویید چه کاری می‌خواهید انجام دهید و چه کسانی از آن استفاده می‌کنند. لازم نیست طرح آماده یا دانش فنی داشته باشید.', footer:'راهین · طراحی سایت و ساخت ابزارهای آنلاین', p1:'معرفی تیم و روش همکاری', p2:'اعضای تیم و مراحل کار'},
 en: {label:'TEAM INTRODUCTION',team:'Six perspectives. One team.',intro:'Six people with different perspectives, working together to understand what you need and carry the work forward.',serviceHeading:'How we turn an idea into something you can use.',before:'Before starting, we agree on the work, cost, timing and any help needed after handover.',method:'From conversation to handover in four steps.',note:'You see what is ready along the way, and we discuss changes together.',contact:'Start with what you want to do and who will use it. You do not need technical knowledge or a finished plan.',footer:'RAHIN · Websites & online tools',p1:'Our team and how we help',p2:'Our people and the steps'}
};
const colors = ['#80baff','#b6a2f5','#ffc08a','#f79fae','#72e5c0'];
const escape = text => String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
for (const lang of ['fa','en']) {
 const fa = lang === 'fa', t=data.translations[lang], c=printCopy[lang];
 const header = label => `<header class="top"><img src="assets/logo/rahin-logo.svg" alt="RAHIN"><span class="label">${label}</span></header>`;
 const footer = (label,n) => `<footer class="footer"><span>${label}</span><span class="edition" dir="ltr">0${n} / 02</span></footer>`;
 const services = data.roles.map((r,i)=>`<div class="service" style="--accent:${colors[i]}"><span class="num" dir="ltr">0${i+1}</span><h3>${escape(fa?r.faService:r.service)}</h3><p>${escape(fa?r.faDescription:r.description)}</p></div>`).join('');
 const members = data.members.map((m,i)=>`<div class="member"><span class="num" dir="ltr">0${i+1}</span><strong>${escape(fa?m.name:m.latin)}</strong><div><h3>${escape(fa?m.faLine:m.line)}</h3><p>${escape(summaries[lang][i])}</p></div></div>`).join('');
 const methods = data.methods.map((m,i)=>`<div class="step"><div class="step-title"><b dir="ltr">0${i+1}</b><strong>${escape(m[fa?1:0])}</strong></div><p>${escape(m[fa?3:2])}</p></div>`).join('');
 const html=`<!doctype html>
<html lang="${lang}" dir="${fa?'rtl':'ltr'}"><head><meta charset="utf-8"><title>RAHIN | ${c.label}</title><link rel="stylesheet" href="portfolio.css"></head><body>
<section class="page">${header(c.label)}<div class="hero"><p class="kicker">${escape(t['hero.eyebrow'])}</p><div class="word" dir="ltr">RAHIN</div><h1>${escape(t['hero.titleA'])}<br><span>${escape(t['hero.titleB'])}</span></h1><p class="lead">${escape(t['hero.lede'])}</p></div>
<p class="kicker">${escape(t['labels.roles'])}</p><h2>${c.serviceHeading}</h2><div class="services">${services}</div><p class="aside">${c.before}</p>${footer(c.p1,1)}</section>
<section class="page p2">${header(c.p2)}<div class="section-head"><p class="kicker">${escape(t['labels.people'])}</p><h2>${c.team}</h2><p class="intro">${c.intro}</p></div><div class="members">${members}</div>
<div class="section-head"><p class="kicker">${escape(t['labels.method'])}</p><h2>${c.method}</h2></div><div class="method">${methods}</div><p class="note">${c.note}</p><div class="contact"><h3>${fa?'ایده‌تان را به زبان خودتان بگویید.':'Tell us your idea. In your own words.'}</h3><p>${c.contact}</p></div>${footer(c.footer,2)}</section>
</body></html>`;
 fs.writeFileSync(path.join(root,fa?'portfolio.html':'portfolio-en.html'),html);
}
