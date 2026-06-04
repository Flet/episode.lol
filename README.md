# episode.lol (2026)

> Pick a random episode of your favorite TV show  now with a glowing CRT/VHS makeover.

A rebuild of [episode.lol](https://episode.lol) on **Astro + React islands**, deployed to
**Netlify**, with data from **TheTVDB v4**.

## What it does

- Search any TV show and browse results as a retro TV-guide grid.
- Open a show and press **Pick a random episode** or tap the VHS box to land on a random episode
- Rich episode detail: still, synopsis, director/writers, guest stars, full cast, ratings,
  network, genres, and where the episode falls in the series.
- A 3D VHS tape built from the show's **poster** (sleeve face) and **banner** (spine).
- Favorites, random-pick history, recent searches  all stored locally in the browser.
- Shareable deep links to a specific pick (`/series/{id}?ep={episodeId}`).
- Fully responsive / mobile-friendly.

## Architecture

- Pages are static Astro shells; interactivity lives in React islands
  (`Home`, `ShowView`, `EpisodeDetail`, `VHSTape`).
- Data is fetched client-side from `/api/*` **server endpoints** that compile to Netlify
  Functions, so the TheTVDB key/token **never reach the browser**.
- `src/lib/tvdb.ts` handles v4 login + token caching; `src/lib/map.ts` normalizes payloads.

```
src/
  components/   Home, ShowView, EpisodeDetail, VHSTape (islands)
  layouts/      Base.astro (CRT frame, fonts, GA4)
  lib/          tvdb.ts, map.ts, types.ts, storage.ts, respond.ts
  pages/        index.astro, series/[id].astro
  pages/api/    search.ts, series/[id].ts, episode/[id].ts
  styles/       global.css (retro design system, responsive)
```

## Local development

```bash
npm install
cp .env.example .env     # then fill in TVDB_API_KEY
npm run dev              # http://localhost:4321
```

### Environment variables

| Variable        | Required | Notes                                                        |
| --------------- | -------- | ------------------------------------------------------------ |
| `TVDB_API_KEY`  | yes      | TheTVDB v4 API key (server-side only).                       |
| `TVDB_PIN`      | maybe    | Only for "user-supported" subscriber keys.                   |
| `PUBLIC_GA4_ID` | no       | Google Analytics 4 measurement id (`G-XXXXXXXXXX`).          |

## Deploy (Netlify)

1. Connect this repo to your Netlify site.
2. Build command `npm run build`, publish dir `dist` (already in `netlify.toml`).
3. Add `TVDB_API_KEY` (+ `TVDB_PIN`, `PUBLIC_GA4_ID`) under
   **Site settings → Environment variables**.

The `@astrojs/netlify` adapter turns the API routes into serverless functions automatically.

## Credits

TV information and images provided by [TheTVDB.com](https://thetvdb.com). Not endorsed or
certified by TheTVDB.com or its affiliates.

[LICENSE](LICENSE)