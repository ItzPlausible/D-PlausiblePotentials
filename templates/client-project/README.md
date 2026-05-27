# Client Project Template

Copy this directory when starting a new engagement:

```bash
mkdir -p clients/<client-or-project-slug>
cp -R templates/client-project/. clients/<client-or-project-slug>/
```

Then fill in the project documents before implementation.

## Project checklist

- [ ] Complete `docs/SPEC.md`
- [ ] Complete `docs/ARCHITECTURE.md`
- [ ] Complete `docs/SECURITY_NOTES.md`
- [ ] Define local/testnet/mainnet environments
- [ ] Add contract/app/package directories as needed
- [ ] Add project-specific commands to this README
- [ ] Add release entries to `docs/RELEASES.md`

## Commands

Document the project's actual commands here.

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
forge test
```

## Environments

| Environment | Chain ID | RPC | Contracts | Notes |
| --- | --- | --- | --- | --- |
| Local | | | | |
| Testnet | | | | |
| Mainnet | | | | |
