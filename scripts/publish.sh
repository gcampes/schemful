#!/usr/bin/env bash
set -euo pipefail

# Publish all @ctkit packages with synced versions.
#
# Usage:
#   ./scripts/publish.sh patch          # 0.1.1 → 0.1.2
#   ./scripts/publish.sh minor          # 0.1.1 → 0.2.0
#   ./scripts/publish.sh major          # 0.1.1 → 1.0.0
#   ./scripts/publish.sh 0.3.0          # explicit version
#   ./scripts/publish.sh                # defaults to patch

BUMP="${1:-patch}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CORE_PKG="$ROOT/packages/core/package.json"
CLI_PKG="$ROOT/packages/ctkit/package.json"

# Resolve the new version
current_version=$(node -p "require('$CORE_PKG').version")

if [[ "$BUMP" =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]]; then
  new_version="$BUMP"
else
  # Use node to bump semver
  new_version=$(node -e "
    const [major, minor, patch] = '$current_version'.split('.').map(Number);
    if ('$BUMP' === 'major') console.log(\`\${major+1}.0.0\`);
    else if ('$BUMP' === 'minor') console.log(\`\${major}.\${minor+1}.0\`);
    else console.log(\`\${major}.\${minor}.\${patch+1}\`);
  ")
fi

echo ""
echo "  @ctkit/core  $current_version → $new_version"
echo "  @ctkit/cli   $current_version → $new_version"
echo ""

# Confirm
read -p "Publish $new_version? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Cancelled."
  exit 0
fi

# Update versions in both package.json files
node -e "
  const fs = require('fs');
  for (const path of ['$CORE_PKG', '$CLI_PKG']) {
    const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
    pkg.version = '$new_version';
    fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
  }
"

# Update the workspace dependency version in CLI's package.json
# (keep workspace: protocol for local dev, npm publish resolves it)

echo "Building..."
cd "$ROOT"
pnpm -r build

echo "Type checking..."
pnpm --filter @ctkit/cli type-check

echo "Running tests..."
pnpm --filter @ctkit/cli test:run

# OTP for 2FA (prompt once, use for both)
read -p "npm OTP code: " otp

echo ""
echo "Publishing @ctkit/core@$new_version..."
cd "$ROOT/packages/core"
pnpm publish --access=public --no-git-checks --otp="$otp"

echo ""
echo "Publishing @ctkit/cli@$new_version..."
cd "$ROOT/packages/ctkit"
pnpm publish --access=public --no-git-checks --otp="$otp"

echo ""
echo "Done! Published @ctkit/core@$new_version and @ctkit/cli@$new_version"
echo ""
echo "Don't forget to:"
echo "  git add -A && git commit -m 'Release $new_version' && git push"
echo "  git tag v$new_version && git push --tags"
