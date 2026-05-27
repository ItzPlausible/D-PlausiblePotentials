# Pre-Flight: Kosmo Commons Support AI Agent

## Purpose

Establish ground truth before proceeding to production deployment work for the
**Kosmo Commons Support AI Agent**.

This pre-flight is authorized by the attached ratified governance reference:

```text
CEP-009 — CoCoA v2: Suverena Agenta Uzantosperto
Status: RATIFITA — 2026-04-09T13:38:58Z
Authority: @P:JWBarbre | XPT:Pontisto-Mayor
Performer: @D:PlausiblePotentials
```

## Design intent

Kosmo is the **Commons Support Unit**:

- Esperanto-native.
- Peer of KoKo, not subordinate.
- Responsible for commons infrastructure, governance, treasury, greeter, quest
  coordination, NATS stream management, Kerna-Alpha node ops, and CEP governance.
- Production behavior is governed by the CEP-009 eight-layer architecture:
  - BeeAI / Agent Stack runtime.
  - A2A peer federation.
  - MCP vertical tooling.
  - NATS sovereign messaging.
  - SAGE memory/provenance.
  - SEID/DID + XPT + Cardano identity/governance.

## Source repositories inspected

| Repo | Role |
| --- | --- |
| `c3-alliance/cocoa-v2` | Kosmo v2 source, A2A bridge, NATS/memory integration, CEP-009 governance files. |
| `c3-alliance/agent-stack` | Historical/operational Kubernetes manifests and Kosmo sub-agent deployment references. |
| `kosmo/cosmic-commons` | Canonical governance, SAGE, NATS, memory, and source-of-truth context. |
| `c3-alliance/c3-gate` | HTTP/WebSocket bridge between Cloudflare surfaces and NATS/Kerna. |
| `c3-alliance/command-c3` | Cloudflare Worker API surface and D1 bridge. |

## Governance authority highlights

From CEP-009:

- CoCoA v2 is the production-grade, voice-first, sovereign multi-agent member
  experience.
- Kosmo v2 is the Commons Support Unit.
- KoKo and Kosmo are direct A2A peers.
- NATS is the sovereign internal messaging backbone.
- Kubernetes + Helm is the production runtime target.
- Forgejo remains source of truth.
- D1 remains durable state source of truth.
- NATS is the replayable event and messaging layer, not a replacement for D1 or
  Forgejo.

From `Q-001-cocoa-v2.md`:

| Mission | Status |
| --- | --- |
| M-003 Kosmo v2 BeeAI Konstruo | Complete — `kosmo-sos-core:v2.0.0` healthy at k8s `c3-agents :3299`; `kosmo-a2a` agent card live. |
| M-004 A2A Federation | Complete — `koko-a2a :3100` + `kosmo-a2a :3101`; peer agent cards and task routing confirmed. |
| M-006 Memory | Complete — Mem0 + Graphiti dual engine validated. |
| M-008 NATS | Complete — NATS server, JetStream streams, and `C3_MEMORY` KV live. |

## Current code surfaces

### 1. Historical BeeAI subscriber stub

Path:

```text
c3-alliance/cocoa-v2/src/agents/kosmo/kosmo.agent.ts
```

Observations:

- Defines `createKosmoAgent()` with BeeAI `ReActAgent`.
- Uses local `OllamaChatModel("llama3.2")`.
- Subscribes to `c3.kosmo.>`.
- Hard-codes `NATS_URL = "nats://localhost:4222"`.

Pre-flight disposition:

```text
Historical scaffold / conceptual Kosmo agent code.
Not the primary production-facing integration point.
```

### 2. Production-relevant A2A bridge

Path:

```text
c3-alliance/cocoa-v2/src/federation/kosmo-a2a.ts
```

Observed responsibilities:

- Express service on `KOSMO_A2A_PORT`, default `3101`.
- Agent Card at `/.well-known/agent.json`.
- Health at `/health`.
- Task ingress at `/tasks/send`.
- Routes commons tasks to:

  ```text
  KOSMO_POD_URL /rpc
  default: http://10.43.19.189:3299
  ```

- Delegates member-boundary tasks to KoKo via:

  ```text
  KOKO_A2A_URL /tasks/send
  default: http://localhost:3100
  ```

- Connects to NATS using:

  ```text
  NATS_URL
  NATS_CREDS/kosmo.creds
  ```

- Publishes:
  - `c3.kosmo.task.received`
  - `c3.kosmo.task.completed`
  - `c3.kosmo.task.failed`
  - `c3.kosmo.handoff.delegated`

- Reads/writes shared memory through `getMemoryStore()`.

Pre-flight disposition:

```text
Primary production-facing Kosmo agent bridge.
This is the surface to validate and deploy first.
```

### 3. Kosmo core runtime

Source references:

```text
c3-alliance/agent-stack/deploy/kosmo-v2-deployment.yaml
c3-alliance/cocoa-v2/kverkoj/Q-001-cocoa-v2-suverena-agenta-ux/Q-001-cocoa-v2.md
```

Observed runtime target:

```text
kosmo-sos-core
namespace: c3-agents
port: 3299
version: v2.0.0 per Q-001 audit
```

Older deployment manifest also references sub-agents:

- `kosmo-sos-core :3299`
- `kosmo-sos-infra :3300`
- `kosmo-sos-greeter :3301`
- `kosmo-sos-quest :3302`

Pre-flight disposition:

```text
Kerna runtime source of truth must be verified on Kerna because cloud agent
cannot reach cluster-local services.
```

### 4. Kosmo Quest sub-agent

Path:

```text
c3-alliance/agent-stack/kosmo/quest/runner.js
```

Observed responsibilities:

- JSON-RPC `/rpc`.
- `kosmo.quest.broadcast`.
- Publishes quest state changes to NATS.
- Uses `kosmo.creds`.
- Uses OTel tracing.

Pre-flight disposition:

```text
Useful production pattern for Kosmo sub-agent shape, NATS credentials, OTel,
and JSON-RPC dispatch.
```

## Runtime dependency map

| Dependency | Role | Current evidence |
| --- | --- | --- |
| `kosmo-a2a` | A2A bridge and Agent Card | Source complete; Q-001 audit says live on `localhost:3101`. |
| `kosmo-sos-core` | Core Kosmo reasoning/runtime | Q-001 audit says k8s `c3-agents :3299`, v2.0.0 healthy. |
| `koko-a2a` | Peer bridge for member-boundary delegation | Q-001 audit says live on `localhost:3100`. |
| NATS | Event spine | Q-001 audit says pm2:9, JetStream KOKO/KOSMO/KVERKO/MISIO/DLQ. |
| `C3_MEMORY` KV | Hot memory store | Q-001 audit says live; M-006 smoke script validates. |
| D1 / `command-c3` | Durable state and D1 proxy | `command-c3` deployed; `/api/d1/query` exists. |
| Mem0 / Graphiti | Memory engines | Q-001 audit says running; SAGE docs treat as derived/rebuildable. |
| c3-tir / LiteLLM | Inference routing | Q-001 audit says live. |
| Forgejo | SSOT | Active and accessible through Forgejo MCP. |
| c3-gate | Browser/NATS bridge | Source updated; Kerna redeploy still pending. |

## Cloud-agent reachability results

From this Cursor Cloud environment:

| Probe | Result |
| --- | --- |
| `http://localhost:3101/health` | Not reachable. Expected; this is Kerna-local. |
| `http://localhost:3101/.well-known/agent.json` | Not reachable. Expected; this is Kerna-local. |
| `http://localhost:3100/health` | Not reachable. Expected; this is Kerna-local. |
| `https://agent.c3-voice.org/health` | `404`; not a generic health endpoint. |
| `https://gate.c3-voice.org/_health` | `200 OK`. |
| `https://command-c3.team-d90.workers.dev/api/v1/infra/health` | `500`; needs hardening before relying on it as a production status check. |

Conclusion:

```text
Production Kosmo validation must run from Kerna or through an explicitly exposed
gateway route. Cursor Cloud cannot directly validate localhost/K8s services.
```

## Existing smoke tests

### M-004 A2A federation

Path:

```text
c3-alliance/cocoa-v2/scripts/m004-smoke-test.mjs
```

Covers:

- KoKo health.
- Kosmo health.
- KoKo Agent Card.
- Kosmo Agent Card.
- Direct tasks.
- KoKo -> Kosmo delegation.
- Kosmo -> KoKo delegation.

Note:

The script appears to target `/a2a/jsonrpc`, while the current
`kosmo-a2a.ts` bridge exposes `/tasks/send`. The M-006 smoke script has a route
detector that handles both styles and should be preferred or backported.

### M-006 memory

Path:

```text
c3-alliance/cocoa-v2/scripts/m006-smoke-test.mjs
```

Covers:

- NATS KV `C3_MEMORY` put/get/delete.
- KoKo/Kosmo health and route style detection.
- KoKo task send.
- Kosmo task send.
- Direct memory KV write/read.

Pre-flight disposition:

```text
Use M-006 smoke test as the primary Kosmo production pre-flight script.
```

## Production blockers / risks

### 1. Kerna runtime not reachable from Cursor Cloud

This is not necessarily a defect. It means deployment validation must run on
Kerna or through a controlled gateway.

Required next action:

```bash
cd /home/ppc/cocoa-v2
node scripts/m006-smoke-test.mjs
```

### 2. `command-c3` infra health returns 500

Public probe:

```text
GET https://command-c3.team-d90.workers.dev/api/v1/infra/health
```

Result:

```text
500 Worker threw exception
```

This should be hardened before using Command as a production Kosmo status
dashboard.

### 3. A2A route shape mismatch

Some code/tests use:

```text
POST /a2a/jsonrpc
```

Current `kosmo-a2a.ts` uses:

```text
POST /tasks/send
```

Recommendation:

- Keep `/tasks/send` as canonical current surface.
- Add backward-compatible `/a2a/jsonrpc` handler, or
- update M-004 smoke test to use M-006 route detection.

### 4. NATS subject drift

`kosmo-a2a.ts` references:

```text
c3.quests.updates
c3.commons.announce
c3.cer.updates
```

But earlier source-of-truth discovery found `c3.commons.announce` was not
authorized by the available credentials.

Recommendation:

- Align Agent Card `existing` subjects with authorized `c3.kosmo.>`,
  `c3.kverko.>`, `c3.misio.>`, and `c3.cep.ratifita`.

### 5. Memory route must remain canonical/derived safe

Kosmo reads memory from NATS KV and writes via `getMemoryStore()`.

Production rule:

- NATS KV is hot memory.
- D1/Forgejo/SAGE are canonical.
- Derived memory must be rebuildable.

### 6. c3-gate must be redeployed

The new WebSocket/NATS bridge has been merged to `c3-alliance/c3-gate` `main`,
but the Kerna service still needs restart/redeploy before live browser panels
can use the new bridge behavior.

## Recommended production sequence

### Phase 0 — Kerna-local verification

Run from Kerna:

```bash
cd /home/ppc/cocoa-v2
node scripts/m006-smoke-test.mjs
```

Expected:

- NATS KV works.
- KoKo reachable.
- Kosmo reachable.
- Kosmo task send works.
- Memory read/write works or degrades with clear reason.

### Phase 1 — Route compatibility

Patch one of:

1. `kosmo-a2a.ts` to expose `/a2a/jsonrpc` compatibility; or
2. `scripts/m004-smoke-test.mjs` to use M-006 route detection.

Recommendation:

```text
Do both, but implement `/a2a/jsonrpc` compatibility first for external tooling stability.
```

### Phase 2 — NATS subject cleanup

Update Kosmo Agent Card subject metadata:

- Remove or mark deprecated:
  - `c3.commons.announce`
  - `c3.quests.updates`
  - `c3.cer.updates`
- Prefer:
  - `c3.kosmo.task.*`
  - `c3.kosmo.handoff.delegated`
  - `c3.kverko.>`
  - `c3.misio.>`
  - `c3.cep.ratifita`

### Phase 3 — Production deploy/restart

On Kerna:

```bash
cd /home/ppc/cocoa-v2
git pull origin main
pm2 restart kosmo-a2a
pm2 restart koko-a2a
pm2 save
```

If Kubernetes-managed:

```bash
kubectl -n c3-agents rollout restart deployment/kosmo-sos-core
kubectl -n c3-agents rollout status deployment/kosmo-sos-core
```

### Phase 4 — External status surfacing

Expose a safe, read-only Kosmo health route through `c3-gate` or `command-c3`:

```text
GET /api/v1/kosmo/health
GET /api/v1/kosmo/agent-card
```

This allows Cursor Cloud and the PWA dashboard to verify Kosmo without direct
Kerna-local access.

## Pre-flight verdict

Status:

```text
READY FOR KERNA-LOCAL PRODUCTION VERIFICATION
```

Not ready for fully remote validation from Cursor Cloud until a safe public
Kosmo health/Agent Card route exists.

Next implementation task:

```text
Add /a2a/jsonrpc compatibility to kosmo-a2a, align Agent Card NATS subjects,
then run M-006 smoke test on Kerna.
```
