#!/usr/bin/env bash
# Applies the migrations to a fresh Postgres database (with a stub of
# Supabase's auth schema), runs the repair scripts on top (they must be
# harmless on a healthy database), runs the behavioural tests, and finally
# requires the health check to pass.
#
#   supabase/tests/run.sh               # uses PG* env vars / local socket
#   PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres supabase/tests/run.sh
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
scripts="$here/../scripts"
db="${MINTO_TEST_DB:-minto_test}"

psql -v ON_ERROR_STOP=1 -q -d postgres -c "drop database if exists ${db}" -c "create database ${db}"
psql -v ON_ERROR_STOP=1 -q -d "$db" -f "$here/auth-stub.sql"
for migration in "$here"/../migrations/*.sql; do
  echo "Applying $(basename "$migration")"
  psql -v ON_ERROR_STOP=1 -q -d "$db" -f "$migration"
done

# The repair scripts must be safe to run, twice, on a fully migrated database.
for pass in 1 2; do
  echo "Repair scripts, pass $pass"
  psql -v ON_ERROR_STOP=1 -q -d "$db" -f "$scripts/repair-functions.sql" >/dev/null
  psql -v ON_ERROR_STOP=1 -q -d "$db" -f "$scripts/repair-signup.sql" >/dev/null
done

psql -v ON_ERROR_STOP=1 -d "$db" -f "$here/minto.test.sql"

echo "Health check"
report="$(psql -v ON_ERROR_STOP=1 -X -tA -F ' | ' -d "$db" -f "$scripts/health-check.sql")"
echo "$report"
if grep -q '❌' <<<"$report"; then
  echo "Health check failed." >&2
  exit 1
fi
echo "Health check passed."
