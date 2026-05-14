#!/usr/bin/env bash
set -euo pipefail

# Smoke test: create a temp project, link local packages, run ctkit commands.
# Requires CONTENTFUL_MANAGEMENT_TOKEN, CONTENTFUL_SPACE_ID, and
# CONTENTFUL_ENVIRONMENT_ID in your .env or environment.
#
# Usage:
#   ./scripts/smoke.sh

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SMOKE_DIR=$(mktemp -d)
trap "rm -rf $SMOKE_DIR" EXIT

echo "=== ctkit smoke test ==="
echo "Temp dir: $SMOKE_DIR"
echo ""

# Load .env (check root first, then packages/ctkit/)
for envfile in "$ROOT/.env" "$ROOT/packages/ctkit/.env"; do
  if [[ -f "$envfile" ]]; then
    set -a
    source "$envfile"
    set +a
    break
  fi
done

# Check required env vars
if [[ -z "${CONTENTFUL_MANAGEMENT_TOKEN:-}" || -z "${CONTENTFUL_SPACE_ID:-}" ]]; then
  echo "Error: CONTENTFUL_MANAGEMENT_TOKEN and CONTENTFUL_SPACE_ID must be set."
  echo "Either export them or create packages/ctkit/.env"
  exit 1
fi

# Build and link
echo "1. Building packages..."
cd "$ROOT"
pnpm -r build
echo ""

echo "2. Linking locally..."
cd "$ROOT/packages/core" && pnpm link --global 2>/dev/null
cd "$ROOT/packages/ctkit" && pnpm link --global 2>/dev/null
echo ""

# Run smoke tests in temp dir
cd "$SMOKE_DIR"

echo "3. ctkit init..."
ctkit init
echo ""

echo "4. Checking generated files..."
[[ -d schemas ]] && echo "   schemas/        ✓" || echo "   schemas/        ✗ MISSING"
[[ -d migrations ]] && echo "   migrations/     ✓" || echo "   migrations/     ✗ MISSING"
[[ -f schemas/example.ts ]] && echo "   example.ts      ✓" || echo "   example.ts      ✗ MISSING"
ls migrations/*.js >/dev/null 2>&1 && echo "   migration.js    ✓" || echo "   migration.js    ✗ MISSING"
# Should NOT exist:
[[ ! -f README.md ]] && echo "   no README.md    ✓" || echo "   README.md       ✗ SHOULD NOT EXIST"
[[ ! -f .env.example ]] && echo "   no .env.example ✓" || echo "   .env.example    ✗ SHOULD NOT EXIST"
echo ""

echo "5. Creating .env..."
cat > .env <<EOF
CONTENTFUL_MANAGEMENT_TOKEN=${CONTENTFUL_MANAGEMENT_TOKEN}
CONTENTFUL_SPACE_ID=${CONTENTFUL_SPACE_ID}
CONTENTFUL_ENVIRONMENT_ID=${CONTENTFUL_ENVIRONMENT_ID:-master}
EOF
echo ""

echo "6. ctkit test (connection)..."
ctkit test
echo ""

echo "7. ctkit check..."
ctkit check || true
echo ""

echo "8. ctkit --version..."
ctkit --version
echo ""

echo "=== Smoke test passed ==="
