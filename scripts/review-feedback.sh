#!/bin/bash
# Review UI feedback items from the Phosra app
# Usage: ./scripts/review-feedback.sh [status]
# Examples:
#   ./scripts/review-feedback.sh          # show all open items
#   ./scripts/review-feedback.sh approved  # show approved items
#   ./scripts/review-feedback.sh all       # show all items (no filter)

API_URL="${API_URL:-http://localhost:8080/api/v1}"
STATUS="${1:-open}"

if [ "$STATUS" = "all" ]; then
  URL="${API_URL}/feedback"
  echo "=== All UI Feedback ==="
else
  URL="${API_URL}/feedback?status=${STATUS}"
  echo "=== UI Feedback (status: $STATUS) ==="
fi
echo ""

RESPONSE=$(curl -s "$URL")
COUNT=$(echo "$RESPONSE" | jq 'length')

if [ "$COUNT" = "0" ] || [ "$COUNT" = "null" ]; then
  echo "  No feedback items found."
  exit 0
fi

echo "$RESPONSE" | jq -r '
  .[] |
  "  [\(.id | .[0:8])] \(.status | ascii_upcase)\n" +
  "    Page:      \(.page_route)\n" +
  "    Selector:  \(.css_selector)\n" +
  "    Component: \(.component_hint // "—")\n" +
  "    Comment:   \(.comment)\n" +
  "    By:        \(.reviewer_name)  (\(.created_at | .[0:19]))\n"
'

echo "  Total: $COUNT items"
echo ""
echo "  Actions:"
echo "    ./scripts/feedback-action.sh <id> approve   # approve for fixing"
echo "    ./scripts/feedback-action.sh <id> dismiss    # dismiss"
echo "    ./scripts/feedback-action.sh <id> fix        # mark as fixed"
