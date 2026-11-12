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
   | `PORT`          | Port for the API. Default `3000`. The client expects `3000`.                                            |
   | `MONGODB_URI`   | Your connection string, ending in the database name, e.g. `mongodb+srv://USER:PASS@HOST/studyroom?retryWrites=true&w=majority` |
   | `JWT_SECRET`    | Any long random string. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `CLIENT_ORIGIN` | URL of the client, for CORS. Default `http://localhost:5173`.                                           |

   If you use Atlas, add your IP address under **Network Access**, or the server can't connect.

3. **Run both apps** (two terminals)

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

4. **Check it works:** open <http://localhost:3000/api/health>. It should return `{"status":"ok", ...}`. Then open <http://localhost:5173> and register an account.

## API

All routes are under `/api`. Routes marked 🔒 need an `Authorization: Bearer <token>` header. The token comes from register or login.

| Method | Path                           | Description                       |
|--------|--------------------------------|-----------------------------------|
| GET    | `/health`                      | Health check                      |
| POST   | `/auth/register`               | Create an account, returns a JWT  |
| POST   | `/auth/login`                  | Log in, returns a JWT             |
| GET    | `/rooms` 🔒                     | List study rooms                  |
| POST   | `/rooms` 🔒                     | Create a study room               |
| GET    | `/rooms/:id` 🔒                 | Get one room                      |
| GET    | `/rooms/:roomId/messages` 🔒    | List messages in a room           |
| POST   | `/rooms/:roomId/messages` 🔒    | Send a message to a room          |

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
