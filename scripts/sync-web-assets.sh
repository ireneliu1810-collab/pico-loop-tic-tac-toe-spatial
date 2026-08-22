#!/usr/bin/env sh
set -eu

PROJECT_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
SOURCE_DIR="$PROJECT_ROOT/web/dist"
TARGET_DIR="$PROJECT_ROOT/app/src/main/assets/web"

if [ ! -f "$SOURCE_DIR/index.html" ]; then
  echo "Missing web/dist/index.html. Build the web app first." >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"
rsync -a --delete "$SOURCE_DIR/" "$TARGET_DIR/"
