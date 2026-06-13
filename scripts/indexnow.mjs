#!/usr/bin/env node
// Post-deploy IndexNow ping. Notifies Bing / Yandex / DuckDuckGo (and other
// IndexNow consumers) that our URLs changed. Google ignores IndexNow, but this
// is free and helps everyone else pick up changes within minutes.
//
// It reads the *live* sitemap so the URL list always matches what we publish.
// Run after a successful deploy:  pnpm indexnow
//
// The key is public by design — it's served at https://<host>/<key>.txt so
// IndexNow can verify we own the domain. Keep this value in sync with the file
// in public/.
const HOST = process.env.SITE_HOST || 'episode.lol';
const KEY = process.env.INDEXNOW_KEY || '2177d3f572cc236805bb1d337ca810de';
const ORIGIN = `https://${HOST}`;

async function main() {
  // Pull the published URL list straight from our own sitemap.
  const res = await fetch(`${ORIGIN}/sitemap.xml`);
  if (!res.ok) throw new Error(`Could not fetch sitemap (${res.status}).`);
  const xml = await res.text();
  const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (urlList.length === 0) throw new Error('Sitemap had no <loc> entries.');

  const body = {
    host: HOST,
    key: KEY,
    keyLocation: `${ORIGIN}/${KEY}.txt`,
    urlList, // IndexNow accepts up to 10,000 URLs per request
  };

  const submit = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  // 200 = accepted, 202 = accepted/pending. Both are success.
  if (submit.status === 200 || submit.status === 202) {
    console.log(`IndexNow: submitted ${urlList.length} URLs for ${HOST} (HTTP ${submit.status}).`);
  } else {
    const text = await submit.text().catch(() => '');
    throw new Error(`IndexNow rejected the submission (HTTP ${submit.status}). ${text}`.trim());
  }
}

main().catch((err) => {
  console.error(`IndexNow ping failed: ${err.message}`);
  process.exit(1);
});
