# StudyRoom

A full-stack chat app for study groups. Users sign up, create or join study rooms, and message each other inside a room.

- **Client:** React + Vite (`client/`)
- **Server:** Express + MongoDB/Mongoose, JWT auth (`server/`)

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
- **Chat:** click a room to open it. Press Enter to send, Shift+Enter for a new line. New messages from others show up within a few seconds. Hover your own message to delete it.
- The current room is in the URL (`#/rooms/<id>`), so refreshing or sharing the link opens the same room.

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
| 401 | Missing, invalid, or expired token |
| 403 | Logged in, but it's not your room or message |
| 404 | Room or message doesn't exist |

### Testing with curl

With the server running, run the full check from `server/`:

```bash
npm run smoke
```

It registers two throwaway users (Alice and Bob) and checks every route, including that Bob gets `403` when he tries to edit or delete Alice's room. On Windows, run it from Git Bash. See [docs/api-testing.md](docs/api-testing.md) for individual curl commands.

## Project docs

- [Data schema](docs/schema.md): collections, fields, types, and references
- [Wireframes](docs/wireframes.md): main screens and how users move between them

## Project structure

```
client/          React + Vite front end
  src/
    components/  UI components (Auth, ...)
    context/     AuthContext (current user + token)
    services/    api.js (fetch wrapper)
server/          Express API
  middleware/    requireAuth, validate
  models/        Mongoose models: User, Room, Message
  routes/        auth, rooms, messages
  server.js      App entry point
docs/            Schema and wireframes
```
