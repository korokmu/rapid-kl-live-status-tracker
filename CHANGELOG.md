# Changelog

All notable changes to this project will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

## [0.4.0] - 2026-04-11
### Added
- Marketing consent checkbox to Sign Up flow for legal compliance
- 2-hour auto-expire rule for live status display (UI resets to Smooth for old reports)
- "How it Works" guide ❓ accessible via help button in header
- Date and Time included in all status and comment timestamps
- Full LRT Kelana Jaya Line station list added to database

### Fixed
- Authentication form inputs now clear automatically after use
- RPC 404 error by adding `increment_confirm_count` database function
- Reports table schema updated with missing `user_id` and `resolved_count` columns

### Changed
- Nightly export script now archives `comments`, `upvotes`, and `resolves`
- Verification system now tracks individual user votes to prevent spam

## [0.3.0] - 2026-04-11
### Added
- SEO meta tags (Open Graph, Twitter Card, description, keywords)
- `robots.txt` and `sitemap.xml` for Google indexing
- GitHub Pages deployment workflow (auto-deploys `src/` on push)
- Site is live at https://korokmu.github.io/rapid-kl-live-status-tracker/
- GitHub repo topics for discoverability

### Fixed
- XSS vulnerability in comment rendering (added `escapeHTML()` sanitizer)

### Security
- Blocked `SESSION_REPORT.md`, `test_connection.html`, and `scripts/*.sql` from public repo

## [0.2.0] - 2026-04-09
### Added
- Phase 1 (MVP) frontend: station selector, live status card, report form, auth modal, live feed
- Phase 1.5: Quick category buttons (Technical, Crowd, Weather, Facility)
- Supabase Auth integration (email login/signup)
- Real-time updates via Supabase Realtime
- Nightly export script (`scripts/nightly_export.py`)
- GitHub Actions workflow for nightly cleanup (`nightly.yml`)
- Verification system: "Still Happening" and "Resolved" buttons

## [0.1.0] - 2026-04-08
### Added
- Initial project setup
- Project documentation: README, architecture, database schema, privacy policy, terms of service
- Defined tech stack: GitHub Pages + Supabase + GitHub Actions
