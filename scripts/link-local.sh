#!/usr/bin/env bash
set -euo pipefail

# Link local packages globally so you can test without publishing.
#
# Usage:
#   ./scripts/link-local.sh          # build + link both packages
#   ./scripts/link-local.sh --unlink # remove global links

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ "${1:-}" == "--unlink" ]]; then
  echo "Unlinking @ctkit/core and @ctkit/cli..."
  cd "$ROOT/packages/core" && pnpm unlink --global 2>/dev/null || true
  cd "$ROOT/packages/ctkit" && pnpm unlink --global 2>/dev/null || true
  echo "Done. Global links removed."
  exit 0
fi

echo "Building packages..."
cd "$ROOT"
pnpm -r build

echo ""
echo "Linking @ctkit/core globally..."
cd "$ROOT/packages/core"
pnpm link --global

echo "Linking @ctkit/cli globally..."
cd "$ROOT/packages/ctkit"
pnpm link --global

echo ""
echo "Done! You can now use in any project:"
echo "  ctkit --version"
echo "  import { FieldType } from '@ctkit/core'"
echo ""
echo "To unlink: pnpm link-local --unlink"
