# Pre-Flight: command.C3 Alliance PWA Desktop Dashboard

## Purpose

Establish ground truth for moving `command.c3-alliance.org` from pre-production
to production as the **PWA Desktop Dashboard for the C3 Alliance Substrate**.

This pre-flight focuses on backend wiring for the Svelte frontend.

For the global PWA entry and surface-selection design intent, see
[`C3_PWA_ONBOARDING_FLOW.md`](C3_PWA_ONBOARDING_FLOW.md). That document defines
`C3-Alliance.org` as the global browser-first entry point and keeps onboarding
behavior separate from the backend wiring blockers below.

## Source repositories inspected

Forgejo instance: `https://git.c3-voice.org`

| Repo | Role observed |
| --- | --- |
| `kosmo/command-center` | Canonical domain-owning SvelteKit PWA for `command.c3-alliance.org`. |
| `c3-alliance/cocoa-v2/apps/command` | Newer CoCoA v2 SvelteKit command app, not currently domain-owning. |
| `c3-alliance/command-c3` | Cloudflare Worker backend with D1 binding and newer API routes. |
| `kosmo/cosmic-commons` | Governance, SAGE, schema, NATS, Helm, and source-of-truth context. |
| `c3-alliance/command-center` | Older React/Vite command center; appears superseded. |

## Current ground truth

### Production domain

`kosmo/command-center/wrangler.jsonc` owns the production route:

```json
{
  "name": "command-c3-alliance",
  "routes": [
    {
      "pattern": "command.c3-alliance.org/*",
      "zone_name": "c3-alliance.org"
    }
  ]
}
```

Public probe:

```text
https://command.c3-alliance.org
```

Result: page loads and renders the Patron Board shell, but shows
`LOADING SOVEREIGN DATA...`.

### Canonical frontend

Path:

```text
kosmo/command-center
```

Stack:

- Svelte 5
- SvelteKit 2
- TypeScript
- Tailwind
- `@sveltejs/adapter-cloudflare`
- Cloudflare Workers route deployment
- PWA manifest and service worker present

Important files:

- `src/routes/+layout.svelte`
- `src/routes/dashboard/+page.svelte`
- `src/routes/identity/+page.svelte`
- `src/routes/wallet/+page.svelte`
- `src/routes/voice/+page.svelte`
- `src/routes/market/+page.svelte`
- `src/lib/auth.svelte.ts`
- `src/lib/cocoa.svelte.ts`
- `src/routes/api/inference/+server.ts`
- `src/service-worker.ts`
- `wrangler.jsonc`

### Backend services

Observed backend endpoints:

| Endpoint | Probe result |
| --- | --- |
| `https://gate.c3-voice.org/_health` | `200 OK` |
| `https://command-c3.team-d90.workers.dev/_health` | `200 OK` |
| `POST https://command-c3.team-d90.workers.dev/auth/session` with alpha token | `200 OK` |
| `GET https://gate.c3-voice.org/member/{seid}/dashboard` with alpha token | `200 OK` |
| `GET https://command-c3.team-d90.workers.dev/api/v1/member/dashboard` with alpha token | `500` |
| `GET https://command-c3.team-d90.workers.dev/channel/list` | `200 OK` |
| `GET https://gate.c3-voice.org/channel/list` | `401` |

## Main production blockers

### 1. Frontend and backend route contracts are split

The production frontend still calls older `gate.c3-voice.org` paths:

```text
GET /member/{seid}/dashboard
GET /member/{seid}/badges
GET /member/{seid}/presence
GET /credo/agent/own
GET /credo/agent/status
GET /credo/mediator/invite
GET /io/commons/ledger
```

The newer backend in `c3-alliance/command-c3` exposes:

```text
POST /auth/session
POST /auth/register/challenge
POST /auth/register/verify
POST /auth/login/challenge
POST /auth/login/verify
POST /auth/verify
GET  /api/v1/member/dashboard
GET  /api/v1/member/patronage
GET  /api/v1/member/credentials
GET  /api/v1/member/ios/active
GET  /api/v1/infra/health
GET  /channel/list
GET  /io/commons/ledger
POST /chat
POST /chat-mesh
POST /api/v1/capability/issue
GET  /api/v1/capability/test-protected
```

The frontend must either:

1. stay wired to `gate.c3-voice.org` and finish the missing gate paths, or
2. pivot to `command-c3.team-d90.workers.dev` and align all frontend calls to the
   newer `/api/v1/*` contract.

Recommendation: pivot the production PWA to the newer `command-c3` API contract,
but first fix the `500` on `/api/v1/member/dashboard`.

### 2. Auth/session method mismatch

`kosmo/command-center/src/lib/auth.svelte.ts` calls:

```ts
fetch(`${GATE}/auth/session`, {
  headers: { Authorization: `Bearer ${auth.token}` }
});
```

That is a `GET`.

`command-c3` expects:

```text
POST /auth/session
```

Production fix:

- make the frontend use `POST`, or
- make backend accept both `GET` and `POST`.

### 3. Cloudflare environment variables are not browser globals

`wrangler.jsonc` defines:

```json
{
  "vars": {
    "COCOA_WORKER_URL": "https://cocoa-worker.team-d90.workers.dev",
    "C3_GATE_URL": "https://gate.c3-voice.org"
  }
}
```

But client code checks:

```ts
declare const C3_GATE_URL: string;
```

Cloudflare Worker vars are available to the Worker runtime, not automatically as
browser globals.

Production fix:

- use SvelteKit public env (`PUBLIC_C3_GATE_URL`) where a value must be visible
  in browser code, or
- route browser calls through SvelteKit `+server.ts` endpoints that read private
  platform env server-side.

### 4. PWA installability assets are incomplete

`src/app.html` and `static/manifest.json` reference:

```text
/icon-192.png
/icon-512.png
/icon-maskable-512.png
/apple-touch-icon.png
```

But the canonical app's `static/` only contains:

```text
manifest.json
robots.txt
```

Production fix:

- add the missing icon assets,
- verify manifest installability,
- verify service worker registration and cache behavior.

### 5. Backend dashboard endpoint currently throws 500

Runtime probe:

```text
GET https://command-c3.team-d90.workers.dev/api/v1/member/dashboard
Authorization: Bearer alpha-pontisto-mayor
```

Result:

```text
500 Internal Server Error
```

This blocks pivoting the PWA to the newer backend contract.

Likely areas to inspect:

- D1 table names and columns:
  - `membroj`
  - `io_auxkcioj`
  - `patronec_eventoj`
- `member_did` relationship for the alpha SEID.
- Cloudflare Worker exception logs.

### 6. WebSocket surfaces exist in CoCoA v2 but not in backend reference

`c3-alliance/cocoa-v2/apps/command` includes:

```text
/ws/koko
/ws/kosmo
```

The inspected `command-c3` Worker does not expose WebSocket upgrade handling.

Production decision:

- Either defer WebSocket-backed live panels from the desktop PWA, or
- implement `/ws/koko` and `/ws/kosmo` behind the gateway with NATS-backed event
  fanout.

### 7. CoCoA panel inference path is inconsistent

The canonical app includes `src/routes/api/inference/+server.ts`, whose comments
say clients should call `/api/inference` so C3-TIR routing stays server-side.

But `src/lib/cocoa.svelte.ts` still exports:

```ts
export const WORKER_URL = 'https://c3-cocoa-inference.team-d90.workers.dev';
```

Production fix:

- ensure CoCoA panel calls `/api/inference`,
- keep C3-TIR/OpenRouter routing off the browser surface.

## Implementation branches opened

The first production-wiring pass was implemented in Forgejo feature branches:

| Repo | Branch | Commit | Scope |
| --- | --- | --- | --- |
| `kosmo/command-center` | `cursor/command-pwa-production-wiring-e9f7` | `5665365` | Align Svelte PWA to `command-c3`, fix auth method, remove browser-global env assumptions, route inference through `/api/inference`, add PWA icons, normalize market/commons data, clean Svelte warnings. |
| `c3-alliance/command-c3` | `cursor/command-c3-dashboard-presence-e9f7` | `e4def0a` | Stabilize `/api/v1/member/dashboard`, add compatibility payload shape, add `/api/v1/member/presence`, make member routes tolerate D1 query gaps instead of throwing 500. |

Validation performed:

```bash
# kosmo/command-center
pnpm run check
pnpm run build

# c3-alliance/command-c3
node --check src/index.js
node --check src/governance-engine.js
node --check src/xpt-verification.js
node --check src/zero-trust.js
node --check src/c3-capability.js
git diff --check
```

Results:

- Svelte check: 0 errors, 0 warnings.
- SvelteKit production build: passed.
- Worker JavaScript syntax checks: passed.
- Whitespace checks: passed.

Remaining deferred blocker:

- `c3-alliance/cocoa-v2/apps/command` contains `/ws/koko` and `/ws/kosmo`
  client stores, but `command-c3` does not implement WebSocket upgrade routes.
  This is intentionally deferred until the production decision is made:
  - implement WebSocket fanout backed by NATS, or
  - keep live panels disabled/hidden for first production.

## SAGE-Mastranto alignment

The desktop PWA should treat SAGE as the memory/provenance peer, not as a hidden
database.

Production backend wiring should expose SAGE through stable backend routes:

| PWA need | Backend route | SAGE/NATS mapping |
| --- | --- | --- |
| Dashboard memory context | `GET /api/v1/member/dashboard` | SAGE reads canonical/derived memory through `sage:memoro_legi`. |
| CoCoA panel chat context | `POST /api/inference` | Server enriches via SAGE before C3-TIR call. |
| Patronage/IO timeline | `GET /api/v1/member/patronage` and `GET /api/v1/member/ios/active` | SAGE emits projection events under `c3.kosmo.sage.*`. |
| Live system status | `GET /api/v1/infra/health` or future `/ws/kosmo` | NATS subjects under `c3.kosmo.k8s.atestado.*`. |
| Provenance receipts | future `GET /api/v1/provenance/:atom_id` | D1 `atom_receipts` + Forgejo artifact pointer. |

Use these repo docs for SAGE alignment:

- [`SAGE_MASTRANTO_PEER.md`](SAGE_MASTRANTO_PEER.md)
- [`SCHEMA_MAPPINGS_NATS_K8S.md`](SCHEMA_MAPPINGS_NATS_K8S.md)

## Recommended production sequence

### Phase 0 — Ground-truth lock

- Declare `kosmo/command-center` as current production PWA source of truth.
- Declare whether `c3-alliance/cocoa-v2/apps/command` is a future replacement or
  a source for cherry-picking newer wiring.
- Confirm production API target:
  - recommended: `command-c3.team-d90.workers.dev` initially,
  - final: route through `command.c3-alliance.org` or `gate.c3-voice.org` once
    edge routing is settled.

### Phase 1 — Backend contract fix

- Fix `/api/v1/member/dashboard` 500.
- Add missing compatibility routes or change frontend calls:
  - `/member/{seid}/dashboard` -> `/api/v1/member/dashboard`
  - `/member/{seid}/badges` -> `/api/v1/member/credentials`
  - `/member/{seid}/presence` -> define new `/api/v1/member/presence`
  - `/credo/*` -> define DIDComm/Identus route contract or hide panel.
- Align `POST /auth/session`.

### Phase 2 — Frontend config and PWA hardening

- Replace hard-coded API hosts with `PUBLIC_C3_GATE_URL` or server-side proxy
  routes.
- Add missing icons.
- Verify service worker, manifest, and install prompt.
- Remove or gate alpha/dev auth stubs from production UI.

### Phase 3 — SAGE + NATS integration

- Route CoCoA panel inference through `/api/inference`.
- Add server-side SAGE context enrichment before C3-TIR.
- Define NATS event subjects using `c3.kosmo.sage.*` until `c3.sage.>` is
  ratified.
- Add Kubernetes attestation event consumers for dashboard infra health.

### Phase 4 — Production acceptance

Run:

```bash
pnpm install --frozen-lockfile
pnpm run check
pnpm run build
wrangler types
wrangler deploy --dry-run
```

Current caveat: this environment hit pnpm 11's ignored-build policy for
`esbuild`, `sharp`, and `workerd` before `svelte-check` could complete. Resolve
with the repo's approved build policy before treating CI as green.

Manual smoke tests:

- Visit `https://command.c3-alliance.org`.
- Passkey register/login.
- Dashboard loads member data without permanent loading state.
- Wallet route detects Lace and handles absence cleanly.
- CoCoA panel posts through `/api/inference`.
- Market and commons routes load from chosen backend.
- Offline/reload behavior works as PWA.

## Production readiness verdict

Status: **pre-production**.

The Svelte PWA shell is deployed and reachable, and the backend has many of the
needed routes. The blocker is not UI scaffolding; it is contract alignment and
backend reliability.

The next engineering task should be:

```text
Fix command-c3 /api/v1/member/dashboard, then align kosmo/command-center
frontend calls to the command-c3 /api/v1 contract.
```
