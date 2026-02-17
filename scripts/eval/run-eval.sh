#!/bin/bash
# Phosra Eval Pipeline — run all prompts, score, and generate report
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Check for required env vars
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "Error: ANTHROPIC_API_KEY not set (needed for LLM-as-judge scoring)"
  echo "Export it: export ANTHROPIC_API_KEY=sk-ant-..."
  exit 1
fi

echo "═══ Step 1: Running prompts against production API ═══"
npx tsx runner.ts "$@"

echo ""
echo "═══ Step 2: Scoring transcripts ═══"
npx tsx scorer.ts "$@"

echo ""
echo "═══ Step 3: Generating report ═══"
npx tsx report.ts

echo ""
echo "═══ Done! ═══"
echo "Report: $DIR/eval-report.md"
echo "Scores: $DIR/scores.json"
