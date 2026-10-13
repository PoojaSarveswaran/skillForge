#!/usr/bin/env bash
# One-shot MySQL setup for SkillForge AI: creates the database, a dedicated
# app user, and imports schema.sql + seed.sql.
#
# Usage:
#   ./database/setup_db.sh                     # prompts for a new app password
#   SF_DB_PASSWORD='yourpassword' ./database/setup_db.sh   # non-interactive
#
# You will be prompted once for your MySQL root (or admin) password by the
# `mysql` client itself.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

DB_NAME="skillforge"
DB_USER="sf_app"

if [ -z "${SF_DB_PASSWORD:-}" ]; then
  read -r -s -p "Choose a password for the new MySQL user '${DB_USER}': " SF_DB_PASSWORD
  echo
fi

echo "Creating database '${DB_NAME}' and user '${DB_USER}'..."
mysql -u root -p <<SQL
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${SF_DB_PASSWORD}';
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${SF_DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

echo "Importing schema..."
mysql -u "${DB_USER}" -p"${SF_DB_PASSWORD}" "${DB_NAME}" < "${SCRIPT_DIR}/schema.sql"

echo "Importing seed data..."
mysql -u "${DB_USER}" -p"${SF_DB_PASSWORD}" "${DB_NAME}" < "${SCRIPT_DIR}/seed.sql"

echo
echo "Done. Now put these values in server/.env:"
echo "  DB_NAME=${DB_NAME}"
echo "  DB_USER=${DB_USER}"
echo "  DB_PASSWORD=${SF_DB_PASSWORD}"
