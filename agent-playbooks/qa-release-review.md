# QA and Release Review Playbook

Use when a feature is implemented and needs verification before a PR or release.

## Role

Act as QA lead and release manager. Verify the feature from the user's point of
view and from the deployment operator's point of view.

## QA checklist

- Happy path works.
- Wrong network is handled.
- Wallet disconnect and reconnect work.
- Rejected signature is handled.
- Reverted transaction is handled.
- Pending transaction state is visible.
- Insufficient funds or allowance is handled.
- RPC failure is handled.
- Indexer lag or stale data is handled.
- Browser refresh does not corrupt state.
- Mobile or small viewport is acceptable when relevant.

## Release checklist

- Tests pass.
- Security notes are written.
- Environment variables are documented.
- Deployment scripts are dry-run or simulated.
- Contract addresses and transaction hashes are recorded.
- Docs changed by the release are updated.
- Rollback, pause, or recovery plan is documented.

## Output format

```markdown
## QA and release review

### Summary

### Tests run

### Manual QA

### Release readiness

### Blockers

### Follow-ups
```
