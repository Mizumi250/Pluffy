"""Runs the shared validation vectors (engine/backend/conformance/validation-vectors.json)
against the FastAPI validator. Expected results follow Laravel / the Express reference runtime."""
import asyncio
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from pluff.runtime.errors import ValidationException  # noqa: E402
from pluff.runtime.validation import validate  # noqa: E402

VECTORS = json.loads((pathlib.Path(__file__).with_name("validation-vectors.json")).read_text())


def _passes(vector) -> bool:
    data = dict(vector.get("data") or {})
    if "value" in vector:
        data["field"] = vector["value"]
    try:
        asyncio.run(validate(data, {"field": vector["rule"]}))
        return True
    except ValidationException:
        return False


def test_validation_conformance_vectors():
    failures = [f"{v['rule']!r} value={v.get('value', '<missing>')!r} data={v.get('data')} expected pass={v['pass']}"
                for v in VECTORS if _passes(v) != v["pass"]]
    assert not failures, "\n" + "\n".join(failures)
