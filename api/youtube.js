const CHANNEL_ID = 'UCSQl8zLsF2-LWAIQu01Ua6A';
const CHANNEL_LIVE_URL = 'https://www.youtube.com/@IECConjuntoEsperan%C3%A7a/live';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const REQUEST_TIMEOUT_MS = 9000;

function decodeXml(value) {
  return String(value || '').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (match, entity) => {
    const key = entity.toLowerCase();
    if (key === 'amp') return '&';
    if (key === 'lt') return '<';
    if (key === 'gt') return '>';
    if (key === 'quot') return '"';
    if (key === 'apos') return "'";
    const codePoint = key.startsWith('#x') ? parseInt(key.slice(2), 16) : parseInt(key.slice(1), 10);
    try { return String.fromCodePoint(codePoint); } catch (_error) { return match; }
  });
}

function xmlTag(xml, tag) {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(xml || '').match(new RegExp(`<${escapedTag}\\b[^>]*>([\\s\\S]*?)<\\/${escapedTag}>`, 'i'));
  return match ? decodeXml(match[1].trim()) : '';
}

function parseFeed(xml) {
  const entries = String(xml || '').match(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi) || [];
  return entries.map((entry) => {
    const id = xmlTag(entry, 'yt:videoId');
    const title = xmlTag(entry, 'title');
    const publishedAt = xmlTag(entry, 'published');
    if (!VIDEO_ID_PATTERN.test(id) || !title) return null;
    return {
      id,
      title,
      publishedAt: Number.isFinite(Date.parse(publishedAt)) ? publishedAt : null,
      url: `https://www.youtube.com/watch?v=${id}`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    };
  }).filter(Boolean).sort((a, b) => Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0)).slice(0, 6);
}

function readText(value) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  if (typeof value.content === 'string') return value.content;
  if (typeof value.simpleText === 'string') return value.simpleText;
  if (Array.isArray(value.runs)) return value.runs.map((run) => readText(run.text)).join('');
  return '';
}

function extractInitialData(html) {
  const markers = ['var ytInitialData =', 'window["ytInitialData"] =', 'ytInitialData ='];
  let start = -1;
  let marker = '';
  for (const candidate of markers) {
    start = html.indexOf(candidate);
    if (start >= 0) { marker = candidate; break; }
  }
  if (start < 0) return null;
  const objectStart = html.indexOf('{', start + marker.length);
  if (objectStart < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = objectStart; index < html.length; index += 1) {
    const char = html[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
    } else if (char === '"') inString = true;
    else if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        try { return JSON.parse(html.slice(objectStart, index + 1)); } catch (_error) { return null; }
      }
    }
  }
  return null;
}

function collectVideoModels(node, models, seen) {
  if (!node || typeof node !== 'object' || seen.has(node)) return;
  seen.add(node);
  if (node.videoRenderer && typeof node.videoRenderer === 'object') models.push(node.videoRenderer);
  if (node.lockupViewModel && node.lockupViewModel.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO') models.push(node.lockupViewModel);
  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') collectVideoModels(value, models, seen);
  }
}

function badgeIsLive(badge) {
  if (!badge || typeof badge !== 'object') return false;
  const text = readText(badge.text).trim().toUpperCase();
  const style = String(badge.badgeStyle || badge.style || '').toUpperCase();
  return style.includes('LIVE') || ['LIVE', 'LIVE NOW', 'AO VIVO'].includes(text);
}

function modelIsLive(model) {
  if (model.isLive === true || model.isLiveNow === true || model.liveBroadcastDetails?.isLiveNow === true) return true;

  const lockupOverlays = model.contentImage?.thumbnailViewModel?.overlays || [];
  for (const overlay of lockupOverlays) {
    const badges = overlay.thumbnailBottomOverlayViewModel?.badges || [];
    if (badges.some((item) => badgeIsLive(item.thumbnailBadgeViewModel))) return true;
    const timeStatus = overlay.thumbnailOverlayTimeStatusRenderer;
    if (timeStatus && (String(timeStatus.style || '').toUpperCase().includes('LIVE') || badgeIsLive(timeStatus))) return true;
  }

  const legacyBadges = model.badges || [];
  if (legacyBadges.some((item) => badgeIsLive(item.metadataBadgeRenderer))) return true;
  const legacyOverlays = model.thumbnailOverlays || [];
  return legacyOverlays.some((item) => {
    const status = item.thumbnailOverlayTimeStatusRenderer;
    return status && (String(status.style || '').toUpperCase().includes('LIVE') || badgeIsLive(status));
  });
}

function modelToLive(model) {
  const id = model.contentId || model.videoId;
  if (!VIDEO_ID_PATTERN.test(String(id || ''))) return null;
  const title = readText(model.metadata?.lockupMetadataViewModel?.title || model.title) || 'Transmissão ao vivo';
  return { id, title, url: `https://www.youtube.com/watch?v=${id}`, thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
}

function findLiveOnChannelPage(html) {
  const data = extractInitialData(html);
  if (!data) throw new Error('Não foi possível ler os dados públicos do canal.');
  const models = [];
  collectVideoModels(data, models, new Set());
  for (const model of models) {
    if (!modelIsLive(model)) continue;
    const live = modelToLive(model);
    if (live) return live;
  }
  return null;
}

async function fetchText(url, accept) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': accept,
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.7'
      },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`YouTube respondeu com HTTP ${response.status}.`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchLiveWithApiKey(apiKey) {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('channelId', CHANNEL_ID);
  url.searchParams.set('eventType', 'live');
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', '1');
  url.searchParams.set('key', apiKey);
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`YouTube Data API respondeu com HTTP ${response.status}.`);
  const data = await response.json();
  const item = data.items?.[0];
  const id = item?.id?.videoId;
  if (!VIDEO_ID_PATTERN.test(String(id || ''))) return null;
  return {
    id,
    title: item.snippet?.title || 'Transmissão ao vivo',
    url: `https://www.youtube.com/watch?v=${id}`,
    thumbnail: item.snippet?.thumbnails?.high?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  };
}

async function checkLive() {
  if (process.env.YOUTUBE_API_KEY) {
    try {
      return { available: true, live: await fetchLiveWithApiKey(process.env.YOUTUBE_API_KEY) };
    } catch (_error) {
      // Fall back to the public channel page if the optional Data API key is absent or unavailable.
    }
  }
  try {
    const html = await fetchText(CHANNEL_LIVE_URL, 'text/html,application/xhtml+xml');
    return { available: true, live: findLiveOnChannelPage(html) };
  } catch (_error) {
    return { available: false, live: null };
  }
}

module.exports = async function youtubeHandler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  const [feedResult, liveResult] = await Promise.allSettled([
    fetchText(FEED_URL, 'application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8'),
    checkLive()
  ]);
  const feedAvailable = feedResult.status === 'fulfilled';
  const liveCheck = liveResult.status === 'fulfilled' ? liveResult.value : { available: false, live: null };
  const videos = feedAvailable ? parseFeed(feedResult.value) : [];
  const payload = {
    videos,
    feedAvailable,
    live: liveCheck.live,
    liveStatus: liveCheck.available ? (liveCheck.live ? 'live' : 'offline') : 'unknown',
    checkedAt: new Date().toISOString()
  };

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', process.env.YOUTUBE_API_KEY
    ? 'public, s-maxage=900, stale-while-revalidate=300'
    : 'public, s-maxage=90, stale-while-revalidate=180');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.end(JSON.stringify(payload));
};
