"""Local public disk (storage/public), served at /storage."""
from __future__ import annotations

import secrets
from pathlib import Path

from .support import BACKEND_DIR, ensure_dir, env

__all__ = ["STORAGE_ROOT", "Storage"]

STORAGE_ROOT = BACKEND_DIR / "storage" / "public"


class _Storage:
    @staticmethod
    def _path(rel: str) -> Path:
        path = (STORAGE_ROOT / rel).resolve()
        if not path.is_relative_to(STORAGE_ROOT.resolve()):
            raise ValueError("Storage path must remain inside the public disk")
        return path

    @staticmethod
    def put(directory: str, file: dict) -> str:
        ext = Path(file["originalname"]).suffix
        relative_dir = Path(directory)
        if relative_dir.is_absolute() or ".." in relative_dir.parts:
            raise ValueError("Storage directory must be relative to the public disk")
        rel = (relative_dir / f"{secrets.token_hex(16)}{ext}").as_posix()
        path = _Storage._path(rel)
        ensure_dir(path.parent)
        path.write_bytes(file["buffer"])
        return rel

    @staticmethod
    def delete(rel: str) -> None:
        p = _Storage._path(rel)
        if p.exists():
            p.unlink()

    @staticmethod
    def exists(rel: str) -> bool:
        return _Storage._path(rel).is_file()

    @staticmethod
    def path(rel: str) -> Path:
        return _Storage._path(rel)

    @staticmethod
    def read(rel: str) -> bytes:
        return _Storage._path(rel).read_bytes()

    @staticmethod
    def url(rel: str) -> str:
        return f"{env('APP_URL', 'http://localhost:8000')}/storage/{rel}"


Storage = _Storage()
