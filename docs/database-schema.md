# Database Schema

Database: Supabase (PostgreSQL)

---

## Tables

### `users`
Managed by Supabase Auth. Extended with a public profile table.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key — matches Supabase Auth user ID |
| email | text | Stored in Supabase Auth only — not in this table |
| marketing_consent | boolean | `true` if user opted in to future project updates |
| created_at | timestamptz | Account creation time |

---

### `stations`
Static reference table — populated once, not user-editable.

| Column | Type | Notes |
|---|---|---|
| id | serial | Primary key |
| name | text | e.g. "KL Sentral" |
| line | text | e.g. "Kelana Jaya Line" |
| line_code | text | e.g. "KJ" |
| sequence | integer | Station order along the line |

---

### `reports`
One active report per station at any time. New report replaces/resets the current status.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| station_id | integer | FK → stations.id |
| user_id | uuid | FK → users.id (login required) |
| status | text | `smooth`, `slow`, or `interrupted` |
| category | text | `technical`, `crowd`, `weather`, `facility`, or `null` |
| confirmed_count | integer | Number of upvotes/confirmations |
| resolved_count | integer | Number of "Resolved" clicks |
| is_verified | boolean | `true` when confirmed_count >= 5 |
| is_active | boolean | `false` when resolved_count >= 3 or 2hrs passed with no confirm |
| created_at | timestamptz | When the report was submitted |
| last_confirmed_at | timestamptz | Last time someone clicked "Still Happening" |

---

### `comments`
Free-text comments attached to a station (not per-report — station-level thread).

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| station_id | integer | FK → stations.id |
| user_id | uuid | FK → users.id |
| body | text | Comment content (max 280 characters) |
| created_at | timestamptz | When comment was posted |

---

### `upvotes`
Tracks which user confirmed which report. Prevents duplicate upvotes.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| report_id | uuid | FK → reports.id |
| user_id | uuid | FK → users.id |
| created_at | timestamptz | When upvote was submitted |
| UNIQUE | (report_id, user_id) | One upvote per user per report |

---

## Row Level Security (RLS) Policies

All tables have RLS enabled. Summary:

- **Anonymous users**: Can only SELECT (read) from reports, comments, stations
- **Logged-in users**: Can INSERT their own reports/comments/upvotes; can SELECT everything
- **Service role (GitHub Actions only)**: Full access for nightly export and delete

---

## Notes

- User emails are stored in **Supabase Auth only** — not in any of the tables above
- The `marketing_consent` flag in `users` is the only link between a user profile and their email preference
- All tables are purged nightly (except `users` and `stations`) — see [architecture.md](architecture.md)
