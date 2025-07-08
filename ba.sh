#!/bin/bash

PLUGINS_DIR="./plugins"

for file in "$PLUGINS_DIR"/*.cjs; do
  echo "Processing $file"

  # Remove any line that requires command.js via require
  # Assumes the require line looks like: const { cmd } = require('../command.js');
  # This uses sed to delete the line
  sed -i "/require(['\"]\.\.\/command\.js['\"])/d" "$file"

  # Read original content
  original_content=$(cat "$file")

  # Write the wrapped content back
  {
    echo "(async () => {"
    echo "  const { cmd } = await import('../command.js');"
    echo ""
    # Indent original content by 2 spaces for neatness
    echo "$original_content" | sed 's/^/  /'
    echo "})();"
  } > "$file"

done
