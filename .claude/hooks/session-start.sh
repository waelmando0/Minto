#!/bin/bash
# Installs dependencies for Claude Code on the web sessions so lint, typecheck, tests and builds work
# for both the website (repo root) and the Expo app (mobile/).
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# `npm install` (not `npm ci`) reuses the cached node_modules between sessions.
npm install --no-audit --no-fund

# The Expo app in mobile/ has its own dependencies.
npm install --prefix mobile --no-audit --no-fund

# Generates Next.js route types (e.g. the global `LayoutProps`) that `tsc --noEmit` relies on.
npx next typegen
