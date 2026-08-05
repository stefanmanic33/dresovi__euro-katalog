#!/bin/zsh
set -euo pipefail

export DEVELOPER_DIR=/Library/Developer/CommandLineTools

cd "$(dirname "$0")"

if [[ $# -lt 3 ]]; then
  echo "Usage: ./add_jersey.sh /path/to/image.jpg premier-league chelsea"
  exit 1
fi

source_path="$1"
category="$2"
team="$3"

python3 add_jersey.py "$source_path" "$category" "$team"
