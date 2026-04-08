# Rapid KL Live Status Tracker (Pilot: Kelana Jaya Line)

## 🎯 Goal
A free, public, community-powered app for KL commuters to report and check live train conditions — crowdsourced, like Waze but for Rapid KL.

---

## 🏗️ Tech Stack (Zero-Cost)

| Layer | Tool | Why |
|---|---|---|
| Frontend (UI) | HTML + CSS + JavaScript | Runs as static files — free on GitHub Pages |
| Database + Auth | Supabase | Free, never expires, 500MB, built-in login + real-time updates |
| Hosting (Frontend) | GitHub Pages | Free forever |
| Nightly Export | GitHub Actions | Free, runs on a timer — no server needed |

> **No backend server needed.** The frontend talks to Supabase directly using Supabase's JavaScript client.
> Flask/backend can be added later (Phase 2+) if complex logic is needed (e.g. smart routing).

---

## 📐 Architecture (How It Works)

```
User's Phone/Browser
        │
        ▼
GitHub Pages (HTML/CSS/JS + Supabase JS client)
        │  talks directly (read/write with RLS security)
        ▼
Supabase (database + auth + real-time)
        ▲
        │  nightly at midnight (after Rapid KL closes)
GitHub Actions
  → exports day's reports to CSV → saves to GitHub repo
  → deletes all records from Supabase
  → database is clean for next day
```

- Reports appear on screen **instantly** (Supabase real-time — no polling needed)
- Historical data lives as daily CSV files in the GitHub repo — never lost, free to store, easy to analyse later
- No cold start, no sleeping servers

---

## Phase 1: MVP — Community "Waze" Reporting
* **Pilot Route**: Kelana Jaya Line (Line 5)
* **Pilot Station**: KL Sentral
* **Login required to report/comment** (Supabase Auth — email or Google). Viewing status is open to everyone.
* **Email collection at signup**: Optional opt-in checkbox with wording:
  > *"I agree to receive updates about this and related future projects"*
  * Email + consent flag (`marketing_consent = true`) saved in Supabase
  * Emails stay in Supabase only — access via Supabase dashboard when needed (e.g. to export for a future project announcement)
  * Never exported to GitHub repo or any public location
* **Waze-style Reporting**:
    * **Live Status**: Users toggle status between *Smooth*, *Slow*, or *Interrupted*
    * **Commuter Comments**: Text box for users to report ground-truth info
    * **Upvote Verification**: A "Confirm" or "Still Happening" button to validate reports
* **Mobile-First UI**: All buttons and inputs must be thumb-friendly — commuters are on their phones, standing on a platform

### Anti-Abuse (Basic)
* Login required — no anonymous reporting (reduces spam significantly)
* Per-user rate limiting: max **1 report per station per 5 minutes** per account
* Reports display resets after **2 hours** of no confirmation — status shows as *Smooth* (record stays in database until midnight export)
* Upvote threshold: **5 upvotes** = "Verified"; **3 "Resolved" clicks** = status resets

---

## Phase 1.5: Quick-Report Categories
*Presets to make reporting faster for users on the move:*
* 🚨 **Technical**: Signal fault, door issue, or train stoppage
* 👥 **Crowd**: Platform overflowing or train is packed
* ⛈️ **Weather**: Flash flood near station or heavy rain causing delays
* 🛠️ **Facility**: Escalator/Lift broken or Touch 'n Go reader offline

---

## Phase 2: System Expansion & Intelligence
* **Live Load Tracking**: Visual indicators for passenger density based on user reports
* **Alternative Travel Recommendations**: Automated suggestions for Rapid Bus, DRT, or LRT/MRT alternatives during disruptions
* **Expand Coverage**: Add more Kelana Jaya Line stations before adding new lines

---

## 🗺️ Development Roadmap

### Stage 1 — Prototype (Current)
Set up Supabase project: create tables for reports, comments, upvotes. Set up Supabase Auth. Test basic read/write from a local HTML file.

### Stage 2 — Frontend (MVP UI)
Build the mobile-first HTML/CSS/JS frontend with Supabase JS client. Deploy to GitHub Pages. Test end-to-end with real Supabase data.

### Stage 3 — Nightly Export (GitHub Actions)
Set up the scheduled GitHub Actions job: export daily CSV to repo, clear Supabase records at midnight.

### Stage 4 — Community Testing
Test the full flow: login → report → upvote → verify. Validate anti-abuse rules. Gather feedback from real users.

### Stage 5 — Quick Categories + Full Kelana Jaya Line
Add the quick-report category buttons. Expand from KL Sentral to all Kelana Jaya Line stations.

### Stage 6 — Smart Routing
If system detects "Delayed" status on a rail station, automatically surface nearest Rapid Bus alternatives (e.g., Bus 750/751 at KL Sentral). *(May require a lightweight backend at this stage.)*

### Stage 7 — Full Network Rollout
Scale to all LRT, MRT, and Monorail lines. Add a map view with "Crowd" and "Delay" pins.

### Stage 8 — Official Integration (Stretch Goal)
⚠️ **Caveat:** Prasarana does not currently have a well-documented public API. This stage is aspirational — research API availability before planning work here. If no public API exists, consider scraping the official Prasarana website only if `robots.txt` permits it.

Goal: Sync community reports with official data to compare "ground truth" vs. "official schedule."

---

## 🔮 Future Version (v2) — Post-Launch Features
These are intentionally left out of MVP to keep scope manageable. Add once real users are using the app:
* **Notifications**: Users subscribe to alerts for a specific station (e.g., "notify me if KL Sentral is Interrupted"). Requires browser push notifications or email — more complex, needs additional service.
* **Report history per user**: Let logged-in users see their past reports.
* **Reputation system**: Users who submit accurate reports gain a "Trusted Reporter" badge.
