#!/usr/bin/env bash
set -euo pipefail

echo "[Init] Installing backend dependencies..."
python --version || true
pip --version || true
pip install --upgrade pip >/dev/null
pip install -r backend/requirements.txt >/dev/null

# Seeder needs faker (not in requirements.txt)
echo "[Init] Ensuring 'faker' is installed for seeding..."
pip install -q faker

echo "[Init] Installing frontend dependencies (npm ci)..."
pushd frontend >/dev/null
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi
popd >/dev/null

# Prepare frontend .env.local with the proper API URL (Codespaces friendly)
if [ -n "${CODESPACE_NAME:-}" ] && [ -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]; then
  API_URL="https://${CODESPACE_NAME}-8000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
else
  API_URL="http://localhost:8000"
fi

echo "[Init] Writing frontend/.env.local with NEXT_PUBLIC_API_URL=${API_URL}"
mkdir -p frontend
cat > frontend/.env.local <<EOF
NEXT_PUBLIC_API_URL=${API_URL}
NEXT_PUBLIC_NODE_ENV=development
NODE_ENV=development
EOF

# Seed database using SQLite default (no Docker/Postgres needed)
# Important: add backend/app to PYTHONPATH so imports work outside Docker
echo "[Init] Seeding database (SQLite default.db)..."
export PYTHONPATH="backend/app"
python backend/test/seed_database.py || {
  echo "[Init] First seed attempt failed, retrying in 5s..."
  sleep 5
  python backend/test/seed_database.py
}

echo "[Init] Done. You can now start services with: scripts/start_all.sh"