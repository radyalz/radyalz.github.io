#!/usr/bin/env bash
set -euo pipefail
HUB=/mnt/shared/Projects/Coding/Active/profolio-links
CV=/mnt/shared/Projects/adacemicCv/Cv-Builder
OUT="$(cd "$(dirname "$0")" && pwd)/docs"
export NODE_OPTIONS=--dns-result-order=ipv4first
(cd "$HUB" && npx astro build >/dev/null)
(cd "$CV" && npx astro build >/dev/null)
rm -rf "$OUT" && mkdir -p "$OUT/links" "$OUT/resume"
cp -r "$HUB/dist/client/links/." "$OUT/links/"
cp -r "$CV/dist/." "$OUT/resume/"
rm -f "$OUT/resume/_headers"
cp "$OUT/links/index.html" "$OUT/index.html"
cp "$OUT/links/favicon-32.png" "$OUT/favicon.ico"
touch "$OUT/.nojekyll"
echo "built $OUT"
