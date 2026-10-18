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
