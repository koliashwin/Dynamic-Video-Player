# Ownership & Access Control Test Document

Manual test cases verifying cross-user data isolation and access control across the Clerk-based auth layer. Written after the initial auth rollout (ownership on `Clip`/`Section`/`Flow`, publish/draft visibility, cross-resource ownership checks). re-run this after any future change that touches auth, ownership or publish/playback logic, since those are exactly the areas most likely to silently regress.

**Status: all cases below pass**, on both local (SQLite) and the hosted (CockroachDB) environment.

---

## Prerequisites

Two separate Clerk accounts, referred to throughout as **User A** and **User B**.

To get a short-lived session token for whichever account is currently signed in (used for direct API testing, outside the app's own UI):

```js
await window.Clerk.session.getToken({ template: 'vapt-testing' })
```

Token lasts **~10 minutes** — if a request unexpectedly returns `401` mid-test, this is usually why; just fetch a fresh one.

---

## Test data setup (as User A)

Create one of each resource, attached to each other, as a baseline for every test below.

**Clip** — `Vapt uA clip 1` (`id: 7`)
```json
{
  "id": "7",
  "title": "Vapt uA clip 1",
  "filename": "231160fbbf85415cb2d772e7e6cbf5fd.mp4",
  "duration": 17.22
}
```

**Section** — `Vapt uA Section 1` (`id: 5`), with the clip above attached (`link id: 8`)
```json
{
  "id": "5",
  "title": "Vapt uA Section 1",
  "type": "choice",
  "clip_links": [
    {
      "id": "8",
      "order_index": 0,
      "clip": {
        "id": "7",
        "title": "Vapt uA clip 1",
        "filename": "231160fbbf85415cb2d772e7e6cbf5fd.mp4",
        "duration": 17.22
      }
    }
  ]
}
```

**Flow** — `Vapt uA Flow 1` (`id: 5`), with the section above attached
```json
{
  "id": "5",
  "name": "Vapt uA Flow 1",
  "description": "Vapt test flow user 1",
  "is_published": false,
  "section_links": [
    {
      "id": "5",
      "order_index": 0,
      "section": {
        "id": "5",
        "title": "Vapt uA Section 1",
        "type": "choice",
        "clip_links": [
          {
            "id": "8",
            "order_index": 0,
            "clip": {
              "id": "7",
              "title": "Vapt uA clip 1",
              "filename": "231160fbbf85415cb2d772e7e6cbf5fd.mp4",
              "duration": 17.22
            }
          }
        ]
      }
    }
  ]
}
```

---

## 1. Cross-user ownership isolation

All requests in this section are made **as User B**, targeting resources created **by User A** above.

### 1.1 Clips

| # | Test | Expected | Result |
|---|---|---|---|
| 1 | `GET /clips` | Clip `id: 7` is not present in the response | <input type='checkbox' checked> Pass |
| 2 | `DELETE /clips/7` | `404` | <input type='checkbox' checked> Pass |
| 3 | Clip still exists, unaffected, in User A's account | — | <input type='checkbox' checked> Pass |

### 1.2 Sections

| # | Test | Expected | Result |
|---|---|---|---|
| 1 | `GET /sections` | Section `id: 5` is not present | <input type='checkbox' checked> Pass |
| 2 | `POST /sections/5/clips` (attach any clip) | `404` | <input type='checkbox' checked> Pass |
| 3 | `DELETE /sections/5/clips/8` | `404 Attachment not found` | <input type='checkbox' checked> Pass |
| 4 | `DELETE /sections/5` | `404 Section not found` | <input type='checkbox' checked> Pass |
| 5 | Section and its clip attachment still exist, unaffected, in User A's account | — | <input type='checkbox' checked> Pass |

### 1.3 Flows

| # | Test | Expected | Result |
|---|---|---|---|
| 1 | `GET /flows` | Only User B's own flows are returned | <input type='checkbox' checked> Pass |
| 2a | `POST /flows/5/sections` (attach any section to User A's flow) | `404 Flow not found` | <input type='checkbox' checked> Pass |
| 2b | `POST /flows/{own_flow}/sections` with `section_id: 5` (attach User A's section to User B's own flow) | `404 Section not found` | <input type='checkbox' checked> Pass |
| 3 | `DELETE /flows/5/sections/5` | `404 Attachment not found` | <input type='checkbox' checked> Pass |
| 4 | `DELETE /flows/5` | `404 Flow not found` | <input type='checkbox' checked> Pass |
| 5 | `POST /flows/5/publish` | `404 Flow not found` | <input type='checkbox' checked> Pass |
| 6 | `POST /flows/5/unpublish` | `404 Flow not found` | <input type='checkbox' checked> Pass |

### 1.4 Playback (`GET /videos`)

| # | Test | Expected | Result |
|---|---|---|---|
| 1 | Request a flow published by another user | Served normally — **works even with no auth token at all** | <input type='checkbox' checked> Pass |
| 2 | Request a **draft** flow owned by another user | `404`, identical to a nonexistent flow (never `403`) | <input type='checkbox' checked> Pass |

---

## 2. Business logic & validation

| # | Test | Expected | Result |
|---|---|---|---|
| 1 | Publish a flow with zero sections | `422` | <input type='checkbox' checked> Pass |
| 2 | Publish a flow containing a section with zero clips | `422` | <input type='checkbox' checked> Pass |
| 3 | On an **already-published** flow, force-detach the last clip in its only section | Every published flow that depended on that clip is **automatically unpublished** | <input type='checkbox' checked> Pass |
| 4 | Attach the same clip to a section twice | Blocked on both frontend and backend (duplicate `order_index` is still technically allowed) | <input type='checkbox' checked> Pass |
| 5 | Attach the same section to a flow twice | Blocked on both frontend and backend (duplicate `order_index` is still technically allowed) | <input type='checkbox' checked> Pass |
| 6 | Upload a `.txt` file renamed to `.mp4` | Frontend shows a generic, user-facing message (`"This file doesn't appear to be a valid video. Please check the file and try again."`); the real error is logged server-side only, never sent to the client | <input type='checkbox' checked> Pass |

---

## Known accepted gaps (not covered by this suite, tracked separately)

- Duplicate `order_index` values within the same section/flow are still permitted (tests 2.4, 2.5) cosmetic/ordering-only, not a security or ownership concern.
- Upload size limits and subprocess timeouts on `ffprobe`/`ffmpeg` exist but aren't exercised by this suite. worth a dedicated load/abuse test pass if that becomes a priority.