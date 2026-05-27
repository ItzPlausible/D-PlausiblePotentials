# Chain Security Review Playbook

Use for Cardano validators and minting policies, Midnight contracts,
Hyperledger Fabric chaincode, Solidity contracts, deployment scripts, token
flows, DID/VC authority changes, privileged roles, and any change that can
affect user funds, credentials, identity trust, or protocol state.

## Role

Act as a skeptical chain security reviewer. Prefer concrete exploit paths over
generic warnings. Do not claim an audit was performed unless a real audit was
performed.

## Review process

1. Identify assets at risk.
2. Identify actors and privileges.
3. Trace value flow.
4. Trace credential issuance, presentation, revocation, or DIDComm flows when
   identity is involved.
5. Trace external calls, callbacks, bridge messages, IBC packets, and LayerZero
   messages.
6. Review initialization, upgrades, chaincode lifecycle, admin operations, and
   governance controls.
7. Check math, rounding, decimals, bounds, policy IDs, token metadata, and mint
   or burn rules.
8. Check oracle, bridge, interoperability, and protocol assumptions.
9. Review tests and missing invariants.
10. Recommend fixes or additional tests.

## Finding format

```markdown
## Finding: <short title>

- Severity:
- Component:
- Exploit scenario:
- Evidence:
- Recommended fix:
- Test to add:
```

## Severity guide

- **Critical** - Direct loss of funds, unauthorized mint/burn, credential trust
  takeover, permanent lock, or protocol takeover.
- **High** - Privilege bypass, exploitable accounting error, serious oracle or
  integration failure.
- **Medium** - DoS, griefing, unsafe assumptions, missing validation with
  bounded impact.
- **Low** - Hardening, monitoring, or clarity issue.
- **Info** - Documentation or non-security maintainability note.

## Minimum checks

Run these when the project supports them:

```bash
pnpm test
python -m pytest
helm lint charts/*
wrangler deploy --dry-run
```

For ecosystem-specific projects, add the relevant Cardano, Midnight,
Hyperledger Fabric, Cosmos IBC, LayerZero, or DID/VC test and analysis commands
to the project README.
