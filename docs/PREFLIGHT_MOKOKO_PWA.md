# Pre-Flight: MoKoKo Mobile PWA Voice Surface

## Purpose

Record the production pivot for `mokoko.c3-alliance.org` as the mobile,
voice-first PWA surface for the C3 Alliance Substrate.

The first production pass focuses on Whisper-backed speech-to-text and a mobile
recording UI.

## Source repository

Forgejo:

```text
c3-alliance/cocoa-v2
```

App:

```text
apps/mokoko
```

## Implemented source branch

| Repo | Branch | Commit | Status |
| --- | --- | --- | --- |
| `c3-alliance/cocoa-v2` | `cursor/mokoko-whisper-production-e9f7` | `70993cf` | Fast-forwarded into Forgejo `main`. |

## Implemented changes

- Added Cloudflare Workers AI binding:

  ```toml
  [ai]
  binding = "AI"
  ```

- Added Whisper transcription endpoint:

  ```text
  POST /api/voice/transcribe
  ```

- Added mobile voice-first UI at:

  ```text
  /voice
  ```

- Added recording helper/types:

  ```text
  apps/mokoko/src/lib/voice.ts
  ```

- Updated Passkey session verification to use:

  ```text
  POST /auth/session
  ```

## Whisper runtime

MoKoKo uses Cloudflare Workers AI:

```text
@cf/openai/whisper
```

The browser records audio with `MediaRecorder`, posts multipart form data to the
same-origin SvelteKit endpoint, and the server route calls:

```ts
platform.env.AI.run('@cf/openai/whisper', { audio: [...bytes] })
```

No Cloudflare token is exposed to the browser.

## Deployment status

Deployment command used:

```bash
npm exec --yes wrangler@latest -- pages deploy .svelte-kit/cloudflare --project-name mokoko --branch main --commit-dirty=true
```

Deployment URL:

```text
https://1f3eabb0.mokoko.pages.dev
```

Custom domain:

```text
https://mokoko.c3-alliance.org
```

## Smoke tests

| Probe | Result |
| --- | --- |
| `https://1f3eabb0.mokoko.pages.dev` | `200 OK` |
| `https://1f3eabb0.mokoko.pages.dev/voice` | `200 OK` |
| `GET /api/voice/transcribe` | `405 Method Not Allowed` |
| `POST /api/voice/transcribe` with same-origin `Origin` | `200 OK` |
| `https://mokoko.c3-alliance.org` | `200 OK` |
| `https://mokoko.c3-alliance.org/voice` | `200 OK` |
| `https://mokoko.c3-alliance.org/api/voice/transcribe` same-origin POST | `200 OK` |

Observed Whisper response from generated silent WAV smoke test:

```json
{
  "text": "you",
  "word_count": 1,
  "vtt": "WEBVTT\n\n00.000 --> 00.980\nyou"
}
```

The exact transcript is not semantically meaningful for silence; the important
signal is that the route reaches Workers AI and returns a valid Whisper response.

## Validation

```bash
pnpm --filter mokoko run check
pnpm --filter mokoko run build
```

Results:

- Svelte check: 0 errors.
- Build: passed.
- Pre-existing warnings remain in shared `packages/ui/src/PatronBoard.svelte`
  about local capture of `member` values. These are unrelated to the MoKoKo
  voice route.

## Remaining production work

1. Run manual mobile QA on iOS Safari and Android Chrome:
   - microphone permission,
   - MediaRecorder support,
   - record/stop/transcribe loop,
   - manual text fallback.
2. Decide whether MoKoKo voice transcripts should immediately call CoCoA/KoKo
   intent handling after transcription or remain transcription-only for this
   release.
3. Add SAGE memory/provenance hooks for accepted voice intents.
4. Add NATS/DIDComm event emission for voice-command lifecycle events.
5. Add global `C3-Alliance.org` device/surface routing into MoKoKo vs Command.
