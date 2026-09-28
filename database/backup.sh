#!/usr/bin/env bash
set -euo pipefail

# CodePulse Automated SQLite Backup Script for Unix / Linux / Docker
DB_PATH="${1:-data/codetrack.sqlite}"
BACKUP_DIR="${2:-database/backups}"

if [ ! -f "$DB_PATH" ]; then
    echo "[Backup] Error: Database file not found at $DB_PATH" >&2
    exit 1
fi

mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/codepulse_backup_${TIMESTAMP}.sqlite"

echo "[Backup] Creating snapshot of $DB_PATH -> $BACKUP_FILE..."

# Safe SQLite online backup using sqlite3 CLI if available, else copy
if command -v sqlite3 >/dev/null 2>&1; then
    sqlite3 "$DB_PATH" ".backup '${BACKUP_FILE}'"
else
    cp "$DB_PATH" "$BACKUP_FILE"
    if [ -f "${DB_PATH}-wal" ]; then
        cp "${DB_PATH}-wal" "${BACKUP_FILE}-wal"
    fi
fi

echo "[Backup] Backup completed successfully: $BACKUP_FILE"
