#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SELF="${BASH_SOURCE[0]}"

ENV_TEMPLATE="$ROOT_DIR/.env.template"
ENV_FILE="$ROOT_DIR/.env"

rand_hex () {
  local n_bytes="${1:-32}"
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex "${n_bytes}"
  else
    head -c "${n_bytes}" /dev/urandom | od -An -tx1 | tr -d ' \n'
  fi
}

# 1) Copy .env.template -> .env if it does not exist
if [[ -f "$ENV_TEMPLATE" ]]; then
  if [[ ! -f "$ENV_FILE" ]]; then
    cp "$ENV_TEMPLATE" "$ENV_FILE"
    echo "✓ Copied $ENV_TEMPLATE → $ENV_FILE"
  else
    echo "→ $ENV_FILE already exists. Not overwriting."
  fi
else
  echo "⚠️ $ENV_TEMPLATE does not exist; skipping copy."
fi

# 2) Replacements
if [[ -f "$ENV_FILE" ]]; then
  JWT_SECRET="$(rand_hex 32)"
  REFRESH_SECRET="$(rand_hex 48)"
  perl -0777 -pe "s/\{jwt_secret\}/$JWT_SECRET/g; s/\{refresh_secret\}/$REFRESH_SECRET/g" -i "$ENV_FILE"
  echo "✓ Placeholders in .env ready"
fi

# 3) Remove .git if it exists
if [[ -d "$ROOT_DIR/.git" ]]; then
  rm -rf "$ROOT_DIR/.git"
  echo "✓ Removed .git"
fi

# 3.5) (Optional) Self-destruction of the script BEFORE the new commit
if [[ -f "$SELF" ]]; then
  rm -- "$SELF" || true
  echo "🧹 bootstrap.sh deleted (self-destruction)"
fi

# 4) Re-init and clean commit without the script
(
  cd "$ROOT_DIR"
  git init -q
  git checkout -q -b main 2>/dev/null || git branch -M main
  git add .
  git commit -q -m "Initial commit"
)
echo "✅ Done"