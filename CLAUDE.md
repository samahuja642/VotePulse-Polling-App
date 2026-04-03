# CLAUDE.md — VotePulse (Full-Stack Polling App)

## Stack
Frontend: React (Vite) + Tailwind CSS + React Router v6 + Recharts + Socket.io-client
Backend: Node.js + Express + raw SQL via `pg` (NO ORM) + Zod + Socket.io
Database: PostgreSQL | Auth: JWT (httpOnly cookie refresh + in-memory access token) + bcrypt

## Folder Structure
```
votepulse/
├── client/src/
│   ├── components/          # ui/, layout/, charts/
│   ├── pages/               # Home, Login, Register, CreatePoll, PollDetail, Dashboard, Explore, NotFound
│   ├── context/             # AuthContext
│   ├── hooks/               # useAuth, usePoll, useSocket
│   └── lib/                 # api.js (axios instance), socket.js, validators.js
├── server/src/
│   ├── config/              # db.js, env.js
│   ├── middleware/          # auth.js, errorHandler.js, rateLimiter.js, validate.js
│   ├── routes/              # auth.routes.js, polls.routes.js, votes.routes.js
│   ├── controllers/         # HTTP layer — reads req, calls service, sends res
│   ├── services/            # Business logic — hashing, tokens, validation rules
│   ├── db/queries/          # Raw SQL data-access functions
│   ├── db/migrations/       # Numbered .sql files
│   ├── validators/          # Zod schemas
│   └── socket/              # socket.js
```

## Database Tables
- **users**: id (UUID PK), username (unique), email (unique), password, created_at
- **polls**: id (UUID PK), creator_id (FK→users), title, description, is_public, multi_vote, status ('open'|'closed'), expires_at, created_at
- **options**: id (UUID PK), poll_id (FK→polls), text, position
- **votes**: id (UUID PK), poll_id (FK→polls), option_id (FK→options), user_id (FK→users, nullable), guest_token, created_at — UNIQUE(poll_id, user_id), UNIQUE(poll_id, guest_token)

## API Routes
```
POST   /api/auth/register          # Create user
POST   /api/auth/login             # Login → JWT
GET    /api/auth/me                # Current user (auth required)
POST   /api/polls                  # Create poll (auth)
GET    /api/polls/public           # List public polls (?page, ?limit, ?sort, ?search)
GET    /api/polls/me               # User's polls (auth)
GET    /api/polls/:id              # Poll detail + options
PATCH  /api/polls/:id              # Close/reopen (owner only)
DELETE /api/polls/:id              # Delete poll (owner only)
POST   /api/polls/:id/vote         # Cast vote (auth optional for guest polls)
GET    /api/polls/:id/results      # Aggregated vote counts
```

## Coding Rules
- ES modules, async/await, const-first, no var
- Raw parameterized SQL (`$1`, `$2`) — never string interpolation in queries
- Multi-table writes wrapped in BEGIN/COMMIT/ROLLBACK transactions
- Validate ALL inputs with Zod before DB access
- Consistent API response: `{ success: true, data }` or `{ success: false, error: { message, code } }`
- Correct HTTP codes: 200, 201, 400, 401, 403, 404, 409, 422, 429, 500
- Never return raw DB errors or stack traces to client
- Specify columns explicitly — no `SELECT *`
- Frontend: functional components, React Hook Form + Zod, every page handles loading/error/data states
- Toast notifications for all user actions (react-hot-toast)
- Mobile-first responsive design with Tailwind breakpoints

## Auth Flow
Register/Login → bcrypt hash (12 rounds) → JWT access (15min, in-memory) + refresh (7d, httpOnly cookie) → auth middleware reads Bearer token → attaches req.user → refresh endpoint rotates both tokens

### Frontend Auth Architecture
- `AuthContext` provides `{ user, loading, login, logout }` — wraps app in `main.jsx`
- `ProtectedRoute` is a layout route (`<Outlet />`) in `App.jsx` — nest auth-required routes under it
- Silent refresh: axios response interceptor catches 401s, calls `POST /auth/refresh` (deduped via shared promise), retries original request. Skips `/auth/refresh` and `/auth/login` to avoid loops.

## Real-Time
Socket.io room per poll (`poll:<id>`). Server emits `vote:new` with updated counts on each vote. Frontend joins room on PollDetail mount, updates Recharts chart reactively. Handle disconnect/reconnect.

## Vote Deduplication
- Authenticated: UNIQUE(poll_id, user_id) constraint — catch conflict error
- Guest: UUID cookie token + UNIQUE(poll_id, guest_token)
- Always check poll status=open AND expires_at > NOW() before accepting

## Build Order
1. Project setup — repo, folders, Express health-check, React shell, DB connection
2. Auth — user table, register/login API, JWT middleware, frontend auth pages + context
3. Poll creation — polls/options tables, create API (transactional), create form
4. Voting — votes table, vote endpoint, poll detail page, guest voting
5. Results — results API, Recharts bar chart, Socket.io real-time
6. Dashboard — user's polls CRUD, close/reopen/delete
7. Explore — public polls paginated/sorted/searchable, explore page
8. Polish — sanitization (xss), rate limiting, global error handler, loading states, toasts, 404
9. Testing — Vitest backend, React Testing Library frontend
10. Deploy — backend Railway/Render, frontend Vercel, GitHub Actions CI/CD

## Dependencies
Server: express, pg, bcryptjs, jsonwebtoken, cookie-parser, cors, zod, xss, express-rate-limit, socket.io, dotenv
Client: react, react-dom, react-router-dom, axios, recharts, react-hook-form, @hookform/resolvers, zod, socket.io-client, react-hot-toast, lucide-react, tailwindcss
Dev: nodemon, vitest, @testing-library/react, eslint, prettier

## Theming & Styling
Tailwind v4 CSS-first config in `client/src/index.css` — no `tailwind.config.js`.
- Fonts: `font-sans` (Inter), `font-mono` (JetBrains Mono)
- Colors: `primary` (indigo), `accent` (teal), `danger` (red), `success` (green), `warning` (amber) — all 50–950 scales
- Semantic vars: `--bg`, `--bg-secondary`, `--bg-tertiary`, `--surface`, `--surface-hover`, `--border`, `--border-hover`, `--text`, `--text-secondary`, `--text-tertiary`, `--ring` — auto-switch light/dark
- Dark mode: system default; `.dark` on `<html>` forces dark, `.light` forces light
- Apply via: `bg-primary-600` for brand colors, `style={{ color: 'var(--text-secondary)' }}` for semantic tokens
- Cards: `rounded-lg shadow-sm p-4`/`p-6` | Buttons/inputs: `rounded-md` | Focus: `focus:ring-2 focus:ring-[var(--ring)]`
- Mobile-first with `sm:`/`md:`/`lg:` breakpoints, `transition-colors` on interactive elements

## Migrations
- Files: `server/src/db/migrations/NNN_description.sql` — sequential, each run in a transaction
- Runner (`server/src/db/migrate.js`) auto-runs before `npm run dev` / `npm start` / `npm run migrate` — tracks applied files in `migrations` table, skips already-applied

## Don'ts
No ORM. No localStorage for tokens. No skipping validation. No hardcoded secrets. No unhandled expired polls.