import os
import json
import re
import datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
CATALOG_ROOT = os.path.join(ROOT, "catalog")
OUT = os.path.join(ROOT, "manifest.json")

manifest = {
    "generatedAt": datetime.datetime.utcnow().isoformat() + "Z",
    "items": {}
}

for category in sorted(os.listdir(CATALOG_ROOT)):
    cat_path = os.path.join(CATALOG_ROOT, category)
    if not os.path.isdir(cat_path):
        continue

    # slike direktno u kategoriji
    category_images = []
    for name in sorted(os.listdir(cat_path)):
        full_path = os.path.join(cat_path, name)
        if os.path.isfile(full_path) and re.search(r"\.(jpg|jpeg|png|webp|gif)$", name, re.I):
            category_images.append(f"catalog/{category}/{name}")

    if category_images:
        manifest["items"][category] = category_images

    # slike po timovima
    for team in sorted(os.listdir(cat_path)):
        team_path = os.path.join(cat_path, team)
        if not os.path.isdir(team_path):
            continue

        images = []
        for name in sorted(os.listdir(team_path)):
            if re.search(r"\.(jpg|jpeg|png|webp|gif)$", name, re.I):
                images.append(f"catalog/{category}/{team}/{name}")

        manifest["items"][f"{category}/{team}"] = images

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print("manifest.json updated")