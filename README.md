# PrivateChat — Anonymous Group Chat

PrivateChat is a full‑stack chat application for private groups with anonymous identities. Admins create groups; users join via codes and chat in real time. The app enforces safety with reporting, blocking, and automatic deletion of messages.

## Tech Stack
- Frontend: `Next.js 16`, `React 19`, `TypeScript`, `TailwindCSS`
- Real‑time: `Socket.IO`
- Backend: `Node.js`, `Express`, `Mongoose` (MongoDB), `JWT`, `bcryptjs`
- Dev tools: `nodemon`, ESLint

## Features
- Anonymous group chat using per‑group `anonId` aliases
- Admin group management: create groups with unique codes
- User group membership: join groups via code and persist memberships
- Authentication: backend‑only JWT login/signup
- Real‑time messaging: Socket.IO with authenticated connections
- Auto‑delete messages: messages expire after 14 days automatically
- Abuse controls:
  - Report user/admin (by message’s `anonId`); after 3 reports they are permanently banned from chats
  - Block user/admin (per‑user permanent block); blocked sender’s messages are hidden in REST responses and real‑time delivery
- Multi‑account testing: session‑scoped auth enables different accounts per browser tab
- CORS/Ports: frontend on `http://localhost:5000`, backend on `http://localhost:3000` with strict origin matching

## Environment Variables

Backend (`private-chat-app-backend/.env`):
- `PORT` — backend port, default `3000`
- `MONGODB_URI` — Mongo connection string
- `CORS_ORIGIN` — allowed origins (comma‑separated), e.g. `http://localhost:5000`
- `ACCESS_TOKEN_SECRET` — JWT secret for access tokens
- `REFRESH_TOKEN_SECRET` — JWT secret for refresh tokens
- `ACCESS_TOKEN_EXPIRY` — access token expiry, e.g. `7d`
- `REFRESH_TOKEN_EXPIRY` — refresh token expiry, e.g. `10d`

Frontend (`private-chat-app/.env` — optional):
- `NEXT_PUBLIC_API_URL` — REST base URL, default `http://localhost:3000/api`
- `NEXT_PUBLIC_SOCKET_URL` — Socket.IO URL, default `http://localhost:3000`

## Setup
1. Install Node.js (v18+ recommended)
2. Create the backend `.env` in `private-chat-app-backend` with the variables above
3. (Optional) Create the frontend `.env` in `private-chat-app` for custom URLs
4. Install dependencies:
   - Backend: `npm install` in `private-chat-app-backend`
   - Frontend: `npm install` in `private-chat-app`

## Run Instructions
- Start backend (port `3000`):
  - `npm run dev` in `private-chat-app-backend`
  - Health check: `GET http://localhost:3000/api/health`
- Start frontend (port `5000`):
  - `npm run dev` in `private-chat-app`
  - Open `http://localhost:5000`

## Important Behaviors
- Anonymous identities: a user receives a unique `anonId` per group; identity mapping is server‑only
- Message expiry: implemented via TTL index on `Message.timestamp` (14 days)
- Reporting:
  - Endpoint: `POST /api/users/report` with body `{ groupId, anonId }`
  - Increments target user’s `reportCount`; bans at `>= 3`
- Blocking:
  - Endpoint: `POST /api/users/block` with body `{ groupId, anonId }`
  - Permanently blocks the target for the blocker; their messages are filtered from REST and socket delivery
- Bans: banned users are denied access to JWT‑protected routes and Socket.IO connections
- User group persistence: users’ joined groups are listed under “Your Groups” and remain after logout/login
- Multi‑tab accounts: tokens are stored in `sessionStorage` for tab‑level isolation; each tab can log in as a different account

## API Overview (selected)
- Auth: `POST /api/auth/signup`, `POST /api/auth/login`
- Groups:
  - Admin: `POST /api/groups/create`, `GET /api/groups`
  - User: `POST /api/groups/join/:code`, `GET /api/groups/my`, `GET /api/groups/:id`
- Messages: `GET /api/groups/:groupId/messages`, `POST /api/groups/:groupId/messages`
- Abuse: `POST /api/users/report`, `POST /api/users/block`

## Notes
- CORS must match the frontend origin; set `CORS_ORIGIN=http://localhost:5000`
- Do not use `*` for `CORS_ORIGIN` when `credentials: true`
- Default ports: backend `3000`, frontend `5000`