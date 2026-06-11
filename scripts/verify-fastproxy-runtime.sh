#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:43171}"
PROFILE_ID="${2:-}"

echo "== FastProxy bootstrap =="
curl -fsS "$BASE_URL/api/bootstrap" | jq .

echo
echo "== Repository bootstrap =="
curl -fsS "$BASE_URL/api/repository/bootstrap" | jq '.state, .profiles, .subscriptions, .nodeSets, .ruleSets, .groupSets'

if [ -n "$PROFILE_ID" ]; then
  echo
  echo "== Activate profile: $PROFILE_ID =="
  curl -fsS -X PUT "$BASE_URL/api/repository/profiles/active" \
    -H 'Content-Type: application/json' \
    -d "{\"profileId\":\"$PROFILE_ID\"}" | jq .
fi

echo
echo "== Runtime preview =="
curl -fsS "$BASE_URL/api/runtime/preview" | jq '.profile.id, .profile.selectedCore, .warnings, .model'

echo
echo "== Runtime activate =="
curl -fsS -X POST "$BASE_URL/api/runtime/activate" | jq '.status, .compiled.generatedAt'

echo
echo "== Runtime start =="
curl -fsS -X POST "$BASE_URL/api/runtime/start" | jq .

echo
echo "== Runtime status =="
curl -fsS "$BASE_URL/api/runtime/status" | jq .

echo
echo "== Runtime stop =="
curl -fsS -X POST "$BASE_URL/api/runtime/stop" | jq .
