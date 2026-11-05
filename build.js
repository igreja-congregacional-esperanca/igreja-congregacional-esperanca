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
const FONTS = 'https://fonts.googleapis.com/css2?family=Lora:wght@500;600&family=Inter:wght@400;500;600&display=swap';

const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const json = (f) => JSON.parse(read(f));
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const fmt = (d) => { const p = d.split('-'); return +p[2] + ' ' + MONTHS[+p[1] - 1] + ' ' + p[0]; };

// ---------- conteúdo ----------
function parsePost(file) {
  const raw = read('content/devocionais/' + file).replace(/\r\n/g, '\n');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('Front matter ausente em ' + file);
  const meta = {};
  m[1].split('\n').forEach((line) => { const i = line.indexOf(':'); if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim(); });
  for (const k of ['titulo', 'categoria', 'autor', 'data', 'referencia']) if (!meta[k]) throw new Error(`Campo "${k}" ausente em ${file}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.data)) throw new Error('Data inválida em ' + file);
  const slug = file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
  const paragraphs = m[2].trim().split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return { slug, title: meta.titulo, cat: meta.categoria, author: meta.autor, date: meta.data, ref: meta.referencia, paragraphs };
}
const posts = fs.readdirSync(path.join(ROOT, 'content/devocionais')).filter((f) => f.endsWith('.md')).map(parsePost)
  .sort((a, b) => b.date.localeCompare(a.date));
const slugs = new Set();
posts.forEach((p) => { if (slugs.has(p.slug)) throw new Error('Slug repetido: ' + p.slug); slugs.add(p.slug); });
const foundation = json('content/texto-base.json');
const events = json('content/eventos.json');
const videos = json('content/videos.json');

// ---------- peças de HTML ----------
const css = read('src/style.css');
const top = read('src/top.html');
const footer = read('src/footer.html');
const appJs = read('src/app.js');
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
const appName = 'app.' + hash(appJs) + '.js';

const NAV = [['/', 'Início', 'inicio'], ['/texto-base/', 'Texto-base', 'texto-base'], ['/devocionais/', 'Devocionais', 'devocionais'], ['/videos/', 'Vídeos', 'videos'], ['/eventos/', 'Eventos', 'eventos'], ['/#sobre', 'Sobre', 'sobre']];
const crumb = (label) => `<div class="crumb"><a href="/">Início</a> › ${label}</div>`;
const card = (p) => `<a class="card" href="/devocionais/${p.slug}/" data-cat="${esc(p.cat)}"><span class="tag">${esc(p.cat)}</span><h3>${esc(p.title)}</h3><p>${esc(p.paragraphs[0].slice(0, 110))}…</p><div class="meta">${esc(p.author)} · ${fmt(p.date)}</div></a>`;

function youtubeCard(v) {
  const id = v.id, title = esc(v.title || 'Vídeo recente');
  const d = v.publishedAt ? new Date(v.publishedAt) : null;
  const dateText = d && !isNaN(d) ? new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Fortaleza' }).format(d) : 'Vídeo recente';
  return `<article class="youtube-card"><div class="youtube-thumb"><button type="button" data-play-video="${id}" data-video-title="${title}" aria-label="Reproduzir dentro do site: ${title}"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" width="480" height="360" alt="Miniatura do vídeo: ${title}" loading="lazy" decoding="async"><span class="youtube-play" aria-hidden="true">▶</span></button></div><div class="youtube-info"><h3>${title}</h3><span class="youtube-date">Publicado em ${dateText}</span><a class="youtube-date" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer">Abrir no YouTube ↗</a></div></article>`;
}
const youtubeSection = () => `<section class="youtube-section" id="videos"><div class="sec"><h2>Vídeos recentes</h2><a href="${CHANNEL}" target="_blank" rel="noopener noreferrer">Ver canal →</a></div><div id="youtube-live" class="live-card" hidden aria-live="polite"></div><div id="youtube-grid" class="youtube-grid" aria-live="polite">${videos.map(youtubeCard).join('')}</div><p id="youtube-status" class="youtube-note" aria-live="polite">Prévia dos vídeos recentes; a lista está sendo atualizada.</p><script type="application/json" id="yt-initial">${JSON.stringify(videos).replace(/</g, '\\u003c')}</script></section>`;

const GALLERY = [
  { base: 'santuario-google-maps', widths: [480, 800], w: 800, h: 1067, alt: 'Espaço de culto da Igreja Congregacional no Conjunto Esperança', t: 'Nosso espaço de culto', c: 'Um lugar de comunhão e adoração.' },
  { base: 'assentos-google-maps', widths: [360], w: 360, h: 640, alt: 'Assentos e interior do espaço de culto', t: 'Nosso espaço de culto', c: 'Um ambiente preparado para receber a comunidade.' },
  { base: 'fachada-google-maps', widths: [480, 800], w: 800, h: 1067, alt: 'Fachada da Igreja Congregacional do Conjunto Esperança em Fortaleza', t: 'Nossa igreja', c: 'Estamos na Rua 104, nº 227, em Fortaleza.' },
  { base: 'santuario-alternativo-google-maps', widths: [480, 800], w: 800, h: 1067, alt: 'Vista alternativa do santuário da igreja', t: 'Espaço de culto', c: 'Nosso lugar de encontro e adoração.' },
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

function addPage({ url, title, desc, active, body, head = '' }) { pages.push({ url, title, desc, active, body, head }); }

addPage({
  url: '/', active: 'inicio', head: REDIRECT,
  title: 'Igreja Congregacional · Conjunto Esperança', desc: 'Igreja Congregacional · Conjunto Esperança, em Fortaleza. Devocionais, vídeos dos cultos, horários e endereço.',
  body: `<section class="hero"><small>Conjunto Esperança · Fortaleza</small><h1>Tudo para a glória de Deus, no culto e na vida.</h1><p>Devocionais e reflexões da nossa igreja, fundamentados nas Escrituras e centrados em Cristo.</p><a class="btn" href="/devocionais/">Ler devocionais</a><a class="btn ghost" href="/eventos/">Ver cultos</a></section>` +
    `<div class="sec"><h2>Texto-base da igreja</h2><a href="/texto-base/">Ler texto-base →</a></div><div class="card" style="margin-bottom:36px"><span class="tag">${esc(foundation.ref)}</span><h3>Texto-base para a igreja</h3><p>${esc(foundation.text[0])}</p><div class="meta">${esc(foundation.author)} · ${fmt(foundation.date)}</div></div>` +
    `<div class="sec"><h2>A igreja em imagens</h2><a href="${MAPS}" target="_blank" rel="noopener noreferrer">Ver perfil no Google Maps →</a></div>${gallery()}` +
    youtubeSection() + `<div class="sec"><h2>Últimos devocionais</h2><a href="/devocionais/">Ver todos →</a></div><div class="grid">${posts.slice(0, 3).map(card).join('')}</div>`
});
addPage({
  url: '/texto-base/', active: 'texto-base', title: 'Texto-base · Igreja Congregacional Conjunto Esperança', desc: foundation.text[0].slice(0, 155),
  body: `${crumb('Texto-base')}<article><span class="tag">Texto-base da igreja</span><h1>Texto-base para a igreja</h1><div class="ref">${esc(foundation.ref)}</div>${foundation.text.map((p) => `<p>${esc(p)}</p>`).join('')}<div class="meta">${esc(foundation.author)} · ${fmt(foundation.date)}</div></article>`
});
const cats = ['Todos'].concat(posts.map((p) => p.cat).filter((v, i, a) => a.indexOf(v) === i));
addPage({
  url: '/devocionais/', active: 'devocionais', title: 'Devocionais · Igreja Congregacional Conjunto Esperança', desc: 'Palavras curtas para alimentar a sua fé a cada semana.',
  body: `${crumb('Devocionais')}<h1 class="page-title">Devocionais</h1><p class="lead">Palavras curtas para alimentar a sua fé a cada semana.</p><div class="filters" hidden>${cats.map((c, i) => `<button type="button" class="${i === 0 ? 'on' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="grid">${posts.map(card).join('')}</div>`
});
posts.forEach((p) => addPage({
  url: `/devocionais/${p.slug}/`, active: 'devocionais', title: `${p.title} · Devocional · Conjunto Esperança`, desc: p.paragraphs[0].slice(0, 155),
  body: `<article><a class="back" href="/devocionais/">← Todos os devocionais</a><div style="margin-top:22px"><span class="tag">${esc(p.cat)}</span></div><h1>${esc(p.title)}</h1><div class="meta" style="margin-bottom:6px">${esc(p.author)} · ${fmt(p.date)}</div><div class="ref">${esc(p.ref)}</div>${p.paragraphs.map((x) => `<p>${esc(x)}</p>`).join('')}</article>`
}));
addPage({
  url: '/videos/', active: 'videos', title: 'Vídeos · Igreja Congregacional Conjunto Esperança', desc: 'Mensagens, cultos e transmissões da Igreja Congregacional · Conjunto Esperança.',
  body: `${crumb('Vídeos')}<h1 class="page-title">Vídeos do canal</h1><p class="lead">Mensagens, cultos e transmissões da Igreja Congregacional · Conjunto Esperança.</p>${youtubeSection()}`
});
addPage({
  url: '/eventos/', active: 'eventos', title: 'Cultos e eventos · Igreja Congregacional Conjunto Esperança', desc: 'Horários dos cultos e endereço: R. 104, 227 — Conjunto Esperança, Fortaleza.',
  body: `${crumb('Eventos')}<h1 class="page-title">Eventos e cultos</h1><p class="lead">Venha nos visitar, você é bem-vindo.</p><div class="grid">${events.map((e) => `<div class="card"><span class="tag">${esc(e.dia)}</span><h3>${esc(e.titulo)}</h3><div class="meta">${esc(e.detalhe)}</div></div>`).join('')}</div>`
});

function render(pg) {
  const abs = (u) => (SITE ? SITE + u : u);
  const ogImage = SITE ? `<meta property="og:image" content="${SITE}/logo-igreja.webp">` : '';
  const canonical = SITE ? `<link rel="canonical" href="${SITE}${pg.url}">\n<meta property="og:url" content="${SITE}${pg.url}">` : '';
  const nav = NAV.map(([href, label, key]) => `<a href="${href}"${key === pg.active ? ' class="on"' : ''}>${label}</a>`).join('');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(pg.title)}</title>
<meta name="description" content="${esc(pg.desc)}">
<meta name="theme-color" content="#398b26">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${esc(pg.title)}">
<meta property="og:description" content="${esc(pg.desc)}">
${ogImage}
${canonical}
<link rel="icon" type="image/webp" href="/logo-simbolo.webp">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="${FONTS}" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="${FONTS}"></noscript>
<style>
${css}
</style>
${pg.head}
</head>
<body>
${top}<header class="main"><div class="wrap">
<a class="brand" href="/"><img class="brand-mark" src="/logo-simbolo.webp" width="34" height="34" alt="">Igreja Congregacional</a>
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
['logo-igreja.webp', 'logo-simbolo.webp'].forEach((f) => fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f)));
fs.writeFileSync(path.join(OUT, 'assets', appName), appJs);
pages.forEach((pg) => {
  const dir = path.join(OUT, pg.url);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), render(pg));
});
fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nAllow: /\n' + (SITE ? `Sitemap: ${SITE}/sitemap.xml\n` : ''));
if (SITE) {
  const lastmod = (pg) => { const m = pg.url.match(/^\/devocionais\/([^/]+)\/$/); const p = m && posts.find((x) => x.slug === m[1]); return p ? `<lastmod>${p.date}</lastmod>` : ''; };
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((pg) => `<url><loc>${SITE}${pg.url}</loc>${lastmod(pg)}</url>`).join('\n')}\n</urlset>\n`);
}
console.log(`Site gerado em public/: ${pages.length} páginas${SITE ? '' : ' (sem SITE_URL: sitemap e links canônicos omitidos)'}.`);
