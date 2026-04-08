# Architecture

## Overview

Rapid KL Live Status Tracker is a fully static web app. There is no traditional backend server. The frontend communicates directly with Supabase using its JavaScript client library.

---

## System Diagram

```
User's Phone/Browser
        │
        ▼
GitHub Pages
(HTML + CSS + JS + Supabase JS Client)
        │
        │  read/write via Supabase JS SDK
        │  (secured by Row Level Security)
        ▼
Supabase
├── PostgreSQL Database  ← stores reports, comments, upvotes, users
├── Auth                 ← handles login (email/Google)
└── Realtime             ← pushes live updates to all connected browsers
        ▲
        │  nightly at midnight (after Rapid KL closes ~00:00)
        │
GitHub Actions (Scheduled Workflow)
├── Connects to Supabase using service role key (stored as GitHub Secret)
├── Exports all records to a dated CSV file → committed to repo
└── Deletes all report/comment/upvote records from Supabase
    (user accounts and emails are NOT deleted)
```

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| No backend server | Eliminates Render/cold-start problem. Supabase handles auth, data, and real-time natively. |
| Supabase Realtime | Reports appear instantly on all screens — no polling required. |
| Login required to report | Reduces spam. Per-account rate limiting is more reliable than IP-based. |
| Nightly export + purge | Keeps Supabase free tier lean. Historical data preserved as CSV in repo. |
| GitHub Pages | Free, reliable static hosting. No server to manage. |

---

## Security Model

- **Anon key** (public): Used in the frontend JS. Safe to expose — Supabase Row Level Security (RLS) enforces what it can do.
- **Service role key** (private): Used only in GitHub Actions. Never committed to repo — stored as a GitHub Secret.

### RLS Policy Summary

| Table | Anyone (anon) | Logged-in user | Service role |
|---|---|---|---|
| reports | SELECT only | INSERT (own), SELECT | Full access |
| comments | SELECT only | INSERT (own), SELECT | Full access |
| upvotes | SELECT only | INSERT (own, once per report) | Full access |
| users | — | SELECT/UPDATE (own row) | Full access |

---

## Data Lifecycle

```
Report submitted
    → stored in Supabase (reports table)
    → visible on UI in real-time

After 2 hours with no confirmation:
    → status display resets to "Smooth" on UI
    → record stays in database (not deleted)

At midnight (Rapid KL closed):
    → GitHub Actions exports all records to /exports/YYYY-MM-DD.csv
    → All report/comment/upvote records deleted from Supabase
    → Database clean for next day
    → User accounts and emails untouched
```

---

## Future: Phase 2+ Backend

If complex logic is needed (e.g. smart routing, bus API calls), a lightweight Python/Flask backend can be added on Render at that stage. The frontend would then call the Flask API for those specific features, while continuing to use Supabase directly for reports and auth.
