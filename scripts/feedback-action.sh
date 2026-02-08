#!/bin/bash
# Change status of a UI feedback item
# Usage: ./scripts/feedback-action.sh <id> <approve|dismiss|fix>
#
# The PATCH endpoint requires auth. Set GUARDIANGATE_TOKEN to your JWT.
# You can get a token by logging in:
#   curl -s http://localhost:8080/api/v1/auth/login \
#     -d '{"email":"you@example.com","password":"..."}' | jq -r .access_token

API_URL="${API_URL:-http://localhost:8080/api/v1}"
TOKEN="${GUARDIANGATE_TOKEN}"

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <feedback-id> <approve|dismiss|fix|open>"
  echo ""
  echo "  approve  — mark for Claude to fix"
  echo "  dismiss  — not actionable"
  echo "  fix      — mark as fixed"
  echo "  open     — reopen"
  exit 1
fi

ID="$1"
ACTION="$2"

# Map shorthand to status values
case "$ACTION" in
  approve) STATUS="approved" ;;
  dismiss) STATUS="dismissed" ;;
  fix)     STATUS="fixed" ;;
  open)    STATUS="open" ;;
  *)       STATUS="$ACTION" ;;
esac

if [ -z "$TOKEN" ]; then
  echo "Error: GUARDIANGATE_TOKEN not set."
  echo "Export your JWT token: export GUARDIANGATE_TOKEN=\$(curl -s ...)"
  exit 1
fi

RESPONSE=$(curl -s -X PATCH "${API_URL}/feedback/${ID}/status" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"status\": \"${STATUS}\"}")

echo "$RESPONSE" | jq .
echo ""
echo "Feedback $ID -> $STATUS"
