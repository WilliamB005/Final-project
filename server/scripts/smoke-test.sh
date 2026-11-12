#!/bin/bash
# Milestone 2 smoke test: auth, rooms CRUD, ownership checks, status codes.
# Start the server first (npm run dev), then from server/:
#   npm run smoke                      # uses http://localhost:3000/api
#   bash scripts/smoke-test.sh http://localhost:4000/api
# It creates two throwaway users (alice/bob + random number) and a room, and deletes the room at the end.
B="${1:-http://localhost:3000/api}"; R="${RANDOM}${RANDOM}"
BODY=$(mktemp); trap 'rm -f "$BODY"' EXIT
FAILS=0
req() { # method path token body -> prints "STATUS body"
  local args=(-s -o "$BODY" -w "%{http_code}" -X "$1" "$B$2" -H "Content-Type: application/json")
  [ -n "$3" ] && args+=(-H "Authorization: Bearer $3")
  [ -n "$4" ] && args+=(-d "$4")
  local code; code=$(curl "${args[@]}"); echo "$code $(cat "$BODY")"
}
check() { # label expected actual
  local got="${3%% *}"; if [ "$got" = "$2" ]; then echo "PASS [$2] $1"; else FAILS=$((FAILS+1)); echo "FAIL $1 (expected $2, got: ${3:0:160})"; fi
}
tok() { sed -E 's/.*"token":"([^"]+)".*/\1/' <<<"$1"; }
id()  { sed -E 's/.*"_id":"([0-9a-f]{24})".*/\1/' <<<"$1"; }

echo "== auth"
A=$(req POST /auth/register "" "{\"username\":\"alice$R\",\"email\":\"alice$R@test.dev\",\"password\":\"password123\"}"); check "register alice" 201 "$A"; TA=$(tok "$A")
Bo=$(req POST /auth/register "" "{\"username\":\"bob$R\",\"email\":\"bob$R@test.dev\",\"password\":\"password123\"}"); check "register bob" 201 "$Bo"; TB=$(tok "$Bo")
check "duplicate username" 400 "$(req POST /auth/register "" "{\"username\":\"alice$R\",\"email\":\"other$R@test.dev\",\"password\":\"password123\"}")"
check "duplicate email" 400 "$(req POST /auth/register "" "{\"username\":\"carol$R\",\"email\":\"alice$R@test.dev\",\"password\":\"password123\"}")"
check "register missing fields" 400 "$(req POST /auth/register "" '{}')"
check "register short password" 400 "$(req POST /auth/register "" "{\"username\":\"dan$R\",\"email\":\"dan$R@test.dev\",\"password\":\"123\"}")"
check "register no body" 400 "$(req POST /auth/register "" "")"
check "malformed JSON" 400 "$(req POST /auth/register "" '{bad json')"
check "login ok" 200 "$(req POST /auth/login "" "{\"email\":\"alice$R@test.dev\",\"password\":\"password123\"}")"
check "login wrong password" 400 "$(req POST /auth/login "" "{\"email\":\"alice$R@test.dev\",\"password\":\"nope\"}")"
P=$(req POST /auth/login "" "{\"email\":\"alice$R@test.dev\",\"password\":\"password123\"}"); grep -q password <<<"$P" && { FAILS=$((FAILS+1)); echo "FAIL login response leaks password"; } || echo "PASS login response has no password"

echo "== no token, no data"
check "GET /rooms no token" 401 "$(req GET /rooms)"
check "GET /rooms garbage token" 401 "$(req GET /rooms garbage)"
check "GET /rooms forged token" 401 "$(req GET /rooms eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ4In0.bad)"
check "GET messages no token" 401 "$(req GET /rooms/000000000000000000000000/messages)"

echo "== rooms CRUD"
C=$(req POST /rooms "$TA" '{"name":"Calc II","description":"exam prep"}'); check "alice creates room" 201 "$C"; RID=$(id "$C")
check "create room empty name" 400 "$(req POST /rooms "$TA" '{"name":"  "}')"
check "list rooms" 200 "$(req GET /rooms "$TA")"
check "list my rooms" 200 "$(req GET /rooms/mine "$TA")"
check "get room" 200 "$(req GET /rooms/$RID "$TA")"
check "get room bad id" 400 "$(req GET /rooms/abc "$TA")"
check "get room missing" 404 "$(req GET /rooms/000000000000000000000000 "$TA")"
check "alice updates own room" 200 "$(req PUT /rooms/$RID "$TA" '{"name":"Calc II (Friday)"}')"
check "update with empty body" 400 "$(req PUT /rooms/$RID "$TA" '{}')"

echo "== Bob can't touch Alice's data"
check "bob updates alice room" 403 "$(req PUT /rooms/$RID "$TB" '{"name":"hacked"}')"
check "bob deletes alice room" 403 "$(req DELETE /rooms/$RID "$TB")"
check "room unchanged after bob" 200 "$(req GET /rooms/$RID "$TA")"; grep -q hacked "$BODY" && { FAILS=$((FAILS+1)); echo "FAIL room was changed by bob"; } || echo "PASS room name not changed by bob"

echo "== messages"
M=$(req POST /rooms/$RID/messages "$TA" '{"content":"hi all"}'); check "alice posts message" 201 "$M"; MID=$(id "$M")
check "bob posts message" 201 "$(req POST /rooms/$RID/messages "$TB" '{"content":"hey"}')"
check "empty message" 400 "$(req POST /rooms/$RID/messages "$TA" '{"content":""}')"
check "list messages" 200 "$(req GET /rooms/$RID/messages "$TB")"
check "messages bad room id" 400 "$(req GET /rooms/abc/messages "$TA")"
check "messages missing room" 404 "$(req GET /rooms/000000000000000000000000/messages "$TA")"
check "bob deletes alice message" 403 "$(req DELETE /rooms/$RID/messages/$MID "$TB")"
check "alice deletes own message" 204 "$(req DELETE /rooms/$RID/messages/$MID "$TA")"

echo "== delete"
check "alice deletes room" 204 "$(req DELETE /rooms/$RID "$TA")"
check "room gone" 404 "$(req GET /rooms/$RID "$TA")"
check "unknown api route" 404 "$(req GET /nope)"

echo; [ "$FAILS" -eq 0 ] && echo "All checks passed" || { echo "$FAILS check(s) failed"; exit 1; }
