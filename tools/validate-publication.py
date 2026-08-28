from __future__ import annotations

import argparse
import importlib.util
import json
import re
import subprocess
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SPEC_PATH = ROOT / "benchmarks" / "publication-spec.json"
VENDORED_SCHEMA_PATH = ROOT / ".portfolio" / "contracts" / "benchmark-result-v2.schema.json"
ROOT_SCHEMA_PATH = ROOT / "contracts" / "benchmark-result-v2.schema.json"
SCHEMA_PATH = VENDORED_SCHEMA_PATH if VENDORED_SCHEMA_PATH.is_file() else ROOT_SCHEMA_PATH
PRODUCER_PATH = ROOT / "tools" / "generate-publication-benchmark.py"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def read_json(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    require(isinstance(value, dict), f"{path.relative_to(ROOT)} must contain an object")
    return value


def relative_path(value: str) -> Path:
    path = (ROOT / value).resolve()
    path.relative_to(ROOT)
    return path


def load_producer() -> Any:
    spec = importlib.util.spec_from_file_location("publication_benchmark", PRODUCER_PATH)
    require(spec is not None and spec.loader is not None, "cannot load publication producer")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def git_has_commit(commit: str) -> bool:
    completed = subprocess.run(
        ["git", "-c", f"safe.directory={ROOT}", "-C", str(ROOT), "cat-file", "-e", f"{commit}^{{commit}}"],
        capture_output=True,
        check=False,
    )
    return completed.returncode == 0


def validate_result(result: dict[str, Any], spec: dict[str, Any], schema: dict[str, Any]) -> None:
    import jsonschema

    jsonschema.Draft202012Validator(
        schema, format_checker=jsonschema.FormatChecker()
    ).validate(result)
    require(result.get("project") == spec["project"], "unexpected V2 project")
    require(result.get("benchmark_id") == spec["benchmark_id"], "unexpected benchmark id")
    metrics = [item for item in result["metrics"] if item["name"] == spec["primary_metric"]]
    require(len(metrics) == 1, "V2 must contain the primary metric exactly once")
    require(all(item["failures"] == 0 for item in result["metrics"]), "V2 contains failures")
    require(result["execution"]["exit_code"] == 0, "benchmark execution failed")
    require(result["execution"]["repeat"] == spec["repeat"], "execution repeat mismatch")
    workload = result["workload"]
    require(workload["measured_iterations"] == spec["measured_iterations"], "measured iteration mismatch")
    require(workload["warmup_iterations"] == spec["warmup_iterations"], "warmup mismatch")
    require(workload["concurrency"] == spec["concurrency"], "concurrency mismatch")
    require(result["comparability_key"] == spec["comparability_key"], "comparability key mismatch")
    provenance = result["provenance"]
    require(provenance["clean_tree"] is True, "publication source tree was not clean")
    require(re.fullmatch(r"[0-9a-f]{40}", provenance["source_commit"]) is not None, "invalid source commit")
    require(re.fullmatch(r"sha256:[0-9a-f]{64}", provenance["image_digest"]) is not None, "invalid image digest")
    require(re.fullmatch(r"sha256:[0-9a-f]{64}", provenance["artifact_digest"]) is not None, "invalid artifact digest")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--require-git", action="store_true")
    args = parser.parse_args()
    spec = read_json(SPEC_PATH)
    result_path = relative_path(spec["result_path"])
    publication_path = relative_path(spec["publication_path"])
    config_path = relative_path(spec["config_path"])
    fixture_path = relative_path(spec["fixture_path"])
    lock_path = relative_path(spec["lock_path"])
    manifest = (ROOT / "project.yaml").read_text(encoding="utf-8")
    published = re.search(r"(?m)^status:\s*published\s*$", manifest) is not None
    if not publication_path.is_file():
        require(not published, "published project requires V2 evidence")
        print("publication_evidence=not-applicable")
        return

    result = read_json(result_path)
    publication = read_json(publication_path)
    schema = read_json(SCHEMA_PATH)
    validate_result(publication, spec, schema)
    require(result == publication, "result and publication artifacts differ")
    provenance = publication["provenance"]
    workload = publication["workload"]
    require(
        f"result_path: {spec['result_path']}" in manifest,
        "manifest V2 result path mismatch",
    )
    require(
        f"publication_result_path: {spec['publication_path']}" in manifest,
        "manifest V2 publication path mismatch",
    )
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    normalized_readme = readme.replace(",", "")
    require(spec["primary_metric"] in readme, "README is missing the primary metric name")
    for metric_name in spec["readme_metrics"]:
        metric = [item for item in publication["metrics"] if item["name"] == metric_name]
        require(len(metric) == 1, f"publication metric missing or duplicated: {metric_name}")
        value = str(metric[0]["value"])
        require(value in normalized_readme, f"README is missing publication value: {metric_name}={value}")

    if args.require_git:
        source_commit = provenance["source_commit"]
        require(git_has_commit(source_commit), "source commit unavailable; fetch full history")
        producer = load_producer()
        require(
            workload["fixture_digest"] == producer.digest_committed_path(ROOT, fixture_path, source_commit),
            "committed fixture digest mismatch",
        )
        require(
            workload["config_digest"] == producer.digest_committed_path(ROOT, config_path, source_commit),
            "committed config digest mismatch",
        )
        require(
            provenance["dependency_lock_digest"] == producer.digest_committed_path(ROOT, lock_path, source_commit),
            "committed dependency lock digest mismatch",
        )

    serialized = json.dumps({"result": result, "publication": publication})
    for forbidden in ("C:\\Users\\", "github" + "_pat_", "gh" + "p_"):
        require(forbidden not in serialized, f"forbidden value in evidence: {forbidden}")
    print("publication_evidence=passed")


if __name__ == "__main__":
    main()
