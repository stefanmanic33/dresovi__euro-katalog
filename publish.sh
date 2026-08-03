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
  if git commit -m "$commit_msg"; then
    if git push; then
      echo "Publish zavrsen."
    else
      echo "Push nije uspeo."
      echo "Izgleda da se git odvezao ili nije povezan na internet."
      echo "Proveri konekciju i probaj ponovo kasnije:"
      echo "  git push"
      exit 1
    fi
  else
    echo "Commit nije uspeo."
    echo "Proveri da li je Git pravilno konfigurisan i da li postoji remote repozitorijum."
    exit 1
  fi
else
  echo "Nema promena za commit."
fi
