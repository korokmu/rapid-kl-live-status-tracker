# Rapid KL Live Status Tracker

A free, community-powered web app for KL commuters to report and check live train conditions in real time — crowdsourced, like Waze but for Rapid KL.

**Pilot:** Kelana Jaya Line (Line 5), starting with KL Sentral station.

---

## ✨ Features

- 🚦 Live status toggle — Smooth / Slow / Interrupted
- 💬 Commuter comments for ground-truth reporting
- 👍 Upvote/confirm system — 5 confirms = Verified status
- ⚡ Real-time updates — no page refresh needed
- 📱 Mobile-first design — built for commuters on the go
- 🔐 Login required to report (reduces spam)

---

## 🏗️ Tech Stack

| Layer | Tool |
|---|---|
| Frontend | HTML + CSS + JavaScript |
| Database + Auth + Real-time | [Supabase](https://supabase.com) |
| Hosting | GitHub Pages |
| Nightly Data Export | GitHub Actions |

---

## 📁 Project Structure

```
rapid-kl-live-status-tracker/
├── src/                  ← Frontend source files
│   ├── index.html
│   ├── css/
│   └── js/
├── scripts/              ← Automation scripts (nightly export)
├── docs/                 ← Project documentation
│   ├── architecture.md
│   ├── database-schema.md
│   ├── privacy-policy.md
│   └── terms-of-service.md
├── .github/workflows/    ← GitHub Actions (nightly export)
├── CHANGELOG.md
├── LICENSE
└── README.md
```

---

## 🚀 Running Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/<your-username>/rapid-kl-live-status-tracker.git
   cd rapid-kl-live-status-tracker
   ```

2. Create a `.env` file in the root with your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

3. Open `src/index.html` in your browser — no build step needed.

---

## 📄 Documentation

- [Architecture](docs/architecture.md)
- [Database Schema](docs/database-schema.md)
- [Privacy Policy](docs/privacy-policy.md)
- [Terms of Service](docs/terms-of-service.md)

---

## 📜 License

All Rights Reserved — see [LICENSE](LICENSE)
