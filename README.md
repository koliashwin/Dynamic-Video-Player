# Dynamic Video Player

A small engine for building branching, non-linear video experiences. Instead of one upload playing start to finish, a **flow** is assembled from **sections** that chain together. some play straight through, some let the viewer pick a path, some draw a random clip each time. No two watches have to look the same.

Built as a personal full-stack project to dig into non-linear media, branching state machines and shipping the same codebase through three different deployment shapes (hosted web app and a fully offline desktop build).

---

## Table of contents

- [Dynamic Video Player](#dynamic-video-player)
  - [Table of contents](#table-of-contents)
  - [Concept](#concept)
  - [Features](#features)
  - [Tech stack](#tech-stack)
  - [Project structure](#project-structure)
  - [Getting started](#getting-started)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [Environment variables](#environment-variables)
  - [Storage \& database modes](#storage--database-modes)
  - [Offline desktop build (outdated)](#offline-desktop-build-outdated)
  - [Deployment](#deployment)
  - [Known limitations](#known-limitations)

---

## Concept

A **flow** is an ordered list of **sections**. Each section is one of three types:

| Type | Behavior |
|---|---|
| **Single** | Clips play back to back, in order. The default, linear building block. |
| **Choice** | The viewer picks between multiple clips. by default the first clip in the section is played. |
| **Random** | One clip is drawn at random from the set each time the section plays. |

Flows are drafted, previewed and only appear in the public **Feed** once explicitly **published**. so half-built content never accidentally shows up for a viewer.

## Features

- **Branching playback** : single / choice / random sections are chained into flows
- **Accounts & ownership** : sign-in via Clerk. every clip, section and flow belongs to the account that created it; the config panel only ever shows your own resources, and other users' drafts return a plain `404`, never a `403`, so they can't even be detected by ID-guessing
- **Draft → Publish workflow** : flows stay hidden from the feed until explicitly published, with server-side validation that blocks publishing anything broken (empty sections, sections with no clips). published flows are played by anyone signed in or not
- **Inline + full-page preview** : test a flow without leaving the configuration panel or open it as a standalone player
- **"Program time" progress indicator** : a stable, non-shifting time estimate for the whole flow, with a live `+`/`-` delta showing how far actual playback has diverged from a typical playthrough (branches taken, sections skipped)
- **Guardrails against broken content** : deleting the last clip in a section or the last section in a flow, warns about exactly which flows it would break before letting you proceed
- **Config panel** : manage clips, sections and flows independently with attach/detach relationships between them
- **Swappable storage backend** : clips live on local disk for development or in Backblaze B2 (S3-compatible) in production, switched with a single environment variable, no code changes either way
- **Swappable database** : SQLite by default or any Postgres-wire-compatible database (including CockroachDB) via `DATABASE_URL`
- **Offline desktop build** : the entire app (frontend + backend + ffmpeg tooling) packages into a standalone Windows executable via PyInstaller for zero-dependency local use. (haven't updated after adding Auth layer)

## Tech stack

- **Frontend** : React + Vite, MUI (Material UI), React Router
- **Backend** : FastAPI, SQLAlchemy
- **Auth** : Cleark (`@clerk/clerk-react` on frontend, fastapi_clerk_auth verifying JWT against Clerk's JWKS on backend)
- **Database** : SQLite (local/offline) or CockroachDB / Postgres (hosted)
- **Storage** : local disk (dev) or Backblaze B2 via `boto3` (production)
- **Media tooling** : `ffmpeg` / `ffprobe` for duration detection and faststart remuxing on upload
- **Packaging** : PyInstaller for the offline desktop build

## Project structure

```
root/
│
├── backend/
│   ├── app/
│   │   ├── models/                     # SQLAlchemy models (Clip, Section, Flow and their join tables)
│   │   ├── schemas/                    # Pydantic request/response schemas
│   │   ├── routers/                    # FastAPI route handlers (clips, sections, flows, videos)
│   │   ├── services/
│   │   │   ├── storage/                # local_storage.py / cloud_storage.py, switched via STORAGE_BACKEND
│   │   │   ├── auth.py                 # Clerk token verification + ownership dependency (require_current_user_id)
│   │   │   ├── video_service.py        # builds the playable flow structure served to the player
│   │   │   └── media_utils.py          # ffprobe duration + ffmpeg faststart remux on upload
│   │   └── config/                     # Database configuration
│   │
│   ├── main.py                         # FastAPI app, deployment entry point
│   └── offline_main.py                 # Offline build entry point
│
├── frontend/
│   └── src/
│       ├── pages/                      # Route-level pages (Landing, Feed, VideoPage, config pages)
│       ├── components/                 # Reusable UI components (VideoPlayer, Timeline, ChoiceSection, InlineFlowPreview, ...)
│       ├── hooks/
│       │   └── usePlayableFlow.js      # shared playback state/logic used by both the full-page and inline preview
│       │                               
│       ├── services/                   # API client functions & auth token
│       └── utils/                      # Timeline & duration helpers
│
└── ...
```

## Getting started

### Backend

```bash
cd backend
python -m venv venv
venv/Scripts/activate      
pip install -r requirements.txt
cp example.env .env           # or create the .env file yourself by refering expample.env
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000` by default.

### Frontend

```bash
cd frontend
npm install
cp example.env .env           # or create the .env file yourself by refering expample.env
npm run dev
```

Frontend runs at `http://localhost:5173` by default.

## Environment variables

**`backend/.env`**

| Variable | Required when | Description |
|---|---|---|
| `DATABASE_URL` | using anything other than SQLite | Full connection string. Defaults to a local SQLite file (`app_local.db` / `app_cloud.db` depending on `STORAGE_BACKEND`) if unset. |
| `ALLOWED_ORIGINS` | always | Comma-separated list of origins allowed to call the API (CORS). |
| `STORAGE_BACKEND` | always | `local` or `cloud`. Determines which storage backend module loads. |
| `CLERK_JWKS_URL` | hosted / any deployment with real accounts | JWKS endpoint used to verify Clerk session tokens. If unset, the backend falls back to a no-op auth guard. every request is treated anonymous and owner-scoped routes reject with 401, There's currently no equivalent fallback on the frontend (check [Known limitations](#known-limitations)) |
| `B2_BUCKET_NAME`, `B2_ENDPOINT_URL`, `B2_KEY_ID`, `B2_APPLICATION_KEY`, `B2_REGION` | `STORAGE_BACKEND=cloud` | Backblaze B2 bucket + application key credentials. |
| `LOCAL_VIDEOS_DIR`, `BACKEND_BASE_URL` | `STORAGE_BACKEND=local` | Where clips are stored on disk, and the URL the backend serves them from. |

**`frontend/.env`**

| Variable | Description |
|---|---|
| `VITE_BACKEND_URL` | Base URL of the backend API. |
| `VITE_CLERK_PUBLISHABLE_KEY` | Required. the app throws error on startr without it. Publishable key for the Clerk instance that issues the session tokens for backend to verify against `CLERK_JWKS_URL` |

## Storage & database modes

The storage backend is chosen entirely by `STORAGE_BACKEND`. `clips.py` and `video_service.py` never know or care which one is active, they just call `upload_file` / `delete_file` / `get_playback_url` from `app/services/storage`, which dispatches to the right module at import time.

`local` mode needs no cloud credentials at all, useful for local development and the offline build. `cloud` mode uploads to Backblaze B2 and serves clips via short-lived signed URLs (the bucket stays private; nothing is publicly listable).

The database follows the same pattern via `DATABASE_URL`, altering schema with `alembic` is available now. you no longer need to run manual `Alter table` queries on database.

```bash
alembic revision --autogenerate -m "your-db-version-name"   # this command generate an alembic scirpt as per changes in orm models (sqlalchemy)
alembic upgrade head                                        # this command updates databse
```

## Offline desktop build (outdated)

`backend/offline_main.py` wraps the FastAPI app to serve the built frontend as static files and open a browser tab automatically, so the whole thing runs as one process with no separate frontend server. Building it:

```bash
cd frontend && npm run build
# copy frontend/dist into backend/frontend_dist/dist
cd ../backend
python -m PyInstaller --onedir --add-data "frontend_dist;frontend_dist" offline_main.py
```

`ffmpeg.exe` / `ffprobe.exe` need to sit in a `bin/` folder next to the built executable. they're not bundled by PyInstaller automatically, since they're external binaries, not Python packages. The offline build always runs in `STORAGE_BACKEND=local` / SQLite mode; there's no reason to configure cloud storage for something meant to run standalone on one machine.

## Deployment

The hosted version splits across multiple providers, each handling the piece it's actually good at:

- **Frontend** : Vercel (static Vite build)
- **Backend** : Render (FastAPI, native Python runtime. `ffmpeg` is preinstalled there, no Docker needed)
- **Storage** : Backblaze B2 (private bucket, signed URLs. avoids per-GB egress costs that would add up serving video repeatedly)
- **Database** : CockroachDB (Postgres-wire-compatible; needs the `sqlalchemy-cockroachdb` dialect and `sslrootcert=system` in the connection string. see `requirements.txt`)

## Known limitations

Being upfront about what this is and isn't:

- **No real video thumbnails.** Clip cards show a placeholder icon, not an actual extracted frame.
- **Offline build is not tested after auth layer.** will test offline build after most of planned features added.
- **No Guest account / demo mode.** Every config route now requires signing in; there's no read-only or seeded demo experience for someone who just wants to click around without creating account