#!/usr/bin/env bash
# Publish databricks_apps to GitHub and open a PR (run from repo root after: gh auth login)
set -euo pipefail

REPO="${GITHUB_REPO:-chandu177/chandan_ai_apps}"
BRANCH="${1:-feature/delivery-map-timeline}"

cd "$(git rev-parse --show-toplevel)"

if ! gh auth status >/dev/null 2>&1; then
  echo "Run: gh auth login"
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "https://github.com/${REPO}.git"
fi

if ! gh repo view "${REPO}" >/dev/null 2>&1; then
  echo "Creating https://github.com/${REPO} ..."
  gh repo create "${REPO}" \
    --private \
    --description "Databricks AppKit workspace (Fleetviz and agent skills)" \
    --add-readme
  git fetch origin main
fi

# Rebase feature branch onto GitHub main (README) if needed
current="$(git branch --show-current)"
if [[ "${current}" != "${BRANCH}" ]]; then
  git checkout "${BRANCH}"
fi

if git rev-parse --verify origin/main >/dev/null 2>&1; then
  if ! git merge-base --is-ancestor origin/main HEAD 2>/dev/null; then
    git rebase origin/main
  fi
fi

git push -u origin "${BRANCH}"

if gh pr view --repo "${REPO}" --head "${BRANCH}" >/dev/null 2>&1; then
  gh pr view --repo "${REPO}" --head "${BRANCH}" --web
else
  gh pr create \
    --repo "${REPO}" \
    --base main \
    --head "${BRANCH}" \
    --title "Add Fleetviz delivery map dashboard with time scrubber" \
    --body "$(cat <<'EOF'
## Summary
- Single-page Fleetviz dashboard at `/` with Leaflet map of delivery GPS positions
- Timeline scrubber (slider + date/time) to replay positions at any point in time
- Light/dark map tiles aligned with AppKit theme
- `GET /api/map/events` replaces the old Events list API; Events page removed

## Lakebase
Dev branch: `projects/fleetviz/branches/delivery-map-timeline` (see AGENTS.md workflow)

## Test plan
- [ ] `cd fleetviz-app && npm run dev` against Lakebase dev branch
- [ ] Scrub timeline and confirm markers update per order
- [ ] Toggle system dark mode and confirm map tiles switch
- [ ] `npm test` (vitest + smoke)
EOF
)"
fi

echo "Done: https://github.com/${REPO}"
