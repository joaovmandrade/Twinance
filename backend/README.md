# Twinance Backend API

REST API for the Twinance mobile app. Built with Express + TypeScript + Supabase.

---

## Stack

- **Node.js 20+** + Express 4
- **TypeScript 5** — strict mode, compiled to `dist/`
- **Supabase** — PostgreSQL database + JWT auth
- **Security** — Helmet, CORS, rate limiting (100 req/15 min)
- **Logging** — Morgan (`dev` in development, `combined` in production)

---

## Architecture

```
src/
├── config/
│   ├── env.ts          # Env validation + typed constants
│   └── cors.ts         # CORS config for Expo/iOS/Android/Web
├── middleware/
│   ├── auth.ts         # JWT auth via Supabase
│   ├── errorHandler.ts # Global error handler + AppError class
│   └── rateLimiter.ts  # express-rate-limit (100 req/15 min)
├── routes/
│   ├── index.ts        # Main router + /health endpoint
│   ├── couples.ts
│   ├── expenses.ts
│   └── categories.ts
├── controllers/
│   ├── meController.ts
│   ├── coupleController.ts
│   ├── expenseController.ts
│   └── categoryController.ts
├── services/
│   └── supabase.ts     # Supabase client (service role)
├── types/
│   └── index.ts        # AuthRequest interface
├── app.ts              # Express app setup
└── server.ts           # Entry point + crash protection
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default: 3001) | Port to listen on |
| `NODE_ENV` | No (default: development) | `development` or `production` |
| `SUPABASE_URL` | **Yes** | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Supabase service role key (admin) |
| `FRONTEND_URL` | No (default: `*`) | Allowed CORS origin(s), comma-separated |

```bash
cp .env.example .env
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled production server |
| `npm run type-check` | Type-check without emitting files |
| `npm run lint` | Run ESLint on `src/` |

---

## Running locally

```bash
cd backend
cp .env.example .env   # fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev
```

The server starts at `http://localhost:3001`. Confirm with:

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "uptime": 3,
  "timestamp": "2026-01-01T00:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

---

## API Endpoints

All routes except `/api/health` require `Authorization: Bearer <supabase_jwt>`.

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/me` | Current user profile (upsert on first call) |
| GET | `/api/couples/mine` | Get user's couple + partner info |
| POST | `/api/couples` | Create a new couple |
| POST | `/api/couples/join` | Join a couple by invite code |
| GET | `/api/expenses` | List couple's expenses |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense (owner only) |
| DELETE | `/api/expenses/:id` | Delete expense (owner only) |
| GET | `/api/categories` | List system + user categories |

---

## Connecting to the Mobile App

The app (React Native + Expo) must send the Supabase JWT token in every authenticated request:

```ts
const session = await supabase.auth.getSession()
const token = session.data.session?.access_token

fetch(`${API_URL}/api/expenses`, {
  headers: { Authorization: `Bearer ${token}` },
})
```

Set `API_URL` in the Expo app to the deployed backend URL (Railway/Render).

---

## Supabase Setup

This backend uses the **service role key** to bypass Row Level Security for server-side operations. The JWT tokens issued by Supabase Auth are validated server-side via `supabase.auth.getUser(token)`.

Required tables: `profiles`, `couples`, `couple_members`, `expenses`, `categories`.

---

## Deploy

### Railway

1. Create a new project → Deploy from GitHub
2. Set environment variables in the Railway dashboard
3. Railway auto-detects Node.js. Set:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`

### Render

1. New Web Service → Connect repository → select `backend/` as root dir
2. Set:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
3. Add environment variables in the Render dashboard

### Required env vars for production

```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
FRONTEND_URL=https://your-expo-web-app.vercel.app
```

> Tip: `FRONTEND_URL` accepts comma-separated origins.
> Native iOS/Android apps don't need to be listed — they don't send `Origin` headers.
