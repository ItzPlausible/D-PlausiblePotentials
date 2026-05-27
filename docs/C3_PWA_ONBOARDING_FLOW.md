# C3 Alliance PWA Onboarding and Surface Routing

This document records the design intent for C3 Alliance PWA entry, onboarding,
surface selection, and post-auth landing behavior.

It is intentionally separate from backend wiring issues. The purpose here is to
clarify the desired user journey before implementation.

## Design intent

`C3-Alliance.org` is the global default PWA URL for all users and all surfaces.

The user should not need to know whether they belong on the desktop/tablet
surface or the mobile surface. The browser and app metadata should determine the
appropriate surface and route the user.

## Surfaces

| Surface | URL | Primary target |
| --- | --- | --- |
| Global entry | `https://c3-alliance.org` | First-touch and returning-member entry point. |
| Desktop/tablet | `https://command.c3-alliance.org` | Desktop dashboard / Command.C3 surface. |
| Mobile | `https://mokoko.c3-alliance.org` | Mobile MoKoKo surface. |

## First-principles UX rule

The PWA is browser-first.

The browser should use available metadata to derive the correct surface:

- viewport size,
- device class,
- display mode,
- install context,
- user agent client hints where available,
- prior member/session preference where available.

The default behavior should be:

```text
Mobile device -> mokoko.c3-alliance.org
Desktop/tablet device -> command.c3-alliance.org
```

Tablet defaults to the desktop/tablet Command surface unless a later product
decision creates a tablet-specific MoKoKo behavior.

## Returning member flow

```text
1. Member opens https://c3-alliance.org
2. Browser/app derives target surface from metadata
3. Member authenticates with Passkey/WebAuthn
4. Auth verification confirms member identity and session
5. App routes to the appropriate subdomain:
   - mobile -> mokoko.c3-alliance.org
   - desktop/tablet -> command.c3-alliance.org
6. Member lands on the dashboard for that surface
```

## New or unauthenticated visitor flow

```text
1. Visitor opens https://c3-alliance.org
2. Browser/app derives likely surface
3. Visitor sees onboarding/login affordance
4. Visitor completes Passkey/WebAuthn registration or login
5. Auth verification confirms member identity and session
6. App routes to the derived surface dashboard
```

## Post-auth landing rule

After member authentication and verification, the landing destination is always
the dashboard for the selected surface.

| Surface | Post-auth landing |
| --- | --- |
| Command | `https://command.c3-alliance.org/dashboard` |
| MoKoKo | `https://mokoko.c3-alliance.org/dashboard` |

## Metadata-derived routing contract

The routing decision should produce:

```ts
type Surface = 'command' | 'mokoko';

type SurfaceRoutingDecision = {
  surface: Surface;
  reason:
    | 'mobile-viewport'
    | 'desktop-viewport'
    | 'tablet-viewport'
    | 'installed-pwa'
    | 'member-preference'
    | 'fallback';
  targetOrigin: 'https://command.c3-alliance.org' | 'https://mokoko.c3-alliance.org';
  targetPath: '/dashboard';
};
```

## Preference and override behavior

The metadata-derived route is the default. A returning member may later be
allowed to override their preferred surface, but override behavior should not be
required for first production.

If a member preference exists, it may override device metadata after successful
auth. Pre-auth routing should remain conservative and metadata-based.

## Authentication boundary

Passkey/WebAuthn authentication belongs before dashboard entry.

The browser may derive a surface before auth, but the member should not land on a
member dashboard until auth verification succeeds.

Backend/session implementation details are out of scope for this document.

## Non-goals for this document

This document does not decide:

- backend API route names,
- D1 schema fixes,
- Cloudflare Worker routing implementation,
- DIDComm route contracts,
- SAGE memory/provenance enrichment,
- NATS or WebSocket implementation,
- specific Passkey verification internals.

Those are implementation/backend-wiring tasks tracked separately in
[`PREFLIGHT_COMMAND_C3_PWA.md`](PREFLIGHT_COMMAND_C3_PWA.md).

## Production acceptance criteria

- `https://c3-alliance.org` is the default public entry point.
- Mobile users are routed to MoKoKo after auth.
- Desktop and tablet users are routed to Command after auth.
- Returning members authenticate with Passkey/WebAuthn.
- Authenticated members land on the correct dashboard.
- The routing behavior is documented and testable.
- Backend wiring issues are not conflated with surface-routing intent.
