#!/bin/zsh
set -euo pipefail

# Use Command Line Tools to bypass broken Xcode.app developer path.
export DEVELOPER_DIR=/Library/Developer/CommandLineTools

cd "$(dirname "$0")"
python3 generate_manifest.py
echo "Manifest osvezen."
