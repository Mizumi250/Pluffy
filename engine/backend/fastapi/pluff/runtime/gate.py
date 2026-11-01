"""$this->authorize('update', $model) equivalent."""
from __future__ import annotations

import inspect

from .errors import AuthorizationException

__all__ = ["authorize"]


async def authorize(request, policy_cls, ability: str, *args) -> None:
    """Policy methods receive (user | None, *args) and may be sync or async."""
    policy = policy_cls()
    fn = getattr(policy, ability, None)
    if not callable(fn):
        raise AuthorizationException()
    ok = fn(request.user(), *args)
    if inspect.isawaitable(ok):
        ok = await ok
    if not ok:
        raise AuthorizationException()
