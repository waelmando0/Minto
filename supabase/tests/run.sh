#!/usr/bin/env bash
# Applies the migrations to a fresh Postgres database (with a stub of
# Supabase's auth schema) and runs the behavioural tests.
#
#   supabase/tests/run.sh               # uses PG* env vars / local socket
#   PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres supabase/tests/run.sh
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
db="${MINTO_TEST_DB:-minto_test}"

psql -v ON_ERROR_STOP=1 -q -d postgres -c "drop database if exists ${db}" -c "create database ${db}"
psql -v ON_ERROR_STOP=1 -q -d "$db" -f "$here/auth-stub.sql"
for migration in "$here"/../migrations/*.sql; do
  echo "Applying $(basename "$migration")"
  psql -v ON_ERROR_STOP=1 -q -d "$db" -f "$migration"
done
psql -v ON_ERROR_STOP=1 -d "$db" -f "$here/minto.test.sql"
