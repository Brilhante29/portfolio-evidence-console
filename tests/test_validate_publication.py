from __future__ import annotations

import copy
import importlib.util
import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "tools" / "validate-publication.py"
SPEC = json.loads((ROOT / "benchmarks" / "publication-spec.json").read_text(encoding="utf-8"))
SCHEMA = json.loads(
    (ROOT / ".portfolio" / "contracts" / "benchmark-result-v2.schema.json").read_text(
        encoding="utf-8"
    )
)
RESULT = json.loads((ROOT / "benchmarks" / "publication" / "latest.json").read_text(encoding="utf-8"))

module_spec = importlib.util.spec_from_file_location("validate_publication", MODULE_PATH)
assert module_spec is not None and module_spec.loader is not None
validator = importlib.util.module_from_spec(module_spec)
module_spec.loader.exec_module(validator)


class ValidatePublicationTest(unittest.TestCase):
    def test_current_v2_result_passes(self) -> None:
        validator.validate_result(RESULT, SPEC, SCHEMA)

    def test_duplicate_primary_metric_fails_closed(self) -> None:
        candidate = copy.deepcopy(RESULT)
        candidate["metrics"].append(copy.deepcopy(candidate["metrics"][0]))
        with self.assertRaisesRegex(AssertionError, "exactly once"):
            validator.validate_result(candidate, SPEC, SCHEMA)

    def test_any_failed_metric_fails_closed(self) -> None:
        candidate = copy.deepcopy(RESULT)
        candidate["metrics"][1]["failures"] = 1
        with self.assertRaisesRegex(AssertionError, "contains failures"):
            validator.validate_result(candidate, SPEC, SCHEMA)


if __name__ == "__main__":
    unittest.main()
