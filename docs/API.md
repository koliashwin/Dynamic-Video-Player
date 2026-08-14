# API Reference

Base URL: `http://localhost:8000` locally, or your deployed Render URL in production (`VITE_BACKEND_URL`).

This is a hand-written reference, kept independent of the running server on purpose — the interactive OpenAPI docs at `/docs` are still there and still useful for poking at live requests, but this doc doesn't need a server running to read.

---

## Authentication

Auth is via [Clerk](https://clerk.com). The frontend attaches a bearer token automatically; direct API calls need to send it themselves:

```
Authorization: Bearer <clerk-session-token>
```

Two authentication levels appear throughout this doc:

| Level | Behavior |
|---|---|
| **Required** | Missing or invalid token → `401 Authentication required`. |
| **Optional** | No token needed to get a response, but *if* a valid token is sent, the response may differ (used only by `GET /videos`, to distinguish "you own this draft" from "you don't"). |
| **None** | Public, no auth logic runs at all. |

**Ownership pattern used throughout:** every resource (`Clip`, `Section`, `Flow`) has an `owner_id` — the Clerk user id (`sub` claim) of whoever created it. Endpoints that read or modify a specific resource by id filter on `id AND owner_id` in one query, rather than fetching by id and checking ownership as a separate step. This means **a resource that exists but belongs to someone else returns `404`, not `403`** — an unauthorized request can't distinguish "doesn't exist" from "exists, but isn't yours." This is intentional and consistent across every endpoint below, not an inconsistency to fix.

**Standard error shape**, for any non-2xx response:
```json
{ "detail": "Human-readable explanation" }
```

---

## Clips

### `GET /clips`
**Auth: Required.** Returns the signed-in user's own clips only.

**Response `200`** — `ClipOut[]`:
```json
[
  { "id": "1", "title": "Intro", "filename": "a1b2c3.mp4", "duration": 12.4 }
]
```
Note `id` is a **string**, not a number — deliberate, since CockroachDB's default primary keys can exceed JavaScript's safe integer range (`2^53`). Every `id` field in this API follows the same rule.

### `POST /clips/upload`
**Auth: Required.** `multipart/form-data`:

| Field | Type | Notes |
|---|---|---|
| `title` | string | required |
| `file` | file | `.mp4`, `.mov`, or `.webm` only |

On upload: duration is read via `ffprobe`, the file is remuxed with `ffmpeg -movflags +faststart` (so playback starts immediately instead of waiting for the whole file), then sent to whichever storage backend is active (`STORAGE_BACKEND=local` or `cloud`).

**Response `200`** — the created `ClipOut`.
**Errors:** `400` unsupported file type · `500` duration read or storage upload failed.

### `DELETE /clips/{clip_id}`
**Auth: Required.** Only deletes a clip you own (`404` otherwise, same as above).

**Query param:** `force` (bool, default `false`).

If this clip is the *last* clip in any section, and that section belongs to a flow, the request is blocked by default:

**Response `409`** (when `force=false` and deleting would empty a section that's in use):
```json
{ "detail": "Deleting this clip will empty: 'Intro Section' (used by: My Flow)" }
```
Retry the same request with `?force=true` to actually delete anyway.

**Response `200`** (success): `{ "deleted": 1 }`

---

## Sections

Same shape as Clips throughout — owner-scoped list, ownership-checked mutations, `404` for anything not yours.

### `GET /sections`
**Auth: Required.** Your sections only, each including its attached clips (`clip_links`, ordered by `order_index`).

### `POST /sections`
**Auth: Required.** Body:
```json
{ "title": "Opening", "type": "single" }
```
`type` is one of `single` (plays every clip in order) · `choice` (viewer picks one) · `random` (one is drawn at random). Defaults to `single` if omitted.

### `POST /sections/{section_id}/clips`
**Auth: Required.** Attaches one of *your own* clips to one of *your own* sections. Body:
```json
{ "clip_id": 4, "order_index": null }
```
`order_index` is optional — omit it to append at the end. **Both the section and the clip must belong to you** — attaching someone else's clip (by guessing its id) returns `404`, same as if it didn't exist.

### `DELETE /sections/{section_id}/clips/{link_id}`
**Auth: Required.** Detaches a clip from a section. `link_id` is the attachment's own id (from `clip_links[].id`), not the clip's id.

**Query param:** `force` (bool, default `false`) — same confirm-before-breaking-something pattern as clip deletion: blocked with `409` if this is the section's last clip and the section is used by a flow, unless `force=true`.

### `DELETE /sections/{section_id}`
**Auth: Required.** Deletes the whole section (and its clip attachments). `force=true` bypasses the `409` warning if this section is the only one in some flow.

---

## Flows

Flows are the one resource with a genuine public surface — the Feed. Two different `GET` endpoints exist for that reason; don't confuse them.

### `GET /flows`
**Auth: Required.** The signed-in user's **own** flows — draft and published both. This is what the config panel uses. Never includes anyone else's flows, published or not.

### `GET /flows/published`
**Auth: None — fully public.** Every published flow, **across all users**. This is what the Feed uses. Never returns a draft, even to its own owner — if you want to see your own unpublished work, use `GET /flows` (signed in) instead.

### `POST /flows`
**Auth: Required.** Body:
```json
{ "name": "Launch Trailer", "description": "optional" }
```
New flows always start as drafts (`is_published: false`).

### `POST /flows/{flow_id}/sections`
**Auth: Required.** Attaches one of your own sections to one of your own flows — same cross-ownership rule as clips→sections. Body:
```json
{ "section_id": 2, "order_index": null }
```
**`400`** if the section has no clips attached yet (can't build a flow out of empty sections).

### `DELETE /flows/{flow_id}/sections/{link_id}`
**Auth: Required.** `force=true` bypasses the `409` warning if this is the flow's only section (would otherwise leave the flow empty).

### `DELETE /flows/{flow_id}`
**Auth: Required.** Deletes the flow and its section attachments (the sections themselves aren't deleted, just detached).

### `POST /flows/{flow_id}/publish`
**Auth: Required.** Marks the flow published — this is what makes it show up on `GET /flows/published` / the Feed.

**Response `422`** if the flow isn't actually playable yet:
```json
{ "detail": "'Launch Trailer' has section(s) with no clips: Ending. add clips or remove them from the flow" }
```
This is the *same* check `GET /videos` runs before serving playback — publishing something broken is blocked at the source rather than caught later by a viewer.

### `POST /flows/{flow_id}/unpublish`
**Auth: Required.** Reverts to draft. No validation needed — unpublishing can't break anything.

---

## Videos (playback)

### `GET /videos?flow_id={id}`
**Auth: Optional** — this is the one endpoint that behaves differently based on *whether* a token is sent, not just requiring or ignoring one.

- `flow_id` omitted → serves whichever flow was created first (`resolve_flow`'s fallback).
- **Published flow:** served to anyone — signed in, signed out, owner or not. No auth check runs at all.
- **Unpublished (draft) flow:** served **only** if the request is authenticated **and** the token's `sub` matches the flow's `owner_id`. Everyone else — including a signed-in user who isn't the owner — gets the exact same `404` as a flow that doesn't exist, never a `403`.

**Response `200`** — the full playable structure:
```json
{
  "flow": { "id": "3", "name": "Launch Trailer" },
  "sections": [
    {
      "id": "section-7",
      "title": "Opening",
      "type": "single",
      "clips": [
        { "id": "clip-12", "title": "Intro", "url": "https://...", "duration": 12.4 }
      ]
    }
  ]
}
```
`clips[].url` is a live playback URL — a signed, short-lived URL if `STORAGE_BACKEND=cloud`, or a direct local path if `STORAGE_BACKEND=local`. Don't cache it long-term.

**Response `422`** if the flow exists and is accessible, but isn't actually playable (no sections, or a section with no clips) — same `get_flow_playability_error` check `publish` uses.

---

## Things that are true across every endpoint above, not repeated per-section

- Every mutating endpoint (`POST`/`DELETE`) requires auth, except `POST /flows` isn't listed as an exception — it does require auth, only `GET /flows/published` and `GET /videos` (conditionally) don't.
- Attaching resource A to resource B always checks that **both** belong to the caller, not just the one being modified.
- `force=true` query params exist specifically to convert a blocked `409` into an executed action — always a deliberate second request, never a flag you'd set by default.
- `id` fields are strings everywhere, for the CockroachDB integer-precision reason noted under Clips.