"""Exceptions that map to Laravel's default JSON error responses."""
from __future__ import annotations

__all__ = [
    "HttpException", "ValidationException", "AuthenticationException", "AuthorizationException",
    "ModelNotFoundException", "abort",
]


class HttpException(Exception):
    def __init__(self, status: int, message: str = "", headers: dict | None = None):
        super().__init__(message)
        self.status = status
        self.message = message
        self.headers = headers or {}


class ValidationException(Exception):
    def __init__(self, errors: dict[str, list[str]]):
        super().__init__("The given data was invalid.")
        self.errors = errors

    @staticmethod
    def with_messages(errors: dict) -> "ValidationException":
        return ValidationException({k: (v if isinstance(v, list) else [v]) for k, v in errors.items()})

    def summary(self) -> str:
        allm = [m for v in self.errors.values() for m in v]
        extra = len(allm) - 1
        if extra > 0:
            return f"{allm[0]} (and {extra} more error{'s' if extra > 1 else ''})"
        return allm[0] if allm else "The given data was invalid."


class AuthenticationException(Exception):
    def __init__(self):
        super().__init__("Unauthenticated.")


class AuthorizationException(Exception):
    def __init__(self, message: str = "This action is unauthorized."):
        super().__init__(message)
        self.message = message


class ModelNotFoundException(Exception):
    def __init__(self, model: str, ids: list | None = None):
        ids = ids or []
        suffix = (" " + ", ".join(str(i) for i in ids)) if ids else ""
        super().__init__(f"No query results for model [{model}]{suffix}")
        self.model = model
        self.ids = ids
        self.message = str(self.args[0])


def abort(status: int, message: str = ""):
    raise HttpException(status, message)
