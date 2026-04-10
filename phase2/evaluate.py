from __future__ import annotations

import json
from pathlib import Path

from demo import naive_baseline, recommend_meals


DATA_DIR = Path(__file__).parent / "data"
ARTIFACTS_DIR = Path(__file__).parent / "artifacts"


def load_scenarios() -> list[dict[str, object]]:
    with (DATA_DIR / "scenarios.json").open("r", encoding="utf-8") as handle:
        return json.load(handle)


def build_benchmark_markdown() -> str:
    lines = [
        "# DormEats Benchmark Snapshot",
        "",
        "| Scenario | Baseline output count | Improved top result | Why the improved output is better |",
        "| --- | ---: | --- | --- |",
    ]

    for scenario in load_scenarios():
        baseline = naive_baseline(scenario)
        improved = recommend_meals(scenario, top_k=1)
        top_name = improved[0]["recipe"]["name"] if improved else "No result"
        rationale = (
            "Uses ingredient overlap, equipment compatibility, and budget-aware ranking."
            if improved
            else "No viable candidate yet; indicates a data gap."
        )
        lines.append(
            f"| {scenario['name']} | {len(baseline)} | {top_name} | {rationale} |"
        )

    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    ARTIFACTS_DIR.mkdir(exist_ok=True)
    output = build_benchmark_markdown()
    path = ARTIFACTS_DIR / "benchmark.md"
    path.write_text(output, encoding="utf-8")
    print(f"Wrote {path}")
