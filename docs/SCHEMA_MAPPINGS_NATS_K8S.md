# SAGE NATS and Kubernetes Schema Mappings

This document defines the first PPC schema mapping layer for SAGE-Mastranto.
It aligns SAGE memory/provenance events with NATS JetStream subjects and
Kubernetes/Helm deployment metadata.

## Source alignment

The mappings follow these `kosmo/cosmic-commons` facts:

- NATS auth currently allows `$JS.API.>`, `c3.cep.ratifita`,
  `c3.fulmina.>`, `c3.kosmo.>`, `c3.kverko.>`, and `c3.misio.>`.
- `c3.commons.announce` was documented in CEP-002-A but not authorized by the
  discovered NATS credentials.
- Existing observed subjects include `c3.koko.a2a.*`, `c3.kosmo.a2a.*`,
  `c3.koko.*`, and `c3.kosmo.*`.
- `tipo: nats_temo` is the proposed canonical YAML frontmatter shape for NATS
  subject registry entries.
- `sage-mastranto` and `sage-ingestion` are Kubernetes services in the
  `c3-agents` namespace.

## Subject strategy

Use authorized scopes first. Until a future CEP creates or authorizes
`c3.sage.>`, SAGE subjects live under `c3.kosmo.sage.>`.

| Domain | Subject pattern | Persistence | Notes |
| --- | --- | --- | --- |
| Memory write | `c3.kosmo.sage.memoro.skribita` | JetStream | Canonical memory write accepted. |
| Memory read | `c3.kosmo.sage.memoro.legita` | JetStream | Retrieval event; payload should not leak private memory content. |
| Projection update | `c3.kosmo.sage.projekcio.*` | JetStream | Derived index update status. |
| Provenance atom | `c3.kosmo.sage.atomo.atestita` | JetStream | Atom receipt issued or registered. |
| Capability check | `c3.kosmo.sage.kapableco.*` | JetStream | Capability accepted/rejected/revoked. |
| Kubernetes attestation | `c3.kosmo.k8s.atestado.*` | JetStream | Workload, pod, deployment, and secret-shape attestations. |
| Mission event | `c3.misio.*` | JetStream | Mission lifecycle, already authorized. |
| Quest event | `c3.kverko.*` | JetStream | Quest lifecycle, already authorized. |
| CEP ratification | `c3.cep.ratifita` | JetStream | CEP ratification, already authorized. |

Future desired scope:

```text
c3.sage.>
```

Do not publish to `c3.commons.announce` until NATS credentials or the CEP are
aligned.

## Canonical NATS registry entry

Use this frontmatter shape for subject registry files:

```yaml
---
tipo: nats_temo
temo: "c3.kosmo.sage.memoro.skribita"
priskribo: "SAGE accepted a canonical memory write"
tavolo: kosmo
persisto: jetstream
rivera_nomo: "c3-sage-memory"
konsumantoj:
  - nomo: sage-projection-worker
    tipo: durable_pull
    filtrilo: "c3.kosmo.sage.memoro.*"
  - nomo: sage-audit-writer
    tipo: durable_pull
    filtrilo: "c3.kosmo.sage.>"
autoritatigita_de:
  - CEP-008-A
  - CEP-009
statuso: proponita
---
```

## Event envelope

All SAGE NATS events should share this envelope:

```json
{
  "schema_version": "sage.event.v1",
  "event_id": "atom-or-uuid",
  "event_type": "memory.write.accepted",
  "subject": "c3.kosmo.sage.memoro.skribita",
  "occurred_at": "2026-05-27T00:00:00.000Z",
  "source": {
    "peer": "sage-mastranto",
    "did": "did:c3:SEID:@T:Sage-Mastranto:{node-seid}",
    "service": "sage-mastranto",
    "namespace": "c3-agents"
  },
  "canonical": {
    "forgejo_repo": "kosmo/cosmic-commons",
    "forgejo_commit": "commit-sha",
    "artifact_path": "path/to/file.md",
    "d1_table": "atom_receipts",
    "d1_key": "atom_id-or-msg_id"
  },
  "provenance": {
    "atom_id": "40-char-base58",
    "parent_atoms": [],
    "issuer_seid": "did:c3:...",
    "receipt_path": "path/to/receipt.json"
  },
  "payload": {}
}
```

Rules:

- `payload` is event-specific.
- Sensitive memory content should not be published to broad subjects. Publish
  pointers to canonical records instead.
- `canonical` must be present for events that claim durable state.
- `provenance.atom_id` must be present for atom-witnessed artifacts.

## Memory write payload

```json
{
  "memory": {
    "tipo": "memoro",
    "tavolo": "kosmo",
    "slice": ["kosmo"],
    "importance_tier": "operational",
    "keywords": ["forgejo", "ssot", "schema"],
    "projection": {
      "pgvector": true,
      "neo4j": true,
      "mem0": false,
      "graphiti": true
    }
  }
}
```

## Projection event payload

```json
{
  "projection": {
    "target": "pgvector",
    "status": "complete",
    "source_atom_id": "40-char-base58",
    "chunk_count": 12,
    "metadata_filters": ["tipo", "tavolo", "kverko", "epoko"]
  }
}
```

## Kubernetes attestation payload

Kubernetes attestation events bind runtime state to the same SAGE peer identity.

```json
{
  "kubernetes": {
    "cluster": "kerna-alpha",
    "namespace": "c3-agents",
    "kind": "Deployment",
    "name": "sage-mastranto",
    "image": "sage-mastranto:0.3.0-alpha",
    "service_account": "sage-mastranto",
    "labels": {
      "app.kubernetes.io/name": "sage-mastranto",
      "app.kubernetes.io/part-of": "ppc-agent-memory",
      "c3.plausiblepotentials.com/peer": "sage-mastranto"
    },
    "annotations": {
      "c3.plausiblepotentials.com/did": "did:c3:SEID:@T:Sage-Mastranto:{node-seid}",
      "c3.plausiblepotentials.com/schema-version": "sage.peer.v1"
    }
  }
}
```

Recommended subject mapping:

| Kubernetes event | Subject |
| --- | --- |
| Deployment rendered | `c3.kosmo.k8s.atestado.deployment.rendered` |
| Deployment applied | `c3.kosmo.k8s.atestado.deployment.applied` |
| Pod ready | `c3.kosmo.k8s.atestado.pod.ready` |
| Secret shape verified | `c3.kosmo.k8s.atestado.secret.verified` |
| Helm release diffed | `c3.kosmo.k8s.atestado.helm.diffed` |

## Helm values schema

The SAGE Helm values should include these stable keys:

```yaml
sageMastranto:
  enabled: true
  replicaCount: 1
  image:
    repository: sage-mastranto
    tag: 0.3.0-alpha
    pullPolicy: IfNotPresent
  identity:
    did: "did:c3:SEID:@T:Sage-Mastranto:{node-seid}"
    peer: sage-mastranto
    schemaVersion: sage.peer.v1
  env:
    neo4jUri: "neo4j://neo4j-service:7687"
    neo4jUser: "neo4j"
    c3TirEndpoint: "http://c3-tir:8080/v1/embeddings"
    natsUrl: "nats://nats:4222"
    atomoHookUrl: "http://atomo-hook-service.c3-agents.svc.cluster.local:3500"

sageIngestion:
  enabled: true
  replicaCount: 1
  image:
    repository: sage-ingestion
    tag: 0.1.0-alpha
    pullPolicy: IfNotPresent
  env:
    dryRun: "false"
    pgConnectionStringSecret: pgvector-secrets
    neo4jUri: "neo4j://neo4j-service:7687"
    c3TirEndpoint: "http://c3-tir:8080/v1/embeddings"
    natsUrl: "nats://nats:4222"
```

## Kubernetes labels and annotations

Every SAGE workload should include:

```yaml
labels:
  app.kubernetes.io/name: sage-mastranto
  app.kubernetes.io/component: memory-provenance
  app.kubernetes.io/part-of: ppc-agent-memory
  c3.plausiblepotentials.com/peer: sage-mastranto
annotations:
  c3.plausiblepotentials.com/did: did:c3:SEID:@T:Sage-Mastranto:{node-seid}
  c3.plausiblepotentials.com/schema-version: sage.peer.v1
  c3.plausiblepotentials.com/canonical-source: forgejo
```

## D1 schema alignment

SAGE must preserve these D1 contracts:

| Table | Role |
| --- | --- |
| `acp_manifests` | Agent registry and endpoint manifest records. |
| `atom_receipts` | Atom-hashed deliverable registry. |
| `capability_tokens` | DIDComm capability grant envelopes. |

Memory projection also uses:

```sql
CREATE TABLE IF NOT EXISTS atom_chunks (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding VECTOR(1536),
  metadata JSONB,
  atom_id TEXT,
  chunk_index INTEGER
);
```

`atom_chunks` is derived. Its `atom_id` must point back to a canonical
`atom_receipts` row or Forgejo artifact.

## Validation checklist

Before SAGE deployment:

- [ ] `helm template` output inspected for blast radius.
- [ ] `helm diff` or equivalent run against live release.
- [ ] No SAGE subject uses unauthorized `c3.commons.announce`.
- [ ] NATS subject registry entries exist for all emitted subjects.
- [ ] All SAGE workloads include peer identity labels and annotations.
- [ ] D1 migrations include `acp_manifests`, `atom_receipts`, and
      `capability_tokens`.
- [ ] Derived stores can be rebuilt from Forgejo/D1.
- [ ] Atomo round-trip identity invariant is tested.
- [ ] Capability-token verification is tested for missing, invalid, expired,
      wrong-scope, and valid tokens.
