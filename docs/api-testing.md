# Testing the API with curl

Start the server (`cd server && npm run dev`), then run these in Git Bash or another bash terminal.
For the whole set at once, run `npm run smoke` from `server/`.

```bash
API=http://localhost:3000/api
```

## 1. Register two users and save their tokens

```bash
curl -s -X POST $API/auth/register -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@test.dev","password":"password123"}'
# -> 201 {"token":"eyJ...","user":{...}}

curl -s -X POST $API/auth/register -H "Content-Type: application/json" \
  -d '{"username":"bob","email":"bob@test.dev","password":"password123"}'
```

If the users already exist, log in instead:

```bash
curl -s -X POST $API/auth/login -H "Content-Type: application/json" \
  -d '{"email":"alice@test.dev","password":"password123"}'
```

Copy each token into a variable:

```bash
ALICE=eyJ...   # alice's token
BOB=eyJ...     # bob's token
```

## 2. No token, no data

```bash
curl -i $API/rooms
# -> 401 {"error":"Authorization token required"}

curl -i $API/rooms -H "Authorization: Bearer not-a-real-token"
# -> 401 {"error":"Request is not authorized"}
```

## 3. Rooms CRUD (as Alice)

```bash
# Create
curl -s -X POST $API/rooms -H "Authorization: Bearer $ALICE" -H "Content-Type: application/json" \
  -d '{"name":"Calculus II","description":"Exam prep"}'
# -> 201 {"_id":"ROOM_ID", ...}

ROOM=ROOM_ID   # paste the _id

# Read
curl -s $API/rooms -H "Authorization: Bearer $ALICE"
curl -s $API/rooms/mine -H "Authorization: Bearer $ALICE"
curl -s $API/rooms/$ROOM -H "Authorization: Bearer $ALICE"

# Update
curl -s -X PUT $API/rooms/$ROOM -H "Authorization: Bearer $ALICE" -H "Content-Type: application/json" \
  -d '{"name":"Calculus II - Friday"}'
# -> 200

# Delete (at the end; also deletes the room's messages)
curl -i -X DELETE $API/rooms/$ROOM -H "Authorization: Bearer $ALICE"
# -> 204
```

## 4. Bob can't touch Alice's data

```bash
curl -i -X PUT $API/rooms/$ROOM -H "Authorization: Bearer $BOB" -H "Content-Type: application/json" \
  -d '{"name":"hacked"}'
# -> 403 {"error":"Only the room creator can do that"}

curl -i -X DELETE $API/rooms/$ROOM -H "Authorization: Bearer $BOB"
# -> 403
```

## 5. Status codes for bad input

```bash
curl -i $API/rooms/abc -H "Authorization: Bearer $ALICE"
# -> 400 {"error":"Invalid id"}

curl -i $API/rooms/000000000000000000000000 -H "Authorization: Bearer $ALICE"
# -> 404 {"error":"Room not found"}

curl -i -X POST $API/rooms -H "Authorization: Bearer $ALICE" -H "Content-Type: application/json" -d '{"name":""}'
# -> 400 {"error":"Room name is required"}
```

## 6. Messages

```bash
curl -s -X POST $API/rooms/$ROOM/messages -H "Authorization: Bearer $ALICE" -H "Content-Type: application/json" \
  -d '{"content":"Anyone done problem 4?"}'
# -> 201 {"_id":"MSG_ID", ...}

curl -s $API/rooms/$ROOM/messages -H "Authorization: Bearer $BOB"
# -> 200 [ ... ]

curl -i -X DELETE $API/rooms/$ROOM/messages/MSG_ID -H "Authorization: Bearer $BOB"
# -> 403 (only the sender can delete it)
```
