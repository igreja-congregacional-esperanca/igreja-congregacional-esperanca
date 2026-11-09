// Gera o site estático em ./public a partir de content/ e src/.
// Uso: node build.js   (a Vercel roda isso no deploy, ver vercel.json)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'public');
const SITE = (process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL : '')).replace(/\/$/, '');
const CHANNEL = 'https://www.youtube.com/@IECConjuntoEsperan%C3%A7a';
const MAPS = 'https://www.google.com/maps/place/Igreja+Congregacional+%7C+Conjunto+Esperan%C3%A7a/data=!4m7!3m6!1s0x7c74df34c4511d1:0xc750b079627d6c!8m2!3d-3.8139266!4d-38.5900581!16s%2Fg%2F11ghdt_hyp?hl=pt-BR';

const INSTAGRAM = 'https://www.instagram.com/conjuntoesperancaiec/';
const BRAND = 'Igreja Evangélica Congregacional Conjunto Esperança';
const SHORT_BRAND = 'Conjunto Esperança'; // sufixo curto dos títulos de devocionais e Bíblia (o Google corta em ~60 caracteres)
// Dados do local para o JSON-LD (Church). Mantenha iguais aos da ficha do Google Maps, do rodapé (src/footer.html) e de content/eventos.json.
const CHURCH = {
  phone: '+55 85 98768-6622',
  street: 'R. 104, 227',
  city: 'Fortaleza',
  region: 'CE',
  postalCode: '60763-474',
  lat: -3.8139266,
  lng: -38.5900581,
  // Domingo (celebração) e quarta-feira (doutrina, 19h30). Sem horário de término divulgado para quarta, usa 21:00 como estimativa.
  hours: [{ day: 'Sunday', opens: '10:00', closes: '12:00' }, { day: 'Wednesday', opens: '19:30', closes: '21:00' }]
};
const OG_ALT = 'Fachada da igreja e logotipo da Igreja Evangélica Congregacional Conjunto Esperança, em Fortaleza';

const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Corta texto para meta description sem partir palavra no meio.
const clip = (s, n) => {
  s = String(s).replace(/\s+/g, ' ').trim();
  if (s.length <= n) return s;
  const cut = s.slice(0, n - 1);
  const sp = cut.lastIndexOf(' ');
  return (sp > n * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:.–—-]+$/, '') + '…';
};
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const json = (f) => JSON.parse(read(f));
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const fmt = (d) => { const p = d.split('-'); return +p[2] + ' ' + MONTHS[+p[1] - 1] + ' ' + p[0]; };

// ---------- Bíblia online (link externo; o texto não é copiado para o site) ----------
const BIBLE_BASE = 'https://www.bibliaonline.com.br/arc';
const BOOKS = {
  'Gênesis': 'gn', 'Êxodo': 'ex', 'Levítico': 'lv', 'Números': 'nm', 'Deuteronômio': 'dt', 'Josué': 'js', 'Juízes': 'jz', 'Rute': 'rt',
  '1 Samuel': '1sm', '2 Samuel': '2sm', '1 Reis': '1rs', '2 Reis': '2rs', '1 Crônicas': '1cr', '2 Crônicas': '2cr', 'Esdras': 'ed', 'Neemias': 'ne', 'Ester': 'et',
  'Jó': 'job', 'Salmos': 'sl', 'Provérbios': 'pv', 'Eclesiastes': 'ec', 'Cantares': 'ct', 'Isaías': 'is', 'Jeremias': 'jr', 'Lamentações': 'lm', 'Ezequiel': 'ez', 'Daniel': 'dn',
  'Oséias': 'os', 'Joel': 'jl', 'Amós': 'am', 'Obadias': 'ob', 'Jonas': 'jn', 'Miqueias': 'mq', 'Naum': 'na', 'Habacuque': 'hc', 'Sofonias': 'sf', 'Ageu': 'ag', 'Zacarias': 'zc', 'Malaquias': 'ml',
  'Mateus': 'mt', 'Marcos': 'mc', 'Lucas': 'lc', 'João': 'jo', 'Atos': 'at', 'Romanos': 'rm', '1 Coríntios': '1co', '2 Coríntios': '2co', 'Gálatas': 'gl', 'Efésios': 'ef', 'Filipenses': 'fp', 'Colossenses': 'cl',
  '1 Tessalonicenses': '1ts', '2 Tessalonicenses': '2ts', '1 Timóteo': '1tm', '2 Timóteo': '2tm', 'Tito': 'tt', 'Filemom': 'fm', 'Hebreus': 'hb', 'Tiago': 'tg',
  '1 Pedro': '1pe', '2 Pedro': '2pe', '1 João': '1jo', '2 João': '2jo', '3 João': '3jo', 'Judas': 'jd', 'Apocalipse': 'ap'
};
// "Salmo 119.105" -> https://www.bibliaonline.com.br/arc/sl/119/105 ; "Efésios 2.8-9" -> .../ef/2/8-9
function bibleUrl(ref) {
  const m = String(ref).trim().match(/^(.+?)\s+(\d+)(?:[.:](\d+(?:[-–,]\d+)*))?$/);
  if (!m) return null;
  const name = m[1] === 'Salmo' ? 'Salmos' : m[1];
  const abbr = BOOKS[name];
  if (!abbr) return null;
  return `${BIBLE_BASE}/${abbr}/${m[2]}${m[3] ? '/' + m[3].replace('–', '-') : ''}`;
}
// Link interno para o leitor do site: /biblia/sl/119/#v105 (ou #v8-9 para intervalos)
function readerUrl(ref) {
  const m = String(ref).trim().match(/^(.+?)\s+(\d+)(?:[.:](\d+)(?:[-–](\d+))?)?$/);
  if (!m) return null;
  const abbr = BOOKS[m[1] === 'Salmo' ? 'Salmos' : m[1]];
  if (!abbr) return null;
  return `/biblia/${abbr}/${m[2]}/${m[3] ? '#v' + m[3] + (m[4] ? '-' + m[4] : '') : ''}`;
}
const refHtml = (ref) => {
  const url = readerUrl(ref);
  if (!url) { console.warn('Aviso: referência sem link da Bíblia: ' + ref); return esc(ref); }
  return `<a href="${url}">${esc(ref)} <span class="ref-go">ler na Bíblia →</span></a>`;
};

// ---------- conteúdo ----------
function parsePost(file) {
  const raw = read('content/devocionais/' + file).replace(/\r\n/g, '\n');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('Front matter ausente em ' + file);
  const meta = {};
  m[1].split('\n').forEach((line) => { const i = line.indexOf(':'); if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim(); });
  for (const k of ['titulo', 'categoria', 'autor', 'data', 'referencia']) if (!meta[k]) throw new Error(`Campo "${k}" ausente em ${file}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.data)) throw new Error('Data inválida em ' + file);
  if (meta.atualizado && !/^\d{4}-\d{2}-\d{2}$/.test(meta.atualizado)) throw new Error('Campo "atualizado" inválido em ' + file);
  const slug = file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
  const paragraphs = m[2].trim().split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return { slug, title: meta.titulo, cat: meta.categoria, author: meta.autor, date: meta.data, updated: meta.atualizado || meta.data, ref: meta.referencia, paragraphs };
}
const posts = fs.readdirSync(path.join(ROOT, 'content/devocionais')).filter((f) => f.endsWith('.md')).map(parsePost)
  .sort((a, b) => b.date.localeCompare(a.date));
const slugs = new Set();
posts.forEach((p) => { if (slugs.has(p.slug)) throw new Error('Slug repetido: ' + p.slug); slugs.add(p.slug); });
const foundation = json('content/texto-base.json');
const events = json('content/eventos.json');

// ---------- calendário (Google Agenda + arquivo .ics) ----------
// Eventos com "agenda" em eventos.json (cultos semanais) ganham botões. Horários em Fortaleza (UTC-3, sem horário de verão).
const BYDAY = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
const icsTime = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
function nextStart(a, hm) {
  const now = new Date(Date.now() - 3 * 3600e3); // "agora" em Fortaleza
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  while (d.getUTCDay() !== BYDAY[a.byday]) d.setUTCDate(d.getUTCDate() + 1);
  const [h, m] = hm.split(':').map(Number);
  let t = new Date(d.getTime() + (h + 3) * 3600e3 + m * 60e3); // +3h: Fortaleza → UTC
  if (t.getTime() <= Date.now()) t = new Date(t.getTime() + 7 * 86400e3); // já passou hoje: começa na semana seguinte
  return t;
}
function agendaInfo(e) {
  const a = e.agenda;
  const s0 = nextStart(a, a.inicio), mins = (hm) => hm.split(':').reduce((x, y) => x * 60 + +y, 0);
  const start = s0, end = new Date(s0.getTime() + (mins(a.fim) - mins(a.inicio)) * 60e3); // término = início + duração
  return {
    start: icsTime(start), end: icsTime(end), rrule: 'FREQ=WEEKLY;BYDAY=' + a.byday,
    title: e.titulo + ' — Igreja Evangélica Congregacional Conjunto Esperança',
    where: `${CHURCH.street}, Conjunto Esperança, ${CHURCH.city} - ${CHURCH.region}, ${CHURCH.postalCode}`
  };
}
const googleCal = (e) => { const i = agendaInfo(e); return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(i.title) + '&dates=' + i.start + '/' + i.end + '&location=' + encodeURIComponent(i.where) + '&details=' + encodeURIComponent(e.titulo + ' (' + e.dia + ', ' + e.agenda.inicio.replace(':00', '').replace(':', 'h') + ')') + '&recurrence=' + encodeURIComponent('RRULE:' + i.rrule); };
const icsEsc = (s) => String(s).replace(/[\\;,]/g, (c) => '\\' + c);
function icsFile(e) {
  const i = agendaInfo(e);
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Igreja Congregacional Conjunto Esperanca//Site//PT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', 'UID:' + e.agenda.id + '@iecesperanca.com.br', 'DTSTAMP:' + i.start, 'DTSTART:' + i.start, 'DTEND:' + i.end, 'RRULE:' + i.rrule,
    'SUMMARY:' + icsEsc(i.title), 'LOCATION:' + icsEsc(i.where), 'DESCRIPTION:' + icsEsc(e.titulo + ' — todos são bem-vindos.'), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n') + '\r\n';
}
const calButtons = (e) => e.agenda ? `<div class="cal"><span>Adicionar ao calendário:</span><a href="${esc(googleCal(e))}" target="_blank" rel="noopener noreferrer">Google Agenda</a><a href="/agenda/${esc(e.agenda.id)}.ics" download>Apple / Outlook (.ics)</a></div>` : '';
// Títulos do YouTube às vezes trazem separadores repetidos ("A | | B"); mostramos um só. (src/app.js faz o mesmo ao atualizar a lista.)
const cleanVideoTitle = (t) => String(t || '').replace(/\s*\|(?:\s*\|)+\s*/g, ' | ').replace(/\s+/g, ' ').trim();
const videos = json('content/videos.json').map((v) => ({ ...v, title: cleanVideoTitle(v.title), l: fs.existsSync(path.join(ROOT, 'assets/yt', v.id + '.jpg')) ? 1 : 0 }));

// ---------- peças de HTML ----------
const css = read('src/style.css');
const top = read('src/top.html');
const footer = read('src/footer.html');
const appJs = read('src/app.js');
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
const appName = 'app.' + hash(appJs) + '.js';
const cssName = 'site.' + hash(css) + '.css';
const logoName = 'logo-simbolo.' + hash(fs.readFileSync(path.join(ROOT, 'logo-simbolo.webp')).toString('latin1')) + '.webp';

const NAV = [['/', 'Início', 'inicio'], ['/texto-base/', 'Texto-base', 'texto-base'], ['/devocionais/', 'Devocionais', 'devocionais'], ['/videos/', 'Vídeos', 'videos'], ['/eventos/', 'Eventos', 'eventos'], ['/biblia/', 'Bíblia', 'biblia'], ['/#sobre', 'Sobre', 'sobre']];
const crumb = (label) => `<div class="crumb"><a href="/">Início</a> › ${label}</div>`;
const card = (p, h = 'h3') => `<a class="card" href="/devocionais/${p.slug}/" data-cat="${esc(p.cat)}"><span class="tag">${esc(p.cat)}</span><${h}>${esc(p.title)}</${h}><p>${esc(p.paragraphs[0].slice(0, 110))}…</p><div class="meta">${esc(p.author)} · ${fmt(p.date)}</div></a>`;

function youtubeCard(v) {
  const id = v.id, title = esc(v.title || 'Vídeo recente');
  const d = v.publishedAt ? new Date(v.publishedAt) : null;
  const dateText = d && !isNaN(d) ? new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Fortaleza' }).format(d) : 'Vídeo recente';
  return `<article class="youtube-card"><div class="youtube-thumb"><button type="button" data-play-video="${id}" data-video-title="${title}" aria-label="Reproduzir dentro do site: ${title}"><img src="${v.l ? `/assets/yt/${id}.jpg` : `https://i.ytimg.com/vi/${id}/mqdefault.jpg`}" width="320" height="180" alt="Miniatura do vídeo: ${title}" loading="lazy" decoding="async"><span class="youtube-play" aria-hidden="true">▶</span></button></div><div class="youtube-info"><h3>${title}</h3><span class="youtube-date">Publicado em ${dateText}</span><a class="youtube-date" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer" aria-label="Abrir no YouTube: ${title}">Abrir no YouTube ↗</a></div></article>`;
}
const youtubeSection = () => `<section class="youtube-section" id="videos"><div class="sec"><h2>Vídeos recentes</h2><a href="${CHANNEL}" target="_blank" rel="noopener noreferrer">Ver o canal no YouTube →</a></div><div id="youtube-live" class="live-card" hidden aria-live="polite"></div><div id="youtube-grid" class="youtube-grid" aria-live="polite">${videos.map(youtubeCard).join('')}</div><p id="youtube-status" class="youtube-note" aria-live="polite">Prévia dos vídeos recentes; a lista está sendo atualizada.</p><script type="application/json" id="yt-initial">${JSON.stringify(videos).replace(/</g, '\\u003c')}</script></section>`;

const GALLERY = [
  { base: 'santuario-google-maps', widths: [480, 640], w: 640, h: 853, alt: 'Espaço de culto da Igreja Evangélica Congregacional no Conjunto Esperança', t: 'Nosso espaço de culto', c: 'Um lugar de comunhão e adoração.' },
  { base: 'assentos-google-maps', widths: [360], w: 360, h: 640, alt: 'Assentos e interior do espaço de culto', t: 'Nosso espaço de culto', c: 'Um ambiente preparado para receber a comunidade.' },
  { base: 'fachada-google-maps', widths: [480, 640], w: 640, h: 853, alt: 'Fachada da Igreja Evangélica Congregacional do Conjunto Esperança em Fortaleza', t: 'Nossa igreja', c: 'Estamos na Rua 104, nº 227, em Fortaleza.' },
  { base: 'santuario-alternativo-google-maps', widths: [480, 640], w: 640, h: 853, alt: 'Vista alternativa do santuário da igreja', t: 'Espaço de culto', c: 'Nosso lugar de encontro e adoração.' },
  { base: 'fachada-noite-google-maps', widths: [480], w: 480, h: 640, alt: 'Fachada da igreja iluminada à noite', t: 'Nossa igreja à noite', c: 'Esperamos por você no Conjunto Esperança.' }
];
const gallery = () => {
  const figs = GALLERY.map((g) => {
    for (const w of g.widths) if (!fs.existsSync(path.join(ROOT, `assets/${g.base}-${w}.webp`))) throw new Error('Imagem ausente: ' + g.base + '-' + w);
    const last = g.widths[g.widths.length - 1];
    const srcset = g.widths.length > 1 ? ` srcset="${g.widths.map((w) => `/assets/${g.base}-${w}.webp ${w}w`).join(', ')}" sizes="(max-width:620px) 88vw, 500px"` : '';
    return `<figure class="photo-card"><img src="/assets/${g.base}-${last}.webp"${srcset} width="${g.w}" height="${g.h}" alt="${esc(g.alt)}" loading="lazy" decoding="async"><figcaption><strong>${esc(g.t)}</strong>${esc(g.c)}</figcaption></figure>`;
  }).join('');
  return `<div class="photo-grid" id="church-photo-carousel" role="region" aria-label="Fotos da igreja" tabindex="0">${figs}</div><div class="photo-carousel-controls" aria-label="Controles das fotos"><button type="button" data-photo-prev aria-label="Foto anterior">‹</button><span class="photo-count" id="photo-count" aria-live="polite">1 de ${GALLERY.length}</span><button type="button" data-photo-next aria-label="Próxima foto">›</button></div><p class="photo-credit">Fotos publicadas na categoria “Do proprietário” da <a href="${MAPS}" target="_blank" rel="noopener noreferrer">ficha da igreja no Google Maps</a>.</p>`;
};

// ---------- páginas ----------
const pages = [];
const REDIRECT = `<script>(function(){var h=location.hash.slice(1);if(!h)return;var m={"texto-base":"/texto-base/","devocionais":"/devocionais/","videos":"/videos/","eventos":"/eventos/"};var s=${JSON.stringify(posts.map((p) => p.slug))};if(m[h])location.replace(m[h]);else if(s.indexOf(h)>-1)location.replace("/devocionais/"+h+"/")})()</script>`;

// `article` ({ date, author, cat }) marca devocionais: gera og:type=article e JSON-LD Article.
function addPage({ url, title, desc, active, body, head = '', article = null }) { pages.push({ url, title, desc, active, body, head, article }); }

const eventCard = (e, h = 'h3') => `<div class="card"><span class="tag">${esc(e.dia)}</span><${h}>${e.href ? `<a href="${esc(e.href)}">${esc(e.titulo)}</a>` : esc(e.titulo)}</${h}><div class="meta">${esc(e.detalhe)}</div>${e.href ? `<a class="event-more" href="${esc(e.href)}">Saiba mais →</a>` : ''}${calButtons(e)}</div>`;
const visitSection = () => `<section id="visite"><div class="sec"><h2>Venha nos visitar</h2><a href="${MAPS}" target="_blank" rel="noopener noreferrer">Como chegar →</a></div><div class="grid">${events.map((e) => eventCard(e)).join('')}<div class="card"><span class="tag">Endereço</span><h3>Onde estamos</h3><div class="meta">${esc(CHURCH.street)} — Conjunto Esperança · ${esc(CHURCH.city)} — ${esc(CHURCH.region)}, ${esc(CHURCH.postalCode)}</div></div></div></section>`;

addPage({
  url: '/', active: 'inicio', head: REDIRECT,
  title: 'Igreja Evangélica Congregacional Conjunto Esperança · Fortaleza', desc: 'Igreja Evangélica Congregacional no Conjunto Esperança, em Fortaleza (CE). Culto aos domingos, das 10h às 12h, devocionais, vídeos e Bíblia online.',
  body: `<section class="hero"><small>Igreja Evangélica Congregacional · Conjunto Esperança · Fortaleza</small><h1>Tudo para a glória de Deus, no culto e na vida.</h1><p>Devocionais e reflexões da nossa igreja, fundamentados nas Escrituras e centrados em Cristo.</p><a class="btn" href="/devocionais/">Ler devocionais</a><a class="btn ghost" href="/eventos/">Ver cultos</a></section>` +
    visitSection() +
    `<div class="sec"><h2>Texto-base da igreja</h2><a href="/texto-base/">Ler o texto-base da igreja →</a></div><div class="card" style="margin-bottom:36px"><span class="tag">Texto-base</span><h3>${esc(foundation.ref)}</h3><p>${esc(foundation.text[0])}</p><div class="meta">${esc(foundation.author)} · ${fmt(foundation.date)}</div></div>` +
    `<div class="sec"><h2>A igreja em imagens</h2><a href="${MAPS}" target="_blank" rel="noopener noreferrer">Ver perfil no Google Maps →</a></div>${gallery()}` +
    youtubeSection() + `<div class="sec"><h2>Últimos devocionais</h2><a href="/devocionais/">Ver todos os devocionais →</a></div><div class="grid">${posts.slice(0, 3).map((p) => card(p)).join('')}</div>`
});
addPage({
  url: '/texto-base/', active: 'texto-base', title: 'Texto-base · ' + SHORT_BRAND, desc: clip(foundation.text[0], 155),
  body: `${crumb('Texto-base')}<article><span class="tag">Texto-base da igreja</span><h1>Texto-base para a igreja</h1><div class="ref">${refHtml(foundation.ref)}</div>${foundation.text.map((p) => `<p>${esc(p)}</p>`).join('')}<div class="meta">${esc(foundation.author)} · ${fmt(foundation.date)}</div></article>`
});
const cats = ['Todos'].concat(posts.map((p) => p.cat).filter((v, i, a) => a.indexOf(v) === i));
addPage({
  url: '/devocionais/', active: 'devocionais', title: 'Devocionais · ' + SHORT_BRAND, desc: 'Devocionais semanais da Igreja Evangélica Congregacional Conjunto Esperança, em Fortaleza: palavras curtas, fundamentadas nas Escrituras, para alimentar a sua fé.',
  body: `${crumb('Devocionais')}<h1 class="page-title">Devocionais</h1><p class="lead">Palavras curtas para alimentar a sua fé a cada semana.${SITE ? ' <a href="/feed.xml">Assinar por RSS</a>' : ''}</p><div class="busca" id="busca" hidden><input type="search" id="q" placeholder="Buscar nos devocionais…" aria-label="Buscar nos devocionais" autocomplete="off"></div><div class="filters" hidden>${cats.map((c, i) => `<button type="button" class="${i === 0 ? 'on' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div><p id="q-none" class="lead" hidden>Nenhum devocional encontrado para essa busca.</p><div class="grid">${posts.map((p) => card(p, 'h2')).join('')}</div>`
});
posts.forEach((p) => addPage({
  url: `/devocionais/${p.slug}/`, active: 'devocionais', title: `${p.title} · Devocional · ${SHORT_BRAND}`, desc: clip(p.paragraphs.slice(0, 2).join(' '), 155),
  article: { date: p.date, updated: p.updated, author: p.author, cat: p.cat },
  body: `<article><a class="back" href="/devocionais/">← Todos os devocionais</a><div style="margin-top:22px"><span class="tag">${esc(p.cat)}</span></div><h1>${esc(p.title)}</h1><div class="meta" style="margin-bottom:6px">${esc(p.author)} · ${fmt(p.date)}</div><div class="ref">${refHtml(p.ref)}</div>${p.paragraphs.map((x) => `<p>${esc(x)}</p>`).join('')}</article>`
}));
addPage({
  url: '/videos/', active: 'videos', title: 'Vídeos · ' + SHORT_BRAND, desc: 'Assista às mensagens, cultos e transmissões ao vivo da Igreja Evangélica Congregacional Conjunto Esperança, em Fortaleza.',
  body: `${crumb('Vídeos')}<h1 class="page-title">Vídeos do canal</h1><p class="lead">Mensagens, cultos e transmissões da Igreja Evangélica Congregacional Conjunto Esperança.</p>${youtubeSection()}`
});
addPage({
  url: '/eventos/', active: 'eventos', title: 'Cultos e eventos · ' + SHORT_BRAND, desc: 'Horários dos cultos da Igreja Evangélica Congregacional Conjunto Esperança e como chegar: R. 104, 227 — Conjunto Esperança, Fortaleza (CE).',
  body: `${crumb('Eventos')}<h1 class="page-title">Eventos e cultos</h1><p class="lead">Venha nos visitar, você é bem-vindo.</p><div class="grid">${events.map((e) => eventCard(e, 'h2')).join('')}</div>` +
    `<section id="como-chegar" style="margin-top:36px"><h2>Como chegar</h2><p>A Igreja Evangélica Congregacional Conjunto Esperança fica na ${esc(CHURCH.street)}, no bairro Conjunto Esperança, em ${esc(CHURCH.city)} (${esc(CHURCH.region)}), CEP ${esc(CHURCH.postalCode)}. <a href="${MAPS}" target="_blank" rel="noopener noreferrer">Abrir a rota no Google Maps →</a></p><p>Dúvidas sobre horários ou como chegar? Fale conosco pelo WhatsApp: <a href="https://wa.me/5585987686622">${esc(CHURCH.phone.replace('+55 ', '(').replace(' ', ') '))}</a>.</p></section>`
});

const CONF = { slug: '/eventos/conferencia-aconselhamento-biblico/', base: 'conferencia-aconselhamento-biblico', w: 1080, h: 1350 };
addPage({
  url: CONF.slug, active: 'eventos', title: 'Conferência de Aconselhamento Bíblico · ' + SHORT_BRAND,
  desc: 'Vem aí a 1ª Conferência de Aconselhamento Bíblico, com o Pr. Elder Pinto. Tema: A Alma Sitiada. Igreja Evangélica Congregacional Conjunto Esperança, Fortaleza.',
  body: `<div class="crumb"><a href="/">Início</a> › <a href="/eventos/">Eventos</a> › Conferência de Aconselhamento Bíblico</div>` +
    `<article><a class="back" href="/eventos/">← Todos os eventos</a><div style="margin-top:22px"><span class="tag">Vem aí</span></div><h1>1ª Conferência de Aconselhamento Bíblico</h1><p class="lead">Tema: <strong>A Alma Sitiada</strong> — quando a multidão dos pensamentos adoece o corpo.</p>` +
    `<figure class="event-flyer"><img src="/assets/${CONF.base}-1080.webp" srcset="/assets/${CONF.base}-540.webp 540w, /assets/${CONF.base}-1080.webp 1080w" sizes="(max-width:720px) 92vw, 680px" width="${CONF.w}" height="${CONF.h}" alt="Cartaz da 1ª Conferência de Aconselhamento Bíblico, tema A Alma Sitiada, com o Pr. Elder Pinto, na Igreja Evangélica Congregacional Conjunto Esperança, Rua 104, nº 227" decoding="async"></figure>` +
    `<p>Amados irmãos, graça e paz!</p><p>Sabemos o peso que muitos carregam: o trabalho que não sai da cabeça, as preocupações que tiram o sono. Você não está sozinho. A igreja é uma família que cuida.</p>` +
    `<div class="ref">“Na multidão dos meus pensamentos dentro de mim, as tuas consolações recrearam a minha alma.”<br>${refHtml('Salmo 94.19')}</div>` +
    `<p>A Igreja Evangélica Congregacional Conjunto Esperança convida você para a <strong>1ª Conferência de Aconselhamento Bíblico</strong>, com o <strong>Pr. Elder Pinto</strong>. Vamos olhar para o que a Palavra de Deus ensina sobre a ansiedade, os pensamentos que nos cercam e o cuidado de Deus com a nossa alma.</p>` +
    `<h2>Informações</h2><ul class="event-info"><li><strong>Data e horário:</strong> em breve</li><li><strong>Local:</strong> ${esc(CHURCH.street)} — Conjunto Esperança, ${esc(CHURCH.city)} (${esc(CHURCH.region)})</li></ul>` +
    `<p>Traga a família e convide amigos. Esperamos você! Dúvidas? Fale conosco pelo WhatsApp: <a href="https://wa.me/5585987686622">${esc(CHURCH.phone.replace('+55 ', '(').replace(' ', ') '))}</a>. <a href="${MAPS}" target="_blank" rel="noopener noreferrer">Como chegar →</a></p></article>`
});

// ---------- leitor da Bíblia (Almeida Revista e Corrigida, edição de 1911, domínio público) ----------
const BOOK_LIST = Object.entries(BOOKS).map(([name, abbr]) => ({ name, abbr }));
const BIBLE = json('content/biblia/ALM1911.json');
if (BIBLE.length !== BOOK_LIST.length) throw new Error('Número de livros da Bíblia não confere');
BOOK_LIST.forEach((b, i) => { b.chapters = BIBLE[i]; });
const OT_COUNT = 39;
const versionBadge = `<div class="bible-version"><span class="tag">Versão: Almeida Revista e Corrigida · edição de 1911</span><a href="/biblia/#versao">Sobre esta versão</a></div>`;
const BIBLE_NOTE = `<p class="bible-note">Texto: Bíblia de João Ferreira de Almeida, edição Revista e Corrigida de 1911, em domínio público, com a ortografia da época. Não é a ARC atual da Sociedade Bíblica do Brasil.</p>`;
const bibleCrumb = (...parts) => `<div class="crumb"><a href="/">Início</a> › <a href="/biblia/">Bíblia</a>${parts.map((p) => ' › ' + p).join('')}</div>`;
const bookGrid = (list) => `<div class="book-grid">${list.map((b) => `<a href="/biblia/${b.abbr}/">${esc(b.name)}</a>`).join('')}</div>`;
addPage({
  url: '/biblia/', active: 'biblia', head: '',
  title: 'Bíblia online · ' + SHORT_BRAND, desc: 'Leia a Bíblia no site: Almeida Revista e Corrigida (edição de 1911), do Gênesis ao Apocalipse.',
  body: `${crumb('Bíblia')}<h1 class="page-title">Bíblia</h1><p class="lead">Leia as Escrituras sem sair do site.</p>${versionBadge}` +
    `<form class="bible-jump" id="bible-jump" hidden><label for="bible-q">Ir para a passagem</label><div><input id="bible-q" type="text" placeholder="Ex.: Salmos 119.105" autocomplete="off" list="bible-books"><button class="btn" type="submit">Ir</button></div><p id="bible-err" class="bible-err" role="alert" hidden>Não encontrei essa passagem. Tente, por exemplo, “João 3.16”.</p></form>` +
    `<datalist id="bible-books">${BOOK_LIST.map((b) => `<option value="${esc(b.name)}">`).join('')}</datalist>` +
    `<h2 class="bible-h">Antigo Testamento</h2>${bookGrid(BOOK_LIST.slice(0, OT_COUNT))}<h2 class="bible-h">Novo Testamento</h2>${bookGrid(BOOK_LIST.slice(OT_COUNT))}<section class="card bible-about" id="versao"><h3>Sobre esta versão</h3><p><strong>Almeida Revista e Corrigida, edição de 1911</strong>, tradução de João Ferreira de Almeida. O texto está em domínio público e mantém a ortografia da época (por exemplo, “creou” e “ninguem”).</p><p>Não é a ARC atual da Sociedade Bíblica do Brasil, que tem direitos reservados e pode ter pequenas diferenças de redação. Para comparar, cada capítulo traz um link para a ARC atual.</p></section>` +
    `<script type="application/json" id="bible-index">${JSON.stringify(BOOK_LIST.map((b) => [b.name, b.abbr, b.chapters.length])).replace(/</g, '\\u003c')}</script>`
});
BOOK_LIST.forEach((b, bi) => {
  addPage({
    url: `/biblia/${b.abbr}/`, active: 'biblia', title: `${b.name} · Bíblia · ${SHORT_BRAND}`, desc: `${b.name}: ${b.chapters.length} capítulo(s). Almeida Revista e Corrigida (edição de 1911).`,
    body: `${bibleCrumb(esc(b.name))}<h1 class="page-title">${esc(b.name)}</h1><p class="lead">${b.chapters.length} capítulo${b.chapters.length > 1 ? 's' : ''}</p>${versionBadge}<div class="chapter-grid">${b.chapters.map((_, ci) => `<a href="/biblia/${b.abbr}/${ci + 1}/">${ci + 1}</a>`).join('')}</div>${BIBLE_NOTE}`
  });
  b.chapters.forEach((verses, ci) => {
    const n = ci + 1;
    const prev = ci > 0 ? { u: `/biblia/${b.abbr}/${n - 1}/`, t: `${b.name} ${n - 1}` } : bi > 0 ? { u: `/biblia/${BOOK_LIST[bi - 1].abbr}/${BOOK_LIST[bi - 1].chapters.length}/`, t: `${BOOK_LIST[bi - 1].name} ${BOOK_LIST[bi - 1].chapters.length}` } : null;
    const next = ci < b.chapters.length - 1 ? { u: `/biblia/${b.abbr}/${n + 1}/`, t: `${b.name} ${n + 1}` } : bi < BOOK_LIST.length - 1 ? { u: `/biblia/${BOOK_LIST[bi + 1].abbr}/1/`, t: `${BOOK_LIST[bi + 1].name} 1` } : null;
    const pager = `<div class="bible-pager">${prev ? `<a href="${prev.u}" rel="prev">← ${esc(prev.t)}</a>` : '<span></span>'}<a href="/biblia/${b.abbr}/">Capítulos</a>${next ? `<a href="${next.u}" rel="next">${esc(next.t)} →</a>` : '<span></span>'}</div>`;
    addPage({
      url: `/biblia/${b.abbr}/${n}/`, active: 'biblia', title: `${b.name} ${n} · Bíblia · ${SHORT_BRAND}`, desc: `${b.name} ${n}: ` + clip(verses.join(' '), 155 - `${b.name} ${n}: `.length),
      body: `${bibleCrumb(`<a href="/biblia/${b.abbr}/">${esc(b.name)}</a>`, String(n))}<article class="bible-chapter"><h1>${esc(b.name)} ${n}</h1>${versionBadge}${verses.map((t, vi) => `<p class="verse" id="v${vi + 1}"><b>${vi + 1}</b> ${esc(t)}</p>`).join('')}</article>${pager}<p class="bible-note">Compare com a ARC atual: <a href="${BIBLE_BASE}/${b.abbr}/${n}" target="_blank" rel="noopener noreferrer">${esc(b.name)} ${n} no bibliaonline.com.br ↗</a></p>${BIBLE_NOTE}`
    });
  });
});

// ---------- SEO: dados estruturados (JSON-LD) e meta tags sociais ----------
const pageByUrl = new Map(pages.map((p) => [p.url, p]));
const labelOf = (p) => p.title.split(' · ')[0];
const ldScript = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
const churchLd = () => ({
  '@type': 'Church',
  '@id': SITE + '/#igreja',
  name: BRAND,
  alternateName: ['Igreja Congregacional Conjunto Esperança', 'IEC Conjunto Esperança'],
  url: SITE + '/',
  logo: SITE + '/logo-igreja.webp',
  image: [SITE + '/og-image.jpg', SITE + '/assets/fachada-google-maps-640.webp'],
  telephone: CHURCH.phone,
  address: { '@type': 'PostalAddress', streetAddress: CHURCH.street, addressLocality: CHURCH.city, addressRegion: CHURCH.region, postalCode: CHURCH.postalCode, addressCountry: 'BR' },
  geo: { '@type': 'GeoCoordinates', latitude: CHURCH.lat, longitude: CHURCH.lng },
  areaServed: { '@type': 'City', name: CHURCH.city },
  hasMap: MAPS,
  sameAs: [INSTAGRAM, CHANNEL],
  openingHoursSpecification: CHURCH.hours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.day, opens: h.opens, closes: h.closes }))
});
const websiteLd = () => ({ '@type': 'WebSite', '@id': SITE + '/#site', url: SITE + '/', name: BRAND, inLanguage: 'pt-BR', publisher: { '@id': SITE + '/#igreja' } });
function breadcrumbLd(pg) {
  const segs = pg.url.split('/').filter(Boolean);
  const items = [{ name: 'Início', url: '/' }];
  segs.forEach((_, i) => {
    const u = '/' + segs.slice(0, i + 1).join('/') + '/';
    const p = pageByUrl.get(u);
    if (p) items.push({ name: labelOf(p), url: u });
  });
  return { '@type': 'BreadcrumbList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: SITE + it.url })) };
}
const articleLd = (pg) => ({
  '@type': 'Article',
  headline: labelOf(pg),
  description: pg.desc,
  inLanguage: 'pt-BR',
  datePublished: pg.article.date,
  dateModified: pg.article.updated || pg.article.date,
  articleSection: pg.article.cat,
  author: { '@type': 'Person', name: pg.article.author.replace(/^Pr\.?\s+/i, '') },
  publisher: { '@type': 'Organization', name: BRAND, url: SITE + '/', logo: { '@type': 'ImageObject', url: SITE + '/logo-igreja.webp' } },
  image: [SITE + '/og-image.jpg'],
  mainEntityOfPage: { '@type': 'WebPage', '@id': SITE + pg.url }
});

// Um VideoObject por vídeo listado em /videos/ (elegível a resultados de vídeo no Google).
const videoLd = (v) => ({
  '@type': 'VideoObject',
  name: v.title,
  description: `${v.title}. Vídeo do canal da ${BRAND}, em Fortaleza.`,
  thumbnailUrl: [v.l ? `${SITE}/assets/yt/${v.id}.jpg` : `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`],
  uploadDate: v.publishedAt,
  embedUrl: `https://www.youtube.com/embed/${v.id}`,
  inLanguage: 'pt-BR',
  publisher: { '@id': SITE + '/#igreja' }
});

function render(pg) {
  const indexable = !pg.noindex;
  const canonical = SITE && indexable ? `<link rel="canonical" href="${SITE}${pg.url}">\n<meta property="og:url" content="${SITE}${pg.url}">` : '';
  const robots = indexable ? '<meta name="robots" content="max-image-preview:large">' : '<meta name="robots" content="noindex">';
  const social = indexable ? [
    `<meta property="og:site_name" content="${esc(BRAND)}">`,
    `<meta property="og:type" content="${pg.article ? 'article' : 'website'}">`,
    '<meta property="og:locale" content="pt_BR">',
    `<meta property="og:title" content="${esc(pg.title)}">`,
    `<meta property="og:description" content="${esc(pg.desc)}">`
  ] : [];
  if (indexable && pg.article) social.push(`<meta property="article:published_time" content="${pg.article.date}">`, `<meta property="article:section" content="${esc(pg.article.cat)}">`);
  if (indexable && SITE) {
    social.push(
      `<meta property="og:image" content="${SITE}/og-image.jpg">`, '<meta property="og:image:type" content="image/jpeg">', '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">', `<meta property="og:image:alt" content="${esc(OG_ALT)}">`,
      '<meta name="twitter:card" content="summary_large_image">', `<meta name="twitter:title" content="${esc(pg.title)}">`, `<meta name="twitter:description" content="${esc(pg.desc)}">`, `<meta name="twitter:image" content="${SITE}/og-image.jpg">`, `<meta name="twitter:image:alt" content="${esc(OG_ALT)}">`
    );
  }
  let ld = '';
  if (SITE && indexable) {
    const graph = pg.url === '/' ? [websiteLd(), churchLd()] : [breadcrumbLd(pg)].concat(pg.article ? [articleLd(pg)] : [], pg.url === '/videos/' ? videos.filter((v) => v.publishedAt).map(videoLd) : []);
    ld = ldScript({ '@context': 'https://schema.org', '@graph': graph });
  }
  const nav = NAV.map(([href, label, key, external]) => `<a href="${href}"${key === pg.active ? ' class="on"' : ''}${external ? ' target="_blank" rel="noopener noreferrer" title="Abre a Bíblia online (ARC) em outro site"' : ''}>${label}${external ? ' ↗' : ''}</a>`).join('');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(pg.title)}</title>
<meta name="description" content="${esc(pg.desc)}">
<meta name="theme-color" content="#398b26">
<meta name="msvalidate.01" content="F5D6C4801880693C64A49AFB613AC14E" />
<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-W6Z4KDJ8"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
</script>
${robots}
${social.join('\n')}
${canonical}
${SITE ? '<link rel="alternate" type="application/rss+xml" title="Devocionais · Igreja Evangélica Congregacional Conjunto Esperança" href="/feed.xml">' : ''}
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/inter-v20-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/lora-v37-latin.woff2" as="font" type="font/woff2" crossorigin>
${pg.url.startsWith('/biblia/') ? `<link rel="stylesheet" href="/assets/${cssName}">` : `<style>\n${css}\n</style>`}
${pg.head}
${ld}
</head>
<body>
${top}<header class="main"><div class="wrap">
<a class="brand" href="/"><img class="brand-mark" src="/assets/${logoName}" width="34" height="34" alt=""><span class="brand-name">Igreja Evangélica Congregacional<small>Conjunto Esperança</small></span></a>
<button class="menu" id="mb" aria-label="Menu" aria-controls="nav" aria-expanded="false">Menu</button>
<nav id="nav">${nav}</nav>
</div></header>
<main class="wrap" id="app">${pg.body}</main>
${footer}
<script src="/assets/${appName}" defer></script>
</body>
</html>
`;
}

// ---------- saída ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
fs.cpSync(path.join(ROOT, 'assets'), path.join(OUT, 'assets'), { recursive: true });
['logo-igreja.webp', 'logo-simbolo.webp', 'og-image.jpg', 'favicon.ico', 'apple-touch-icon.png'].forEach((f) => fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f)));
fs.copyFileSync(path.join(ROOT, 'logo-simbolo.webp'), path.join(OUT, 'assets', logoName));
fs.writeFileSync(path.join(OUT, 'assets', appName), appJs);
fs.writeFileSync(path.join(OUT, 'assets', cssName), css);
pages.forEach((pg) => {
  const dir = path.join(OUT, pg.url);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), render(pg));
});
// Calendário (.ics), índice de busca dos devocionais e feed RSS.
fs.mkdirSync(path.join(OUT, 'agenda'), { recursive: true });
events.filter((e) => e.agenda).forEach((e) => fs.writeFileSync(path.join(OUT, 'agenda', e.agenda.id + '.ics'), icsFile(e)));
const normTxt = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
fs.writeFileSync(path.join(OUT, 'busca.json'), JSON.stringify(Object.fromEntries(posts.map((p) => [p.slug, normTxt([p.title, p.cat, p.author, p.ref, ...p.paragraphs].join(' '))]))));
if (SITE) {
  const rfc = (d) => new Date(d + 'T12:00:00-03:00').toUTCString();
  const items = posts.slice(0, 20).map((p) => `<item><title>${esc(p.title)}</title><link>${SITE}/devocionais/${p.slug}/</link><guid isPermaLink="true">${SITE}/devocionais/${p.slug}/</guid><pubDate>${rfc(p.date)}</pubDate><dc:creator>${esc(p.author)}</dc:creator><category>${esc(p.cat)}</category><description>${esc(clip(p.paragraphs.slice(0, 2).join(' '), 300))}</description></item>`).join('\n');
  fs.writeFileSync(path.join(OUT, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><title>Devocionais · Igreja Evangélica Congregacional Conjunto Esperança</title><link>${SITE}/devocionais/</link><description>Devocionais semanais da Igreja Evangélica Congregacional Conjunto Esperança, em Fortaleza.</description><language>pt-BR</language>${posts[0] ? `<lastBuildDate>${rfc(posts[0].date)}</lastBuildDate>` : ''}<atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>\n${items}\n</channel></rss>\n`);
}

// Página 404 própria (a Vercel serve public/404.html para endereços inexistentes). Fica fora do sitemap e com noindex.
fs.writeFileSync(path.join(OUT, '404.html'), render({
  url: '/404.html', active: '', head: '', noindex: true, article: null,
  title: `Página não encontrada · ${SHORT_BRAND}`, desc: 'A página procurada não existe ou mudou de endereço.',
  body: `<div class="hero"><small>Erro 404</small><h1>Página não encontrada</h1><p>O endereço que você abriu não existe ou mudou. Veja os caminhos abaixo para continuar.</p><a class="btn" href="/">Ir para o início</a><a class="btn ghost" href="/devocionais/">Devocionais</a><a class="btn ghost" href="/biblia/">Bíblia</a></div>`
}));
fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nAllow: /\n' + (SITE ? `Sitemap: ${SITE}/sitemap.xml\n` : ''));
if (SITE) {
  // llms.txt: resumo para assistentes de IA, só com dados que já estão no site (CHURCH, devocionais, vídeos).
  const llms = [
    `# ${BRAND}`, '',
    `> Igreja evangélica congregacional em ${CHURCH.city} (${CHURCH.region}). Cultos: ${events.filter((e) => e.agenda).map((e) => `${e.dia.toLowerCase()} (${e.titulo.toLowerCase()}), ${e.detalhe.split(' · ')[0]}`).join('; ')}. Devocionais, vídeos e Bíblia online.`, '',
    `Endereço: ${CHURCH.street}, ${CHURCH.city} - ${CHURCH.region}, CEP ${CHURCH.postalCode}.`, '',
    '## Páginas', '',
    `- [Início](${SITE}/): horários de culto, localização e contato`,
    `- [Texto-base](${SITE}/texto-base/): o texto-base da igreja`,
    `- [Devocionais](${SITE}/devocionais/): devocionais semanais`,
    `- [Vídeos](${SITE}/videos/): mensagens, cultos e transmissões`, '',
    '## Devocionais recentes', '',
    ...posts.slice(0, 5).map((p) => `- [${p.title}](${SITE}/devocionais/${p.slug}/): ${p.ref}, ${p.author}`), '',
    '## Optional', '',
    `- [Bíblia (Almeida Revista e Corrigida, 1911)](${SITE}/biblia/): texto em domínio público`, ''
  ].join('\n');
  fs.writeFileSync(path.join(OUT, 'llms.txt'), llms);
  // lastmod só onde há data real (devocionais, texto-base, vídeos). Usar a data do build em tudo faria o Google ignorar o campo.
  const day = (s) => String(s || '').slice(0, 10);
  const newest = (list) => list.filter(Boolean).sort().pop() || '';
  const videoDay = newest(videos.map((v) => day(v.publishedAt)));
  const LASTMOD = { '/': newest([...posts.map((p) => p.updated), foundation.date, videoDay]), '/texto-base/': foundation.date, '/devocionais/': newest(posts.map((p) => p.updated)), '/videos/': videoDay };
  posts.forEach((p) => { LASTMOD[`/devocionais/${p.slug}/`] = p.updated; });
  const lastmod = (pg) => (LASTMOD[pg.url] ? `<lastmod>${LASTMOD[pg.url]}</lastmod>` : '');
  // sitemap.xml é um índice com dois arquivos: páginas do site e Bíblia (1.189 capítulos + livros). Assim o Search Console mostra a indexação de cada grupo separadamente.
  const urlset = (list) => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${list.map((pg) => `<url><loc>${SITE}${pg.url}</loc>${lastmod(pg)}</url>`).join('\n')}\n</urlset>\n`;
  const isBible = (pg) => pg.url.startsWith('/biblia/') && pg.url !== '/biblia/';
  fs.writeFileSync(path.join(OUT, 'sitemap-paginas.xml'), urlset(pages.filter((pg) => !isBible(pg))));
  fs.writeFileSync(path.join(OUT, 'sitemap-biblia.xml'), urlset(pages.filter(isBible)));
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<sitemap><loc>${SITE}/sitemap-paginas.xml</loc></sitemap>\n<sitemap><loc>${SITE}/sitemap-biblia.xml</loc></sitemap>\n</sitemapindex>\n`);
}
console.log(`Site gerado em public/: ${pages.length} páginas${SITE ? '' : ' (sem SITE_URL: sitemap e links canônicos omitidos)'}.`);
