# iamago-app-frontend

React + TypeScript single-page app for iamago, built with Vite and
[Mantine](https://mantine.dev).

The companion API lives in [`iamago-app-backend`](https://github.com/joshuahufford/iamago-app-backend).

## Stack

| Concern        | Choice                         |
| -------------- | ------------------------------ |
| Build tool     | Vite 8                         |
| UI library     | React 19 + TypeScript 6        |
| Components     | Mantine 9 (`@mantine/core`)    |
| Forms          | `@mantine/form`                |
| Server state   | TanStack Query 5               |
| HTTP           | axios (with JWT refresh)       |
| Routing        | React Router 7                 |
| Icons          | `@tabler/icons-react`          |
| Maps           | `@vis.gl/react-google-maps`    |
| Tests          | Vitest + Testing Library       |
| Lint           | oxlint                         |

## Quick start

```bash
npm install
npm run dev
```

The app runs on http://localhost:5173. Requests to `/api` are proxied to
`http://localhost:8000` (the Django dev server), so the browser sees a
same-origin API and CORS never comes into play locally. Point the proxy
somewhere else with `VITE_PROXY_TARGET`.

Start the backend first — see its README — then register an account at
http://localhost:5173/register.

## Scripts

| Command             | Does                                        |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Dev server with HMR                         |
| `npm run build`     | Typecheck then build to `dist/`             |
| `npm run preview`   | Serve the production build locally          |
| `npm test`          | Run the test suite once                     |
| `npm run test:watch`| Watch mode                                  |
| `npm run lint`      | oxlint                                      |
| `npm run typecheck` | TypeScript only                             |

## Project layout

```
src/
  api/          axios client, error helpers, endpoint wrappers, shared types
  auth/         token storage, auth context/provider, route guards
  components/   layouts (public + signed-in), Logo, colour scheme toggle
  discovery/    the patient-facing quiz, result cards, map and contact form
  portal/       the practitioner portal (overview, enquiries, listing editor)
  pages/        one component per route
  test/         Vitest setup, a provider-wired render helper, and fixtures
  App.tsx       route table
  main.tsx      provider tree and entry point
  theme.ts      Mantine theme built from the logo palette
```

`@/` is an alias for `src/`, configured in both `vite.config.ts` and
`tsconfig.app.json`.

### How auth works

1. `POST /api/auth/login/` returns an access token, a refresh token and the
   user record. Tokens go to `localStorage` via `src/auth/tokens.ts`.
2. A request interceptor attaches `Authorization: Bearer <access>` to every call.
3. On a `401`, a response interceptor refreshes the access token once and
   replays the original request. Parallel 401s share a single refresh rather
   than firing one each.
4. If the refresh fails, tokens are cleared and a `iamago:session-expired`
   event drops the session, which sends the user back to `/login`.

`tokens.ts` is the only module that touches storage, so moving the refresh
token to an httpOnly cookie later is a change in one file.

### Error handling

The backend returns every failure as `{"detail": str, "errors": {field: [...]}}`.
`fieldErrors()` maps `errors` onto form inputs and `errorMessage()` produces a
human-readable fallback — so validation failures land on the field that caused
them, and only unattached errors become a toast.

### Adding a page

1. Create the component in `src/pages/`.
2. Add a `<Route>` to `src/App.tsx` (inside `<ProtectedRoute>` if it needs a
   signed-in user).
3. Add a nav entry to `NAV_ITEMS` in `src/components/AppLayout.tsx`.
4. Put API calls in `src/api/` and read them with TanStack Query.

## Configuration

| Variable             | Default  | Purpose                                        |
| -------------------- | -------- | ---------------------------------------------- |
| `VITE_API_BASE_URL`  | `/api`   | Base URL for API calls (inlined at build time) |
| `VITE_PROXY_TARGET`  | `http://localhost:8000` | Dev-server proxy target         |

Vite inlines `VITE_*` variables into the bundle at build time, so set
`VITE_API_BASE_URL` when building the production image, not at runtime.

## Production build

```bash
npm run build          # outputs dist/
docker build -t iamago-frontend --build-arg VITE_API_BASE_URL=https://api.example.com/api .
```

The Docker image serves `dist/` with nginx, configured to fall back to
`index.html` so client-side routes resolve on a hard refresh.

## Routes

| Path                    | Access        | What it is                            |
| ----------------------- | ------------- | ------------------------------------- |
| `/`                     | **Public**    | The discovery quiz and results         |
| `/recommendations/:id`  | **Public**    | A saved result, opened by claim token  |
| `/login`, `/register`   | Signed out    | Auth                                   |
| `/dashboard`            | Signed in     | Patient dashboard: past searches and enquiries |
| `/portal`               | **Practitioner** | Overview: impressions, clicks, enquiries |
| `/portal/enquiries`     | **Practitioner** | Enquiries, and recording a response  |
| `/portal/listing`       | **Practitioner** | Editing their own listing            |
| `/profile`              | Signed in     | Account details and password           |

The homepage is deliberately **not** behind a login wall: a visitor runs the
whole flow and sees their matches before they ever make an account.

## The discovery flow

Three short steps, in `src/discovery/DiscoveryQuiz.tsx`:

1. **Concerns** (required) — what the visitor is trying to solve. This comes
   first because most people know their problem, not the modality that treats it.
2. **Approach** (optional, skippable) — a modality preference. Skipping it is
   normal; the backend infers suitable approaches from the concerns.
3. **Location** — a city or postal code, plus radius, telehealth and
   accepting-new-patients filters.

Submitting returns at most three practitioners. Each card lists the reasons the
engine gave, so the ranking is explainable rather than a black box, and
`partner` / `verified` practitioners carry a badge.

Results get a real URL — `/recommendations/:id?token=…` — so they can be
bookmarked and shared. The token is what grants access, not an account, which
is what makes the link work before sign-up. An id on its own is not enough to
read someone else's results.

## The map

`src/discovery/ResultsMap.tsx` plots **only the practitioners we recommended**,
never the whole directory, so the map never implies choices the flow did not
make. Hovering a card highlights its pin, and the map frames itself to the
results rather than guessing a zoom level.

The browser key comes from the backend (`/api/directory/map-config/`) rather
than being baked into the bundle, so it can be rotated in one place. With no key
configured the component renders a clear "map view unavailable" panel and the
results are unaffected — the list is always complete.

> **Not yet verified against live Google tiles.** Everything up to and including
> the API loader receiving the key is covered by tests, but rendering real map
> tiles needs a Google Maps browser key, which this build did not have. Set
> `GOOGLE_MAPS_BROWSER_KEY` on the backend and check the map once before
> shipping it.

## Brand

`src/theme.ts` builds the Mantine palette from the logo: teal (`#00a69c`) is the
primary, with plum, sky, indigo, coral and pink available as accents.

The logo lives in `src/components/Logo.tsx` as inline SVG rather than an
`<img>`, because the wordmark is drawn with `currentColor` — an `<img>` cannot
inherit it, which would leave the word invisible in dark mode. `public/logo.svg`
and `public/logo-mark.svg` are kept for favicons and external use.

## Distances and the search limit

Distances are **miles** throughout — the radius options, the API payload
(`radius_miles`) and the values on each result (`distance_miles`).

Searching is metered per visitor per day by the backend. Inside the free
allowance nothing appears; once it is spent the API answers `429` with
`code: "email_required"`, and `HomePage` flips `DiscoveryQuiz` into its
`requiresEmail` state, which adds an email field to the location step and
keeps the answers already given. The microcopy changes with it — claiming
"no account needed" while asking for an email would be a lie.

`errorCode()` in `src/api/client.ts` reads that `code`, alongside
`errorMessage()` and `fieldErrors()`.

## Click tracking

`directoryApi.recordEvent(practitionerId, kind, requestId)` reports a
click-through on a phone number or website. It is deliberately fire-and-forget:
nothing is awaited and errors are swallowed, because analytics must never
interrupt a visitor.

Impressions are **not** sent from here — the backend records those when it
produces a recommendation, so partner numbers cannot be inflated by the client.

## Contact requests

`ContactRequestModal` is how a patient asks a practitioner to get in touch.

Sharing the health concerns from the search is **opt-in and off by default**,
and the consent checkbox's wording changes with it — it names exactly what will
be shared and with whom, because that sentence is stored verbatim on the server
as the record of what was agreed.

`EmailMatchesButton` mails a visitor their own results. The claim token
authorises the send, so nobody can have someone else's matches mailed anywhere.

## Practitioner portal

`/portal` needs more than a signed-in user: the account has to be linked to a
listing. `PortalGuard` checks that by calling `/api/portal/me/` and, on a 403,
explains the situation rather than showing an empty dashboard.

- **Overview** — impressions, click-throughs, click rate and enquiries over a
  selectable window. These are the numbers a partner is paying for.
- **Enquiries** — opening one *fetches the detail*, which is what records the
  access server-side, so a practitioner is only counted as having read an
  enquiry when they actually open it. Where a patient withheld their concerns,
  the modal says so rather than showing an empty space.
- **My listing** — tier and publication state are absent from this form on
  purpose; they are iamago's to set.

## Patient dashboard

`/dashboard` is what a signed-in patient came back for, in two tabs:

- **Past searches** — what they asked for, who came back, and a link straight
  into the full results (the same tokenised link, so it keeps working).
- **Practitioners I contacted** — each enquiry and how far it has got, from
  *Sent* through *Seen by them* to *They replied*. It also restates what was
  shared, because the patient should not have to remember what they agreed to.

Searches and enquiries made while signed in land here automatically. Ones made
beforehand are picked up by `SaveSearchButton` on the results page, which offers
to attach an anonymous search to the account.

That is deliberately a button rather than an automatic claim: result links are
shareable, and silently filing someone else's search — and the health concerns
attached to it — under whoever opened the link would be wrong.
