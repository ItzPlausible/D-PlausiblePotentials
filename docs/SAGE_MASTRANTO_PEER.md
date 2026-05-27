# SAGE-Mastranto Peer Architecture

This design pivots the PPC agency environment toward **SAGE-Mastranto** as the
AI-agent peer that administers memory and provenance.

SAGE is not a helper library. SAGE is a peer service beside Kosmo and KoKo:

- **Kosmo** administers commons operations and infrastructure.
- **KoKo** administers member-facing support and translation.
- **SAGE-Mastranto** administers memory, provenance, canonical/derived sync, and
  retrieval surfaces for both.

## Source context

This design is sourced from `git.c3-voice.org`, primarily
`kosmo/cosmic-commons`:

- `kverkoj/cepoj/CEP-008-A-sage-mastranto-memoro-suvereneco.md`
- `kverkoj/cepoj/CEP-009-cocoa-v2-sovereign-agent-ux.md`
- `registroj/migrado/alpha-to-beta-registry.md`
- `sessions/2026-04-20-liberation-registry-genesis.md`
- `migrations/Q-001-M0X-IO-4-acp-schema-1.0.0.sql`
- `docs/infrastructure/memory-schema.sql`
- `c3-stack/RELEASE-OWNERSHIP.md`
- `c3-stack/templates/sage-mastranto.yaml`
- `c3-stack/templates/sage-ingestion.yaml`
- `lib/sage-mastranto/src/*`
- `lib/atomo-hook-service/README.md`

## Design laws

### 1. Canonical/derived law

Canonical truth survives cluster loss.

| Layer | Role | Examples |
| --- | --- | --- |
| Canonical | Durable truth | Forgejo SSOT, Cloudflare D1, atom receipts |
| Derived | Rebuildable projection | pgvector, Neo4j/Graphiti, Mem0, Zep, caches |

No memory record may live only in a derived store. Every embedding, graph node,
or cache entry must trace to a canonical Forgejo file, D1 row, or atom receipt.

### 2. SAGE owns the memory/provenance door

Agents do not write directly to derived memory backends. They call SAGE tools.

Initial tool surface:

| Tool | Purpose |
| --- | --- |
| `sage:memoro_skribi` | Write canonical memory and projection intents. |
| `sage:memoro_legi` | Read memory through SAGE-ranked retrieval. |
| `sage:memoro_search_vector` | Query pgvector-derived semantic chunks. |
| `sage:memoro_query_graph` | Query Neo4j/Graphiti-derived relationships. |
| `sage:atomo_atesti` | Atom-witness an artifact through atomo-hook-service. |
| `sage:io_solvi` | Resolve/close an IO ceremony. |
| `sage:misio_fermi` | Close a mission ceremony. |

### 3. Provenance is not optional

Every canonical write should produce or reference:

- `atom_id`
- `parent_atoms`
- `issuer_seid`
- `issued_utc`
- `forgejo_commit`
- `artifact_path`

This mirrors the `atom_receipts` table in
`Q-001-M0X-IO-4-acp-schema-1.0.0.sql`.

### 4. NATS is the event spine

NATS JetStream carries event notification and replay. It does not replace
canonical storage.

SAGE publishes events after canonical writes and projection updates. Consumers
may rebuild from Forgejo/D1 if they miss events.

### 5. Kubernetes is the runtime contract

Kubernetes/Helm describes SAGE's operational shape:

- Deployment and Service for `sage-mastranto`.
- Deployment and Service for `sage-ingestion`.
- Secrets for Cloudflare D1, pgvector, Neo4j, C3-TIR, and standing capability
  tokens.
- Labels and annotations for peer identity, schema version, and provenance.

## High-level architecture

```text
KoKo / Kosmo / Cursor agent
  -> SAGE MCP / HTTP tool surface
  -> capability verification
  -> canonical write/read
      -> Forgejo SSOT
      -> Cloudflare D1
      -> atom_receipts
  -> NATS JetStream event
  -> derived projection workers
      -> pgvector
      -> Neo4j / Graphiti
      -> Mem0 / Zep
  -> retrieval response
```

## Identity

Recommended peer identity:

```text
did:c3:SEID:@T:Sage-Mastranto:{node-seid}
```

Kubernetes labels and annotations should repeat the stable identity fields so
attestation events can bind workloads back to the peer:

```yaml
metadata:
  labels:
    app.kubernetes.io/name: sage-mastranto
    app.kubernetes.io/part-of: ppc-agent-memory
    c3.plausiblepotentials.com/peer: sage-mastranto
  annotations:
    c3.plausiblepotentials.com/did: did:c3:SEID:@T:Sage-Mastranto:{node-seid}
    c3.plausiblepotentials.com/schema-version: sage.peer.v1
```

## SAGE service split

| Service | Port | Responsibility |
| --- | ---: | --- |
| `sage-mastranto` | 3400 | Tool surface, capability gate, memory/provenance orchestration. |
| `sage-ingestion` | 3401 | Total Sync Protocol, canonical-to-derived projection. |
| `atomo-hook-service` | 3500 | Remote atom witnessing via `@c3/atomo-hook`. |

## Required stores

| Store | Type | SAGE usage |
| --- | --- | --- |
| Forgejo | Canonical git SSOT | Canonical memory files, CEPs, registries, docs. |
| Cloudflare D1 | Canonical relational | `acp_manifests`, `atom_receipts`, `capability_tokens`, quest/mission/IO rows. |
| NATS JetStream | Event spine | Replayable memory/provenance/k8s events. |
| pgvector | Derived | Semantic chunks. |
| Neo4j / Graphiti | Derived | Provenance and temporal graph projections. |
| Mem0 / Zep | Derived | Actor-scoped semantic and conversational memory. |

## Initial implementation target

The first PPC implementation should not try to rebuild all of SAGE. It should
lock these contracts:

1. `docs/SCHEMA_MAPPINGS_NATS_K8S.md` as the canonical schema map.
2. A SAGE MCP facade that reads Forgejo and emits NATS event drafts.
3. Helm templates for `sage-mastranto`, `sage-ingestion`, and NATS consumers.
4. A local validation command that checks:
   - NATS subject names match the registry.
   - Kubernetes labels/annotations match the peer identity schema.
   - Memory/provenance event envelopes include atom and Forgejo pointers.

## Open design decisions

1. Whether to ratify `c3.sage.>` as its own NATS subject scope or keep SAGE under
   `c3.kosmo.sage.>` until the NATS JWT hierarchy is amended.
2. Whether SAGE writes directly to D1 or delegates all D1 mutation through
   Cloudflare Workers.
3. Whether the first derived graph target is Neo4j/Graphiti only, or whether
   Mem0/Zep should be wired immediately.
4. Whether Kubernetes attestation events are generated by SAGE, by a DaemonSet,
   or by admission-controller/webhook infrastructure.
