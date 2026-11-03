#!/usr/bin/env bash
# Print every tRPC procedure key the installed @wareraprojects/api package knows about.
# Usage: .agents/skills/warera-api/scripts/list-procedures.sh [path-to-package-dir]
set -euo pipefail

pkg="${1:-node_modules/@wareraprojects/api}"
if [ ! -f "$pkg/dist/index.d.ts" ]; then
  echo "package not found at $pkg; run npm ci first" >&2
  exit 1
fi

version=$(grep -oE '"version": "[^"]+"' "$pkg/package.json" | cut -d'"' -f4)
echo "# @wareraprojects/api $version"
grep -ohE '"[a-zA-Z]+\.[a-zA-Z]+"' "$pkg/src/api/warera-openapi.d.ts" "$pkg/dist/index.d.ts" | tr -d '"' | sort -u
