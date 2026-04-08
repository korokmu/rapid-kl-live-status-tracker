# Gemini Developer Brief — Rapid KL Live Status Tracker

> Read this file at the start of every coding session before writing any code.
> All architecture and tech stack decisions are final unless eri explicitly changes them.

---

## What This Project Is

A free, public, community-powered web app for KL commuters to report and check live Rapid KL train conditions — like Waze but for trains.

**Pilot:** Kelana Jaya Line (Line 5), KL Sentral station first.

---

## Tech Stack (Final — Do Not Change)

| Layer | Tool | Notes |
|---|---|---|
| Frontend | HTML + CSS + vanilla JavaScript | No frameworks. Keep it simple. |
| Database | Supabase (PostgreSQL) | Direct from frontend via Supabase JS client |
| Auth | Supabase Auth | Email + Google login |
| Real-time | Supabase Realtime | Built-in — no polling needed |
| Frontend hosting | GitHub Pages | Static files only |
| Nightly export | GitHub Actions (Python script) | Runs at midnight, exports CSV, clears DB |
| Backend | **None for now** | May be added in Phase 2 for smart routing only |

> ❌ Do NOT suggest or use: Flask, Render, SQLite (for production), React, Vue, Node.js, or any backend framework unless eri asks.

---

## Project Structure

```
rapid-kl-live-status-tracker/
├── src/
│   ├── index.html        ← main page
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── supabase.js   ← Supabase client init
│       ├── auth.js       ← login/logout logic
│       ├── reports.js    ← submit/fetch reports
│       └── realtime.js   ← live update subscriptions
├── scripts/
│   └── nightly_export.py ← GitHub Actions nightly job
├── .github/
│   └── workflows/
│       └── nightly.yml   ← scheduled GitHub Actions workflow
├── docs/                 ← DO NOT MODIFY (maintained separately)
├── .venv/                ← Python virtual environment (not committed)
├── requirements.txt      ← Python dependencies for nightly script
├── .gitignore
├── README.md
├── LICENSE
└── CHANGELOG.md
```

---

## Python / Venv

A venv is already set up at `.venv/`. Always activate it before running or testing any Python script:
```bash
source .venv/bin/activate
```

Dependencies are in `requirements.txt`. To install:
```bash
pip install -r requirements.txt
```

Current dependencies:
- `supabase` — Supabase Python client (for nightly export script)
- `python-dotenv` — loads `.env` for local testing

---

## Database Schema (Supabase)

Full schema in `docs/database-schema.md`. Summary:

- **`stations`** — static reference table (line, station name, sequence)
- **`reports`** — user-submitted status (smooth/slow/interrupted), with category, upvote count, active flag
- **`comments`** — free-text per station, max 280 chars
- **`upvotes`** — one per user per report (enforced by UNIQUE constraint)
- **`users`** — public profile extending Supabase Auth; includes `marketing_consent` boolean

---

## Key Business Rules

1. **Anyone can VIEW** status — no login needed
2. **Login required** to submit reports, comments, or upvotes
3. **Rate limit**: 1 report per station per 5 minutes per user account
4. **Status display resets** to "Smooth" after 2 hours of no confirmation — but the DB record stays until midnight
5. **Verified** = 5+ upvotes; **Resolved** = 3+ "Resolved" clicks → status resets
6. **Nightly at midnight**: export all records to CSV → delete reports/comments/upvotes from Supabase (user accounts kept)

---

## Security Rules (Supabase RLS)

| Table | Anon (not logged in) | Logged-in user | Service role |
|---|---|---|---|
| stations | SELECT | SELECT | Full |
| reports | SELECT | INSERT own, SELECT | Full |
| comments | SELECT | INSERT own, SELECT | Full |
| upvotes | SELECT | INSERT own (unique), SELECT | Full |
| users | — | SELECT/UPDATE own | Full |

> The service role key is only used in GitHub Actions. Store as GitHub Secret `SUPABASE_SERVICE_ROLE_KEY`. Never hardcode it.

---

## Environment Variables

Create a `.env` file in the project root for local testing (already in `.gitignore` — never commit it):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Frontend JS uses only `SUPABASE_URL` and `SUPABASE_ANON_KEY` (safe to expose — protected by RLS).
GitHub Actions uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (stored as GitHub Secrets).

---

## Current Build Stage

**Stage 1 — Supabase Setup**
- Create all tables in Supabase with correct columns and RLS policies
- Test basic read/write from a local HTML file

**Stage 2 — Frontend MVP**
- Build `src/index.html` with Supabase JS client (via CDN — no npm needed)
- Login/logout UI
- Status display for KL Sentral
- Submit report form (mobile-first, thumb-friendly)
- Real-time subscription for live updates

**Stage 3 — Nightly Export**
- `scripts/nightly_export.py` — connects to Supabase with service role key, exports CSV, deletes records
- `.github/workflows/nightly.yml` — runs the script at midnight daily (Malaysia time = UTC+8, so 16:00 UTC)

---

## What NOT to Do

- ❌ Do not add a backend server (Flask, Express, etc.) unless eri explicitly asks
- ❌ Do not use SQLite in production
- ❌ Do not commit `.env` files or any keys
- ❌ Do not export user emails to CSV or GitHub — emails stay in Supabase Auth only
- ❌ Do not modify files in `docs/` — those are maintained by Copilot CLI
- ❌ Do not install Python packages globally — always use the `.venv` in this project
- ❌ Do not run `pip install` outside the activated venv
