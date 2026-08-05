import os
import shutil
import tempfile
import unittest

from add_jersey import add_jersey


class AddJerseyTests(unittest.TestCase):
    def test_adds_image_to_team_folder_and_updates_manifest(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            os.makedirs(os.path.join(tmpdir, "catalog", "premier-league", "chelsea"))
            source_path = os.path.join(tmpdir, "source.png")
            with open(source_path, "wb") as fh:
                fh.write(b"fake-image")

            target_path = add_jersey(
                repo_root=tmpdir,
                category="premier-league",
                team="chelsea",
                source_path=source_path,
            )

            self.assertTrue(os.path.exists(target_path))
            self.assertEqual(os.path.basename(target_path), "source.png")
            self.assertTrue(os.path.exists(os.path.join(tmpdir, "manifest.json")))

            with open(os.path.join(tmpdir, "manifest.json"), "r", encoding="utf-8") as fh:
                manifest = fh.read()

            self.assertIn("premier-league/chelsea", manifest)
            self.assertIn("source.png", manifest)


if __name__ == "__main__":
    unittest.main()
