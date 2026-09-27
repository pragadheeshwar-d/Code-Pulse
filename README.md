# CodeTrack — Personal Coding Analytics Dashboard

> **Production-ready Coding Progress Tracker** aggregating, normalizing, and analyzing personal coding activity across **LeetCode**, **CodeChef**, **GeeksforGeeks**, and **Codeforces**.

---

## 1. Project Overview

**CodeTrack** is a personal analytics dashboard for competitive programmers and software engineers. By connecting public platform usernames, CodeTrack continuously collects real activity data, normalizes it into a relational schema, records historical snapshots on every synchronization, and calculates streaks, progress, topic distributions, difficulty breakdowns, contest ratings, and factual insights.

### Absolute Rule — No Mock Data in Production
* **Zero Hardcoded Numbers:** No hardcoded usernames, solved counts, ratings, ranks, or chart figures exist in the codebase.
* **Pure Mathematical Derivation:** When accounts are unlinked, the application gracefully renders empty states (`—`, empty charts, helpful connection prompts). Every displayed metric is either directly collected from real platform sources or mathematically derived from stored historical records.
* **Historical Snapshots:** Every synchronization creates immutable timestamped records, enabling genuine time-series growth tracking across 7 days, 30 days, 3 months, 6 months, 1 year, and all-time.

---

## 2. Platform Collectors & Data Sources

Each platform has an independent collector implementing a standardized interface (`fetchProfile`, `validateUsername`):

| Platform | Data Source | Metrics Collected |
| :--- | :--- | :--- |
| **LeetCode** | Official Public GraphQL Endpoint (`https://leetcode.com/graphql`) | Total Solved, Easy/Medium/Hard Breakdown, Submissions, Calendar Streak, Total Active Days, Contest Rating, Global Ranking, Recent Accepted Submissions, DSA Skill Tags |
| **Codeforces** | Official REST API (`https://codeforces.com/api/*`) | User Info, Max Rating, Current Rating, Rank Title, Submissions History, Problem Tags (Topics), Difficulty Ratings, Contest History & Rating Deltas |
| **CodeChef** | Public Profile Scraper (`https://www.codechef.com/users/*`) | Current Rating, Stars, Division, Global Rank, Total Solved Problems, Contest Rating History (`var all_rating`), Recent Problems |
| **GeeksforGeeks** | Next.js Streaming Payload (`https://www.geeksforgeeks.org/profile/*`) | Total Solved Problems, Coding Score, Institute Rank, Problem of the Day (POTD) Streaks, Correct Submissions Count |

---

## 3. System Architecture & Data Flow

```
                      +---------------------------------------+
                      |         Application User              |
                      +-------------------+-------------------+
                                          |
                        Enters Platform Usernames
                                          v
                      +---------------------------------------+
                      |       Platform Collectors             |
                      |  (LeetCode, CF, CodeChef, GFG)        |
                      +-------------------+-------------------+
                                          |
                             Real Platform Payloads
                                          v
                      +---------------------------------------+
                      |    Normalization & Validation Layer   |
                      |        (Zod Schemas & Mappers)        |
                      +-------------------+-------------------+
                                          |
                               Relational Persistence
                                          v
                      +---------------------------------------+
                      |      SQLite Database Engine           |
                      |  (node:sqlite WAL Mode + Snapshots)   |
                      +-------------------+-------------------+
                                          |
                             Derived Analytics Engine
                                          v
                      +---------------------------------------+
                      |      REST API Layer (Express)         |
                      |   /api/stats, /api/activity, etc.     |
                      +-------------------+-------------------+
                                          |
                              JSON Response Payloads
                                          v
                      +---------------------------------------+
                      |      React Dashboard Frontend         |
                      |   (Vite, Tailwind CSS, Recharts)      |
                      +---------------------------------------+
```

---

## 4. Database Entities

The relational database uses Node's standard `node:sqlite` engine configured with Write-Ahead Logging (WAL) and foreign keys:

* `users`: Application user profile (Name, Headline, Email, Timestamps)
* `platform_accounts`: Connected platform credentials, profile links, connection status, last synced timestamps
* `problems`: Master directory of problems solved across platforms (External ID, Slug, URL, Difficulty, Topic)
* `user_problems`: Relational mapping of user solutions and first-seen timestamps
* `stat_snapshots`: Mandatory timestamped snapshots created on every sync (Solved counts, Ratings, Streaks, Submissions)
* `activity_records`: Daily activity log (`activity_date`, `problems_solved`, `submissions`, `rating_change`)
* `goals`: Measurable targets with mathematical progress calculation (`actual / target * 100`)
* `contests`: Contest directories (LeetCode Weekly, Codeforces Rounds, CodeChef Cook-Offs)
* `contest_results`: User contest performance (Ranks, Old Rating, New Rating, Rating Deltas)
* `sync_logs`: Structured synchronization audit log (Started at, Completed at, Records processed, Status, Error message)
* `user_settings`: Auto-sync intervals (`6h`, `12h`, `24h`, `manual`), theme preferences

---

## 5. Technology Stack

* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts
* **Backend:** Node.js v22+, Express, TypeScript, Zod, node-cron
* **Database:** SQLite via built-in `node:sqlite` (DatabaseSync, WAL mode, zero external binary compilation dependencies)
* **Testing:** Vitest (Unit tests for streak calculation, goal progress, difficulty aggregations, and integration tests for API endpoints)

---

## 6. Installation & Local Setup

### Prerequisites
* Node.js v22.5.0 or later (Node 24 supported)
* npm v10+

### Step 1: Clone and install dependencies
```bash
git clone <repository_url>
cd "Progress Tracker"

# Install root, backend, and frontend dependencies
npm run install:all
```

### Step 2: Start the application
```bash
# Starts both Backend (port 5000) and Frontend (port 5173) concurrently
npm run dev
```

The frontend will be accessible at: `http://localhost:5173`
The backend API will be accessible at: `http://localhost:5000/api`

---

## 7. Running Tests

Run the test suite via Vitest:

```bash
npm run test
```

### Test Coverage includes:
1. **Streak Calculation Engine:** Verifies consecutive date sequences, streak preservation, and streak resets when inactive.
2. **Dynamic Goal Engine:** Verifies mathematical calculation of progress percentages (`progress = current / target * 100`) and automatic status transitions (`active` -> `completed` / `expired`).
3. **Difficulty Aggregation:** Verifies proportional calculations across multi-platform snapshots.
4. **Empty State Integrity:** Ensures `has_data: false`, null values, and clean empty states when no accounts are connected.
5. **REST API Endpoints:** Validates health checks, platform connectivity, input validation, and goal CRUD operations.

---

## 8. Automatic & Manual Synchronization

* **Sync Now:** Header button triggers an isolated sequential sync across all connected platforms. If one platform's public profile is momentarily unreachable, the remaining platforms proceed uninterrupted.
* **Scheduled Auto-Sync:** A background cron runner periodically triggers synchronization according to user preferences (`6h`, `12h`, `24h`, or `manual`).
* **Concurrency Locking:** In-memory job locks ensure duplicate sync requests for the same user and platform do not run concurrently.

---

## 9. Security & Privacy

* **Zero Password Requirement:** CodeTrack only requires public handles/usernames. Passwords, session cookies, and private tokens are never requested or stored.
* **Safe Error Handling:** Platform failures are logged with sanitized error messages.
* **Input Sanitization:** All incoming requests are strictly validated using Zod schemas before touching the database.
