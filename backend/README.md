# News API

A production-ready RESTful API where Authors publish articles and Readers consume them, featuring an analytics engine that tracks engagement and processes daily reports.

## Tech Stack

| Layer | Technology | |
|-------|-----------|-----------|
| Runtime | Node.js + TypeScript |
| Framework | Express.js | 
| Database | PostgreSQL |
| ORM | Sequelize |
| Auth | Argon2 + JWT |
| Validation | Zod |
| Job Queue | pg-boss (PostgreSQL-backed) |
| Testing | Vitest + Supertest |

## Setup

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14

### Installation

```bash
git clone <repo-url>
cd new-backend
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (`development`, `production`, `test`) | `development` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | — |
| `DB_USER` | Database user | — |
| `DB_PASSWORD` | Database password | — |
| `JWT_SECRET` | Secret for signing JWTs (min 16 chars) | — |
| `JWT_EXPIRES_IN` | Token expiry (e.g., `24h`, `7d`, `3600s`) | `24h` |

### Create Database

```bash
createdb news_api
```

### Run Migrations

```bash
npm run db:migrate
```

To rollback:

```bash
npm run db:migrate:undo      # undo last migration
npm run db:migrate:undo:all  # undo all migrations
```

### Run

```bash
# Development (auto-reload)
npm run dev

# Production
npm run build
npm start
```

### Test

```bash
npm test
```

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | None | Register a new user (author or reader) |
| POST | `/auth/login` | None | Login and receive JWT |

### Articles (Author)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/articles` | Author | Create a new article |
| GET | `/articles/me` | Author | List own articles (drafts + published) |
| PUT | `/articles/:id` | Author | Update own article |
| DELETE | `/articles/:id` | Author | Soft-delete own article |

### Articles (Public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/articles` | None | Public feed (published, not deleted) |
| GET | `/articles/:id` | Optional | View article + track read |

**Query parameters for `GET /articles`:**
- `category` — exact match (e.g., `?category=Tech`)
- `author` — partial name match (e.g., `?author=John`)
- `q` — keyword search in title (e.g., `?q=election`)
- `page` — page number (default: 1)
- `size` — page size (default: 10, max: 100)

### Analytics

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/author/dashboard` | Author | Paginated articles with total view counts |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |

## Architecture

```
src/
├── config/          # Environment, database, queue configuration
├── middleware/       # Auth, RBAC, validation, rate limiting, error handling
├── models/          # Sequelize model definitions + associations
├── modules/
│   ├── auth/        # Signup, login (Argon2 + JWT)
│   ├── articles/    # CRUD + public feed + read tracking
│   └── analytics/   # Author dashboard
├── jobs/            # pg-boss daily aggregation job
├── shared/          # Response builders, error classes, types
├── app.ts           # Express app assembly
└── server.ts        # Bootstrap (DB connect, model sync, worker start)
```

## Key Design Decisions

- **Soft Delete**: Articles use Sequelize's `paranoid: true`, which auto-filters deleted records on all standard queries. Public endpoints never expose deleted content.
- **Non-blocking Read Tracking**: `ReadLog` entries are created fire-and-forget — the article response is never delayed by logging.
- **Anti-Spam Rate Limiting**: A sliding window (30s per user/IP per article) prevents inflated view counts from page refreshes.
- **Daily Analytics Aggregation**: A pg-boss cron job runs at midnight UTC, summing raw ReadLog entries into DailyAnalytics for efficient dashboard queries. Uses the existing PostgreSQL database — no extra infrastructure required.
- **Standardized Responses**: All endpoints return a consistent `{ Success, Message, Object, Errors }` structure (with pagination fields where applicable).
