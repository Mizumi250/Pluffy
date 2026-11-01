"""Local public disk (storage/public), served at /storage."""
from __future__ import annotations

import secrets
from pathlib import Path

from .support import BACKEND_DIR, ensure_dir, env

__all__ = ["STORAGE_ROOT", "Storage"]

STORAGE_ROOT = BACKEND_DIR / "storage" / "public"


class _Storage:
    @staticmethod
    def put(directory: str, file: dict) -> str:
        ext = Path(file["originalname"]).suffix
        rel = f"{directory}/{secrets.token_hex(16)}{ext}"
        ensure_dir(STORAGE_ROOT / directory)
        (STORAGE_ROOT / rel).write_bytes(file["buffer"])
        return rel

    @staticmethod
    def delete(rel: str) -> None:
        p = STORAGE_ROOT / rel
        if p.exists():
            p.unlink()

    @staticmethod
    def exists(rel: str) -> bool:
        return (STORAGE_ROOT / rel).exists()

    @staticmethod
    def url(rel: str) -> str:
        return f"{env('APP_URL', 'http://localhost:8000')}/storage/{rel}"


Storage = _Storage()
