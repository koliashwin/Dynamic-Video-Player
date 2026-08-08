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
  - [Offline desktop build](#offline-desktop-build)
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
- **Draft → Publish workflow** : flows stay hidden from the feed until explicitly published, with server-side validation that blocks publishing anything broken (empty sections, sections with no clips)
- **Inline + full-page preview** : test a flow without leaving the configuration panel or open it as a standalone player
- **"Program time" progress indicator** : a stable, non-shifting time estimate for the whole flow, with a live `+`/`-` delta showing how far actual playback has diverged from a typical playthrough (branches taken, sections skipped)
- **Guardrails against broken content** : deleting the last clip in a section or the last section in a flow, warns about exactly which flows it would break before letting you proceed
- **Config panel** : manage clips, sections and flows independently with attach/detach relationships between them
- **Swappable storage backend** : clips live on local disk for development or in Backblaze B2 (S3-compatible) in production, switched with a single environment variable, no code changes either way
- **Swappable database** : SQLite by default or any Postgres-wire-compatible database (including CockroachDB) via `DATABASE_URL`
- **Offline desktop build** : the entire app (frontend + backend + ffmpeg tooling) packages into a standalone Windows executable via PyInstaller for zero-dependency local use

## Tech stack

- **Frontend** : React + Vite, MUI (Material UI), React Router
- **Backend** : FastAPI, SQLAlchemy
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
│       ├── services/                   # API client functions
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
| `B2_BUCKET_NAME`, `B2_ENDPOINT_URL`, `B2_KEY_ID`, `B2_APPLICATION_KEY`, `B2_REGION` | `STORAGE_BACKEND=cloud` | Backblaze B2 bucket + application key credentials. |
| `LOCAL_VIDEOS_DIR`, `BACKEND_BASE_URL` | `STORAGE_BACKEND=local` | Where clips are stored on disk, and the URL the backend serves them from. |

**`frontend/.env`**

| Variable | Description |
|---|---|
| `VITE_BACKEND_URL` | Base URL of the backend API. |

## Storage & database modes

The storage backend is chosen entirely by `STORAGE_BACKEND`. `clips.py` and `video_service.py` never know or care which one is active, they just call `upload_file` / `delete_file` / `get_playback_url` from `app/services/storage`, which dispatches to the right module at import time.

`local` mode needs no cloud credentials at all, useful for local development and the offline build. `cloud` mode uploads to Backblaze B2 and serves clips via short-lived signed URLs (the bucket stays private; nothing is publicly listable).

The database follows the same pattern via `DATABASE_URL`, with one caveat: **there's no migration tool** (no Alembic). `Base.metadata.create_all()` only creates tables that don't exist yet, it never alters existing ones. Schema changes to an existing database (e.g. a new column) need a manual `ALTER TABLE` run once against that database.

## Offline desktop build

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

- **No user accounts.** Every clip, section and flow lives in one global, unauthenticated pool. anyone who can reach the API can upload, publish or delete anything. (This is next target in my to-do list)
- **No real video thumbnails.** Clip cards show a placeholder icon, not an actual extracted frame.
- **No schema migrations.** As noted above, schema changes to a live database are a manual, one-time `ALTER TABLE`, not an automated migration.
- **Preview and published playback currently share the same unauthenticated endpoint** meaningful once user accounts exist, since a "private" preview would need its own access check.