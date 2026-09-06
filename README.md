# Color Guard MorChor

A Radix UI + Tailwind CSS app for checking students into color-guard groups, backed by a live API.

## Pages

- `/` — page selection (links to everything below)
- `/assign` — one page per physical device (iPad). On first load it registers the device (you name it once, e.g. "iPad โต๊ะ 1") and the server assigns it a fixed color group. From then on it shows a 6-digit keypad: type a student ID, confirm the student card that pops up, and they're checked into this device's group
- `/m1`, `/m2`, `/m3`, `/m4` — full-screen "จำนวนคนที่เหลือ" live dashboard per grade, meant for a laptop/monitor, updates in real time over Server-Sent Events

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL — `/assign` on the iPad, `/m1`–`/m4` on the monitor.

## Backend

This talks to a real backend (see `src/lib/api.js`):

- `GET /api/devices/register?name=...` — registers this device once (its `id` + `colorGroup` are cached in `localStorage`)
- `GET /api/students/:id` — looks up a student by ID (6 digits)
- `POST /api/color/assign` — body `{ studentId, deviceId }`, checks the student into this device's color group
- `GET /api/color/m{grade}/live/events` — Server-Sent Events stream of `{ grade, totalStudents, colors: [{ colorGroup, capacity, assigned, remaining }] }`, used by `/m1`–`/m4`

The base URL defaults to a temporary `pinggy.net` dev tunnel in `src/lib/api.js` — copy `.env.example` to `.env` and set `VITE_API_BASE_URL` once the backend has a stable address (that tunnel URL will expire).

If a device's registration is ever wrong, clear it with `localStorage.removeItem("cgmc_device_v1")` in the browser console (or clear site data) — it'll register again on next load.

### Two pinggy-specific quirks handled in `src/lib/api.js`

- Free pinggy tunnels show an HTML "Caution" interstitial to any request that looks like a plain browser visit — every request sends `X-Pinggy-No-Screen: true` to skip it. Harmless to keep once you're off pinggy.
- The live SSE stream sends its payload as a **named** event (`event:capacity`), not a default `message` event, so it can't be read with the native `EventSource.onmessage`. `subscribeColorLive` instead reads the stream manually via `fetch` + a small line parser (this also sidesteps `EventSource`'s inability to send the header above).

### Known backend issue (as of testing)

`GET /api/devices/register` consistently returned `500 Internal Server Error` in testing, regardless of the `name` sent — this is server-side, not something the client can work around. `GET /api/students/:id` and the `/live/events` SSE stream both worked correctly. Worth checking the backend's logs for that endpoint before relying on `/assign`.

## Stack

- Vite + React
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-tabs`)
- [Tabler icons](https://tabler.io/icons) via `@tabler/icons-react`
- LINE Seed Sans TH font (`public/fonts/`, loaded via `@font-face` in `src/index.css`)
