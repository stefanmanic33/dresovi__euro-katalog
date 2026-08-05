#!/usr/bin/env python3
import argparse
import json
import os
import re
import shutil
import datetime
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
CATALOG_ROOT = os.path.join(ROOT, "catalog")
OUT = os.path.join(ROOT, "manifest.json")


def sorted_image_names_by_mtime(folder_path):
    image_names = []
    for name in os.listdir(folder_path):
        full_path = os.path.join(folder_path, name)
        if not os.path.isfile(full_path):
            continue
        if not re.search(r"\.(jpg|jpeg|png|webp|gif)$", name, re.I):
            continue
        image_names.append((name, os.path.getmtime(full_path)))

    image_names.sort(key=lambda item: (-item[1], item[0].lower()))
    return [name for name, _ in image_names]


def write_manifest(repo_root=None):
    repo_root = repo_root or ROOT
    catalog_root = os.path.join(repo_root, "catalog")
    out = os.path.join(repo_root, "manifest.json")
    manifest = {
        "generatedAt": datetime.datetime.utcnow().isoformat() + "Z",
        "items": {},
    }

    for category in sorted(os.listdir(catalog_root)):
        cat_path = os.path.join(catalog_root, category)
        if not os.path.isdir(cat_path):
            continue

        category_images = []
        for name in sorted_image_names_by_mtime(cat_path):
            category_images.append(f"catalog/{category}/{name}")

        if category_images:
            manifest["items"][category] = category_images

        for team in sorted(os.listdir(cat_path)):
            team_path = os.path.join(cat_path, team)
            if not os.path.isdir(team_path):
                continue

            images = []
            for name in sorted_image_names_by_mtime(team_path):
                images.append(f"catalog/{category}/{team}/{name}")

            manifest["items"][f"{category}/{team}"] = images

    with open(out, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    return out


def add_jersey(repo_root=None, category=None, team=None, source_path=None):
    repo_root = repo_root or ROOT
    category = category or os.environ.get("CATEGORY")
    team = team or os.environ.get("TEAM")
    source_path = source_path or os.environ.get("SOURCE_PATH")

    if not category or not team or not source_path:
        raise ValueError("category, team, and source_path are required")

    if not os.path.isfile(source_path):
        raise FileNotFoundError(source_path)

    target_dir = os.path.join(repo_root, "catalog", category, team)
    os.makedirs(target_dir, exist_ok=True)

    filename = os.path.basename(source_path)
    target_path = os.path.join(target_dir, filename)

    if os.path.exists(target_path):
        raise FileExistsError(f"{target_path} already exists")

    shutil.copy2(source_path, target_path)
    write_manifest(repo_root)
    return target_path


def main():
    parser = argparse.ArgumentParser(description="Add a jersey image to a catalog team folder")
    parser.add_argument("source_path", help="Path to the image file to add")
    parser.add_argument("category", help="Catalog category, e.g. premier-league")
    parser.add_argument("team", help="Team folder name, e.g. chelsea")
    args = parser.parse_args()

    try:
        target_path = add_jersey(
            repo_root=ROOT,
            category=args.category,
            team=args.team,
            source_path=args.source_path,
        )
    except (FileNotFoundError, FileExistsError, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)

    print(f"Added image: {target_path}")
    print("manifest.json updated")


if __name__ == "__main__":
    main()
