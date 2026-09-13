#!/usr/bin/env bash
set -e

export PATH="$HOME/.local/share/mise/shims:$PATH"

echo "=== Executing & Recording GraphAgent Flow ==="
node scripts/record_flow.js

# Generate terminal asciicast recording
if command -v uvx >/dev/null 2>&1; then
  echo "Generating terminal asciicast to recordings/demo.cast..."
  uvx asciinema rec recordings/demo.cast -c "node scripts/record_flow.js" --overwrite >/dev/null 2>&1 || true
fi

echo "All recordings generated successfully in recordings/:"
echo "  - recordings/latest_flow_record.json (Structured execution audit)"
echo "  - recordings/demo.cast (Terminal screencast asciicast)"
