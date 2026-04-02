# VotePulse — Project Structure & Practices

## Directory Layout

```
polling-app/
├── client/                      # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── ui/              # Reusable primitives (Button, Input, Modal, Card)
│       │   ├── layout/          # Page wrappers (Header, Footer, Sidebar, PageLayout)
│       │   └── charts/          # Recharts wrappers for poll result visualizations
│       ├── pages/               # One file per route — each handles loading/error/data states
│       ├── context/             # React contexts (AuthContext)
│       ├── hooks/               # Custom hooks (useAuth, usePoll, useSocket)
│       └── lib/                 # Non-React utilities (api.js, socket.js, validators.js)
│
├── server/                      # Express backend
│   └── src/
│       ├── config/              # App configuration (db.js, env.js)
│       ├── middleware/          # Express middleware (auth, errorHandler, rateLimiter, validate)
│       ├── routes/              # Route definitions — thin, delegates to controllers
│       ├── controllers/         # Request handlers — validates, calls DB, returns response
│       ├── validators/          # Zod schemas shared across routes
│       ├── db/migrations/       # Numbered SQL migration files (001_create_users.sql, etc.)
│       └── socket/              # Socket.io event handlers
│
└── docs/                        # Project documentation
```

## Naming Conventions

| What | Pattern | Example |
|------|---------|---------|
| Route files | `<resource>.routes.js` | `auth.routes.js` |
| Controllers | `<resource>.controller.js` | `polls.controller.js` |
| Middleware | `<name>.js` (descriptive) | `errorHandler.js` |
| React pages | `PascalCase.jsx` | `PollDetail.jsx` |
| React components | `PascalCase.jsx` | `VoteChart.jsx` |
| Hooks | `use<Name>.js` | `useAuth.js` |
| Migrations | `NNN_<description>.sql` | `001_create_users.sql` |
| Validators | `<resource>.validator.js` | `auth.validator.js` |

## Module System

Both `client/` and `server/` use **ES modules** (`"type": "module"` in `package.json`).

- Use `import`/`export` everywhere — no `require()`
- Server-side imports must include `.js` extensions: `import { env } from './config/env.js'`
- Use `const` by default, `let` when reassignment is needed, never `var`
- Always `async`/`await` — no raw `.then()` chains

## Backend Patterns

### Request Flow
```
Client Request
  → Express middleware (cors, json, cookieParser, rateLimiter)
  → Route definition (routes/)
  → Validation middleware (Zod schema via validate.js)
  → Controller (controllers/)
  → Raw SQL query via pg Pool
  → Response: { success: true, data } or { success: false, error: { message, code } }
```

### SQL Rules
- Always use parameterized queries (`$1`, `$2`) — never string interpolation
- Specify columns explicitly — no `SELECT *`
- Multi-table writes must use transactions (`BEGIN`/`COMMIT`/`ROLLBACK`)
- Never expose raw database errors to the client

### API Response Shape
Every endpoint returns one of:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "message": "...", "code": "ERROR_CODE" } }
```

### HTTP Status Codes
| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (valid token, insufficient permission) |
| 404 | Resource not found |
| 409 | Conflict (duplicate vote, duplicate user) |
| 422 | Validation error (Zod failure) |
| 429 | Rate limited |
| 500 | Internal server error |

### Validation
All user input is validated with **Zod** before reaching the database. The `validate(schema)` middleware parses `req.body` and attaches cleaned data to `req.validatedBody`.

## Frontend Patterns

### Component Hierarchy
- **Pages** — route-level components, manage data fetching and state
- **Layout components** — structural wrappers (header, footer, page shell)
- **UI components** — stateless, reusable primitives (buttons, inputs, cards)
- **Chart components** — Recharts wrappers specifically for poll visualizations

### State Management
- **Auth state** — React context (`AuthContext`) with in-memory JWT access token
- **Server state** — fetched per-page via axios; no global cache (keep it simple)
- **Real-time state** — Socket.io updates merged into local component state

### Forms
All forms use **React Hook Form** with **Zod** resolvers. Validation schemas in `lib/validators.js` are shared where possible with the server.

### Styling
- **Tailwind CSS** with mobile-first responsive breakpoints
- Use Tailwind utility classes directly — no separate CSS files per component
- Design for mobile first, add `sm:`, `md:`, `lg:` breakpoints for larger screens

### User Feedback
- **react-hot-toast** for all user-facing notifications (success, error, info)
- Every page handles three states: loading, error, and data

## Auth Flow
1. User registers or logs in
2. Server returns JWT access token (15min) in response body + refresh token (7d) in httpOnly cookie
3. Frontend stores access token **in memory only** (never localStorage)
4. `api.js` axios interceptor attaches `Authorization: Bearer <token>` to every request
5. On 401, frontend uses refresh cookie to get a new access token
6. Auth middleware on server verifies Bearer token and attaches `req.user`

## Migration Strategy
- Migrations are plain `.sql` files in `server/src/db/migrations/`
- Numbered sequentially: `001_`, `002_`, etc.
- Each migration is run manually during development: `psql -d votepulse -f <file>`
- Migrations are idempotent where possible (use `IF NOT EXISTS`)
