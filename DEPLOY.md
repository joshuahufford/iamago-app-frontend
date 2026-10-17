# Deploying to Vercel

The frontend is a static Vite build — no server, no Node runtime in production.
It is served at **https://iamago.com** and talks to the backend at
**https://api.iamago.com**.

## 1. Import the project

1. Vercel → **Add New → Project** → import this repository.
2. Framework preset: **Vite** (auto-detected).
3. Leave build command and output directory alone — `vercel.json` sets them
   (`npm run build` → `dist`).

## 2. Environment variables

Only one is required, and it matters more than it looks:

| Variable | Value | Scope |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `https://api.iamago.com/api` | Production, Preview, Development |

**This is a build-time value, not a runtime one.** Vite inlines every `VITE_*`
variable into the bundle, so changing it requires a **redeploy** — editing it in
the dashboard does nothing to a build that already happened.

Without it the app falls back to `/api`, which in production resolves to
*Vercel*, not your backend. Every call 404s and nothing looks obviously wrong.
The build prints a loud warning if it is missing; check the build log once.

Note the `/api` suffix — the backend mounts its routes under `/api/`, so the
value is `https://api.iamago.com/api`, not the bare host.

## 3. Custom domain

1. Project → **Settings → Domains** → add `iamago.com` and `www.iamago.com`.
2. Follow Vercel's DNS instructions (an apex `A`/`ALIAS` record plus a `www`
   `CNAME`, exact values shown in the dashboard).
3. Pick one as primary and let Vercel redirect the other.

Note `api.iamago.com` stays pointed at Railway — only the apex and `www` move
to Vercel.

## 4. Let the backend accept the browser

The API is cross-origin, so the backend must name this site. On Railway set:

```
CORS_ALLOWED_ORIGINS=https://iamago.com,https://www.iamago.com
```

For preview deployments, whose hostname changes every build:

```
CORS_ALLOWED_ORIGIN_REGEXES=^https://iamago-app-frontend-[a-z0-9-]+\.vercel\.app$
```

Keep that anchored at both ends — unanchored it would also match
`https://iamago-app-frontend-evil.attacker.com`.

## 5. Check it

- `https://iamago.com` → the quiz loads and the concern chips populate (they
  come from the API, so chips appearing means CORS and the base URL are both
  right).
- Run a search through to results.
- **Hard-refresh a deep link** such as `/portal` or a `/recommendations/<id>`
  URL. This is the one that catches a missing SPA rewrite.

## Why `vercel.json` exists

**Rewrites.** This is a single-page app: the server only has `index.html`.
Without the catch-all rewrite, refreshing `/portal/enquiries` or opening a
shared `/recommendations/<id>` link asks Vercel for a file that does not exist
and gets a 404. Static files are matched before rewrites, so `/assets/*` is
unaffected.

**Cache headers.** Vite fingerprints asset filenames, so those can be cached
forever; `index.html` must not be, or a deploy keeps serving the old asset
references.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| 404 on refresh, fine when navigating in-app | SPA rewrite missing |
| Chips never load; console shows CORS errors | Backend `CORS_ALLOWED_ORIGINS` missing this origin |
| API calls 404 against your own domain | `VITE_API_BASE_URL` unset at build time |
| Calls go to the right host but 404 | `/api` suffix missing from the value |
| Preview works, production does not (or vice versa) | Variable not set for that environment, or set after the build |
| Changed the variable, nothing happened | Redeploy — it is inlined at build time |
| Map panel says unavailable | Backend `GOOGLE_MAPS_BROWSER_KEY` unset; everything else still works |

## Not yet verified

The Google map has never been rendered against live tiles — that needs a
browser key. Everything up to the loader receiving the key is tested and the
no-key fallback is verified, but look at the map once after setting
`GOOGLE_MAPS_BROWSER_KEY` on the backend.

Browser testing was Chromium-only. `light-dark()`, used for theme-aware colour,
is Baseline 2024 (Chrome 123, Safari 17.5, Firefox 120) but is unverified here
in Safari and Firefox.
