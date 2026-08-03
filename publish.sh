#!/bin/zsh
set -euo pipefail

# Use Command Line Tools to bypass broken Xcode.app developer path.
export DEVELOPER_DIR=/Library/Developer/CommandLineTools

cd "$(dirname "$0")"

if [[ "${1:-}" == "" ]]; then
  echo "Usage: ./publish.sh \"commit poruka\""
  exit 1
fi

commit_msg="$1"

python3 generate_manifest.py

git add catalog manifest.json

if [[ -n "$(git status --porcelain)" ]]; then
  git commit -m "$commit_msg"
  if git push; then
    echo "Publish zavrsen."
  else
    echo "Push nije uspeo (verovatno GitHub login/token)."
    echo "Probaj: git push"
    exit 1
  fi
else
  echo "Nema promena za commit."
fi
