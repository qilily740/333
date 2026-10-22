# Iris Music Worker

This Worker is the server side for Iris Music. It exposes only named NetEase operations; it is not an arbitrary URL proxy.

## Routes

- `GET /health`
- `GET /search?q=...`
- `GET /resolve?title=...&artist=...` — exact title and singer match, plus one verified song record
- `GET /song?id=...` — song details, album art URL, lyrics, and a standard playback URL
- `GET /playlist?id=...`
- `GET /auth/qr/start`, `GET /auth/qr/poll?id=...`
- `GET /auth/me`, `GET /user/playlists`, `POST /auth/logout` with a bearer session token

## Cloudflare bindings

Create one KV namespace and bind it as `MUSIC_STORE`. Set `SESSION_ENCRYPTION_KEY` as a Worker secret containing Base64 for exactly 32 random bytes. The Worker encrypts NetEase session cookies with AES-GCM before storing them in KV; the browser stores only an opaque Iris session token in a separate IndexedDB database that is not part of Iris exports. The production Worker URL is `https://iris-music-api.weishengrongqing.workers.dev`.

Bind the custom domain `music-api.iris-public.suri.us.ci` to the Worker after the parent zone `iris-public.suri.us.ci` is added to this Cloudflare account. The current account has no matching zone, so the app uses the Worker URL above until the zone is available. The API allows CORS from browser and local preview origins without ambient cookies. Account operations require the bearer session token; QR polling requires a random, expiring session ID. QR images are generated locally from the returned NetEase login URL.

## Limitations

NetEase QR login, playlist, lyric, and playback routes are not a documented public OAuth API. They can change or be restricted by NetEase. The Worker never accepts or stores a NetEase password. A song may have metadata and lyrics while lacking a standard playable URL.

Role invitations resolve the exact title and singer before showing a card. Failed matches are discarded; they are not turned into invented songs. Role listening history and saved playlists stay in the current Iris browser profile.

## Author feedback mail

`POST /feedback` receives multipart feedback with optional screenshot attachments, and sends only to `weishengrongqing@gmail.com`. No user needs a mail account or external mail app.

Before deploying, the author must configure a Resend account and a sender authorized by that account:

- Store `RESEND_API_KEY` as a Worker secret; never put it in browser code, exports, or Git.
- Set `FEEDBACK_FROM` to the authorized sender address (e.g. `Iris <feedback@your-verified-domain>`).
- `APP_ORIGIN` permits the production app. For additional deployed/preview origins set `FEEDBACK_ALLOWED_ORIGINS` to a comma-separated list of exact origins.
- Reuse `MUSIC_STORE` for a best-effort per-IP limit of five submissions per hour (KV is eventually consistent).
- Deploy the updated Worker and frontend. The frontend defaults to `/feedback` on the existing music API host, with an optional full endpoint override via `window.IRIS_FEEDBACK_API`.

Missing secrets return 503, never success. Attachments are limited to three PNG/JPEG/WebP images of at most 2 MiB each, checked on both sides, and are passed as email attachments rather than publicly hosted. Failures retain the draft and files in page memory; refresh clears that temporary draft. Only the entered text, optional reply email, app version and selected files are submitted. No chat records or API keys are collected. An accepted provider response is not a mailbox-delivery receipt.

Provider contract: https://resend.com/docs/api-reference/emails/send-email

For VS Code Live Preview, `FEEDBACK_ALLOW_LOCAL_PREVIEW="true"` additionally permits HTTP(S) origins on exact `localhost`, `127.0.0.1`, or `[::1]` hosts at any port. It does not allow opaque `null` origins, LAN addresses or arbitrary preview websites. Disable the variable to remove this development allowance.

`GET /feedback/quota` returns only remaining daily/monthly send counts, shared across users. It reads Resend `GET /usage` when permitted, or the provider quota-used headers available to Free accounts, with a 30-second cache and at most a five-minute stale fallback. It never exposes account details or credentials, and returns `quota: null` if no valid provider usage is available. The UI shows an approximate count, refreshes on opening and after submitting, and displays the provider reset time in Asia/Shanghai.

For a Sending-access-only key, `FEEDBACK_QUOTA_MODE="estimate"` avoids the privileged Usage API. The optional `FEEDBACK_QUOTA_BASELINE` JSON records a verified starting UTC day/month and daily/monthly used counts. The current baseline was read from the author's Resend Usage dashboard (one used email on 2026-10-22). A shared KV ledger subtracts successful messages, deduplicating repeated provider IDs, rolls over at UTC midnight (08:00 Asia/Shanghai), and incorporates quota headers when available. It is approximate because KV counters are eventually consistent and other uses of the Resend account may not be recorded. The UI explicitly labels it an estimate; key permissions are unchanged.

Opaque file previews (`Origin: null`) and requests without an Origin may read `GET /feedback/quota`, which exposes only public remaining counts. This exception does not apply to sending feedback: `POST /feedback` retains its origin checks.
