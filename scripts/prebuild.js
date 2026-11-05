// Roda antes do build.js (ver vercel.json): atualiza content/videos.json com os
// vídeos mais recentes do canal e baixa as miniaturas para assets/yt/, para o site
// servi-las do próprio domínio com cache longo. Se a rede falhar, nada é alterado.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const CHANNEL_ID = 'UCSQl8zLsF2-LWAIQu01Ua6A';
const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const ID = /^[A-Za-z0-9_-]{11}$/;

const decode = (v) => String(v || '').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (m, e) => {
  const k = e.toLowerCase();
  if (k === 'amp') return '&'; if (k === 'lt') return '<'; if (k === 'gt') return '>'; if (k === 'quot') return '"'; if (k === 'apos') return "'";
  try { return String.fromCodePoint(k[1] === 'x' ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10)); } catch (_) { return m; }
});
const tag = (xml, t) => { const m = xml.match(new RegExp(`<${t}\\b[^>]*>([\\s\\S]*?)</${t}>`, 'i')); return m ? decode(m[1].trim()) : ''; };
const get = (url) => fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(10000) });

(async () => {
  try {
    const res = await get(FEED);
    if (!res.ok) throw new Error('feed HTTP ' + res.status);
    const xml = await res.text();
    const videos = (xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || []).map((e) => ({ id: tag(e, 'yt:videoId'), title: tag(e, 'title'), publishedAt: tag(e, 'published') }))
      .filter((v) => ID.test(v.id) && v.title && Number.isFinite(Date.parse(v.publishedAt)))
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 6);
    if (!videos.length) throw new Error('feed sem vídeos');
    fs.writeFileSync(path.join(ROOT, 'content/videos.json'), JSON.stringify(videos, null, 2) + '\n');
    console.log(`prebuild: ${videos.length} vídeos atualizados`);
    fs.mkdirSync(path.join(ROOT, 'assets/yt'), { recursive: true });
    for (const v of videos) {
      const file = path.join(ROOT, 'assets/yt', v.id + '.jpg');
      if (fs.existsSync(file)) continue;
      try {
        const r = await get(`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`);
        if (!r.ok || !(r.headers.get('content-type') || '').startsWith('image/')) throw new Error('HTTP ' + r.status);
        fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
        console.log('prebuild: miniatura baixada ' + v.id);
      } catch (e) { console.warn('prebuild: sem miniatura local para ' + v.id + ' (' + e.message + ')'); }
    }
  } catch (e) {
    console.warn('prebuild: mantendo content/videos.json atual (' + e.message + ')');
  }
})();
