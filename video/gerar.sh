#!/usr/bin/env bash
set -euo pipefail
video_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if ! command -v docker >/dev/null; then
  echo 'Instale e abra o Docker Desktop, OrbStack ou Docker Engine com Compose.' >&2
  exit 1
fi
docker info >/dev/null
export SLOTGUARD_VIDEO_UID="$(id -u)"
export SLOTGUARD_VIDEO_GID="$(id -g)"
export SLOTGUARD_VIDEO_OUTPUT="${SLOTGUARD_VIDEO_OUTPUT:-$video_dir/output}"
mkdir -p "$SLOTGUARD_VIDEO_OUTPUT"
if [[ $# -eq 0 ]]; then set -- --check; fi
exec docker compose -f "$video_dir/compose.yaml" run --build --rm --no-deps produtor "$@"
