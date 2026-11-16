# StudyRoom

A full-stack chat app for study groups. Users sign up, create or join study rooms, and message each other inside a room.

- **Client:** React + Vite (`client/`)
- **Server:** Express + MongoDB/Mongoose, JWT auth, Socket.IO (`server/`)

**Team:** Clara Abi Nader, Angelina Abboud, William Bitar (USJ ESIB, Web Programming capstone)

## Live demo

- **App:** <https://studyroomlb.netlify.app>
- **API:** <https://studyroom-ar14.onrender.com/api> (health check: <https://studyroom-ar14.onrender.com/api/health>)

The API runs on Render's free plan, which sleeps after 15 minutes without traffic. The first request after that can take about a minute while it wakes up.

## Features

- **Accounts:** sign up, log in and log out. Passwords are stored as bcrypt hashes; logging in returns a JWT that lasts 1 hour. You stay logged in after a page refresh, and an expired session logs you out with a message.
- **Study rooms:** see every room or only yours, create a room, and edit or delete the rooms you created.
- **Real-time chat:** messages appear instantly for everyone in the room, with no refresh (Socket.IO). You can delete your own messages, and they disappear for everyone.
- **Protected API:** every room and message route needs a valid token (401 otherwise); only the creator can change a room and only the sender can delete a message (403); every input is validated (400).
- **Security:** helmet headers, CORS limited to our client, rate limiting (5 login attempts per 15 minutes), secrets kept in `.env` files that are never committed.
- **Responsive design:** works on phones and desktops, in light and dark mode.
- **Automated tests:** 6 API tests on the server and 7 tests on the client.

## Tech stack

| Layer | Tools |
|---|---|
| Front end | React 19, Vite, React Router, socket.io-client, lucide-react icons |
| Back end | Node.js, Express 5, Socket.IO |
| Database | MongoDB Atlas, with Mongoose models |
| Authentication | bcrypt (password hashing), jsonwebtoken (JWT) |
| Validation and security | zod, helmet, cors, express-rate-limit |
| Testing | Vitest, supertest, React Testing Library, jsdom |
| Deployment | Netlify (client), Render (API) |

## Architecture

Two apps that talk over HTTP, plus one live connection for chat:

```mermaid
flowchart LR
    subgraph Browser["Client (React, in the browser)"]
        P[Pages: Auth, RoomsPage, RoomPage] --> A[api.js: adds the JWT]
        P --> S[socket.io-client]
    end
    subgraph Server["Server (Express on Node.js)"]
        M[app.js: helmet, cors, json, rate limit] --> G[requireAuth + validate]
        G --> R[routes: auth, rooms, messages]
        IO[socket.js: Socket.IO, checks the JWT]
    end
    A -- "REST: HTTP + JSON + Bearer token" --> M
    S <-- "live events per room" --> IO
    R -- "Mongoose" --> DB[(MongoDB Atlas)]
    R -- "message:new / message:deleted" --> IO
```

**What happens when you send a message:**

1. `RoomPage` sends `POST /api/rooms/:roomId/messages`, and `api.js` adds the `Authorization: Bearer <token>` header.
2. On the server, the request passes `requireAuth` (who are you?), `validId` (is the room id valid?), a check that the room exists, and `validate` (is the message valid?).
3. The route saves the message with Mongoose, using the token's user as the sender.
4. The route emits `message:new` to that room through Socket.IO, and every browser that has the room open adds the message straight away.

`server/app.js` holds the middleware and routes; `server/server.js` connects to MongoDB, starts listening, and starts Socket.IO on the same port. Keeping them apart lets the tests use the app without a database.

## Prerequisites

- Node.js 20 or newer
- A MongoDB database. A free MongoDB Atlas cluster works, or a local `mongod`.

## Setup

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd Final-project-main

   cd server && npm install
   cd ../client && npm install
   ```

2. **Configure the server environment**

   ```bash
   cd server
   cp .env.example .env
   ```

   Then fill in `server/.env`:

   | Variable        | What to put there                                                                                       |
   |-----------------|---------------------------------------------------------------------------------------------------------|
   | `PORT`          | Port for the API. Default `3000`. If you change it, update `VITE_API_URL` in `client/.env` too.          |
   | `MONGODB_URI`   | Your connection string, ending in the database name, e.g. `mongodb+srv://USER:PASS@HOST/studyroom?retryWrites=true&w=majority` |
   | `JWT_SECRET`    | Any long random string. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `CLIENT_ORIGIN` | URL of the client, for CORS. Default `http://localhost:5173`.                                           |

   If you use Atlas, add your IP address under **Network Access**, or the server can't connect.

3. **Configure the client environment**

   ```bash
   cd client
   cp .env.example .env
   ```

   `client/.env` has one variable:

   | Variable       | What to put there                                              |
   |----------------|----------------------------------------------------------------|
   | `VITE_API_URL` | Base URL of the API. Default `http://localhost:3000/api`.      |

   Restart `npm run dev` after changing it. Vite only reads `.env` on startup.

4. **Run both apps** (two terminals)

   ```bash
   # terminal 1
   cd server
   npm run dev      # http://localhost:3000
   ```

   ```bash
   # terminal 2
   cd client
   npm run dev      # http://localhost:5173
   ```

5. **Check it works:** open <http://localhost:3000/api/health>. It should return `{"status":"ok", ...}`. Then open <http://localhost:5173> and register an account.

## Using the app

- **Sign up / log in / log out:** from the login screen and the top bar. You stay logged in after a page refresh.
- **Rooms:** the home page lists every room. Use **New room** to create one. On rooms you created, the ✏️ and 🗑️ buttons edit or delete them. **My rooms** shows only yours.
- **Chat:** click a room to open it. Press Enter to send, Shift+Enter for a new line. New messages from others appear instantly. Hover your own message to delete it.
- The current room is in the URL (`/rooms/<id>`), so refreshing or sharing the link opens the same room.

## API

All routes are under `/api`. Routes marked 🔒 need an `Authorization: Bearer <token>` header. The token comes from register or login.

| Method | Path                           | Description                       |
|--------|--------------------------------|-----------------------------------|
| GET    | `/health`                      | Health check                      |
| POST   | `/auth/register`               | Create an account, returns a JWT  |
| POST   | `/auth/login`                  | Log in, returns a JWT             |
| GET    | `/rooms` 🔒                     | List all study rooms              |
| GET    | `/rooms/mine` 🔒                | List rooms you created            |
| POST   | `/rooms` 🔒                     | Create a study room               |
| GET    | `/rooms/:id` 🔒                 | Get one room                      |
| PUT    | `/rooms/:id` 🔒                 | Update a room (creator only)      |
| DELETE | `/rooms/:id` 🔒                 | Delete a room and its messages (creator only) |
| GET    | `/rooms/:roomId/messages` 🔒    | List messages in a room           |
| POST   | `/rooms/:roomId/messages` 🔒    | Send a message to a room          |
| DELETE | `/rooms/:roomId/messages/:messageId` 🔒 | Delete a message (sender only) |

Errors are always JSON, `{ "error": "..." }`, with a status code that means something:

| Code | When |
|------|------|
| 200 / 201 / 204 | OK / created / deleted |
| 400 | Invalid input, malformed id, or bad JSON |
| 401 | Missing, invalid, or expired token, or wrong email/password at login |
| 403 | Logged in, but it's not your room or message |
| 404 | Room or message doesn't exist |
| 409 | Email or username already used at sign-up |

### Automated tests

Run `npm test` in `server/` (6 API tests with Vitest + supertest, no database needed) and in `client/` (7 tests with Vitest + Testing Library).

### Testing by hand with curl

With the server running, [docs/api-testing.md](docs/api-testing.md) has curl commands for every route, including the check that Bob gets `403` when he tries to edit or delete Alice's room.

## Deployment

| Part | Host | Settings |
|---|---|---|
| API (`server/`) | Render web service, Frankfurt, free plan | Root directory `server`, build `npm install`, start `node server.js` |
| Client (`client/`) | Netlify | Built with `npm run build`, then the `dist` folder is uploaded |
| Database | MongoDB Atlas, Ireland | Network access allows `0.0.0.0/0` so Render can connect |

Environment variables are set in each host's dashboard, never in a committed file:

- **Render:** `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN=https://studyroomlb.netlify.app` (Render sets `PORT` itself)
- **Client build:** `VITE_API_URL=https://studyroom-ar14.onrender.com/api`

**Updating the live site after a merge to `main`:**

1. Render: **Manual Deploy → Deploy latest commit**.
2. Client, from `client/`:

   ```bash
   VITE_API_URL=https://studyroom-ar14.onrender.com/api npm run build
   ```

   Then drag the new `dist` folder onto the site's **Deploys** page on Netlify.

`client/public/_redirects` tells Netlify to serve `index.html` for every URL, so refreshing on `/rooms/<id>` works.

## Project docs

- [Data schema](docs/schema.md): collections, fields, types, and references
- [Wireframes](docs/wireframes.md): main screens and how users move between them

## Project structure

```
client/              React + Vite front end
  public/_redirects  Lets Netlify serve the app on any URL (React Router)
  src/
    App.jsx          Routes: / (rooms list), /rooms/:roomId (chat)
    components/      Auth, RoomsPage, RoomPage, modals (+ ConfirmModal.test.jsx)
    context/         AuthContext (current user + token)
    services/        api.js (fetch wrapper that adds the token)
    utils/           format helpers (+ format.test.js)
server/              Express API
  app.js             Middleware and routes (imported by the tests)
  server.js          Connects to MongoDB, starts the server and Socket.IO
  socket.js          Real-time layer: rooms, message:new, message:deleted
  middleware/        requireAuth, validate
  models/            Mongoose models: User, Room, Message
  routes/            auth, rooms, messages
  tests/             api.test.js (Vitest + supertest)
docs/                Schema, wireframes, curl commands
```
