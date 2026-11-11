#!/usr/bin/env bash
# Post-clone setup: link workspace-store env into the repo (D14).
set -euo pipefail
WS="${WORKSPACE_CONFIG:-$(cd "$(dirname "$0")/../.." && pwd)/config}"
SLUG="train-docs"
ENV_DIR="$WS/env/projects/$SLUG"
mkdir -p "$ENV_DIR"
[ -f "$ENV_DIR/.env.local" ] || touch "$ENV_DIR/.env.local"

ln -sf "$ENV_DIR/.env.local" "$(dirname "$0")/../.env.local"

echo "linked env -> $ENV_DIR/.env.local"
