# CodePulse REST API Specification

Base URL: `/api` (or custom backend host `https://api.yourdomain.com/api`)

---

## 1. System Health

### `GET /health` / `GET /api/health`
Returns runtime status, uptime, and server environment.
```json
{
  "status": "ok",
  "service": "codepulse-backend",
  "timestamp": "2026-09-28T12:55:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production"
}
```

---

## 2. Authentication

### `POST /api/auth/register`
Creates a new user profile and returns a JWT Bearer token.
* **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "StrongPassword123!",
    "headline": "Full-Stack Engineer"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "user": {
        "id": "usr_9f82...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "headline": "Full-Stack Engineer"
      }
    }
  }
  ```

### `POST /api/auth/login`
Authenticates with email and password.
* **Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "StrongPassword123!"
  }
  ```

### `GET /api/auth/me`
Resolves current user from `Authorization: Bearer <token>` header.

### `POST /api/auth/logout`
Invalidates client session.

---

## 3. Profile & User Settings

### `GET /api/profile` / `GET /api/users`
Returns active user profile and preferences.

### `PATCH /api/profile`
Updates profile information or theme/auto-sync preferences.

---

## 4. Platform Connections & Sync

### `GET /api/platforms`
Returns all supported platforms (LeetCode, CodeChef, GeeksforGeeks, Codeforces) with their connection status, ratings, and stats.

### `POST /api/platforms/connect`
Connects a platform using the public username / handle:
```json
{
  "platform": "leetcode",
  "username": "pragalbhax"
}
```

### `DELETE /api/platforms/:platform`
Disconnects a platform account and cascades snapshot cleanup.

### `POST /api/sync`
Triggers synchronization across all connected platforms.

### `POST /api/sync/:platform`
Triggers sync for a single platform (e.g. `POST /api/sync/codechef`).

---

## 5. Analytics, Stats & History

### `GET /api/stats`
Returns aggregated overview: total problems solved, active days, current streak, longest streak, and total submissions.

### `GET /api/stats/history?period=30d`
Continuous time-scale progression data for chart visualizations (`7d`, `30d`, `3m`, `6m`, `1y`, `all`).

### `GET /api/problems?limit=100`
Returns verified problem solves across platforms with titles, difficulty, topic tags, and solve dates.

### `GET /api/activity?platform=all`
Returns daily submission frequency for GitHub-style heatmap.

### `GET /api/analytics`
Returns unified difficulty distribution (Easy, Medium, Hard), DSA topic frequency, and smart skill recommendations.

---

## 6. Dedicated Domain Endpoints

* `GET /api/streaks` - Direct current/longest streak metrics
* `GET /api/progress` - Growth history & timeline
* `GET /api/leetcode` - LeetCode profile statistics
* `GET /api/codechef` - CodeChef profile statistics
* `GET /api/gfg` - GeeksforGeeks profile statistics
* `GET /api/codeforces` - Codeforces profile statistics
* `GET /api/github` - Public GitHub profile activity & OAuth status
