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
  components/   AppShell layout, color scheme toggle
  pages/        one component per route
  test/         Vitest setup and a render helper wired with every provider
  App.tsx       route table
  main.tsx      provider tree and entry point
  theme.ts      Mantine theme (brand palette, defaults)
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
