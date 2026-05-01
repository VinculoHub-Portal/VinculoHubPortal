#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f frontend/.env ]]; then
  COMPOSE=(docker compose --env-file frontend/.env)
else
  COMPOSE=(docker compose)
fi

existing_db_container="$("${COMPOSE[@]}" ps --status running -q db 2>/dev/null || true)"
started_db_here=false

cleanup() {
  if [[ "$started_db_here" == "true" ]]; then
    "${COMPOSE[@]}" stop db >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

if [[ -z "$existing_db_container" ]]; then
  "${COMPOSE[@]}" up -d db
  started_db_here=true
fi

for attempt in {1..30}; do
  if "${COMPOSE[@]}" exec -T db pg_isready -U "${POSTGRES_USER:-vinculohub}" -d "${POSTGRES_DB:-vinculohub_db}" >/dev/null 2>&1; then
    break
  fi

  if [[ "$attempt" -eq 30 ]]; then
    echo "Postgres não ficou pronto a tempo." >&2
    exit 1
  fi

  sleep 1
done

"${COMPOSE[@]}" run --rm flyway
npm --prefix frontend run test:payload
