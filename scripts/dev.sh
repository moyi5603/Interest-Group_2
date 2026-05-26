#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -d node_modules ]]; then
  echo "请先执行: npm install"
  exit 1
fi

NODE="${NODE:-node}"
exec "$NODE" node_modules/vite/bin/vite.js --host 127.0.0.1
