"""Notifications: database (Laravel-compatible table), mail and broadcast channels."""
from __future__ import annotations

import json
import uuid

from .broadcast import broadcast_to
from .database import connection
from .mail import Mailable, render_template, send_mail
from .support import prefixed_table, sql_now

__all__ = ["MailMessage", "Notification", "notify"]


class MailMessage:
    def __init__(self):
        self.subject_ = ""
        self.lines: list[str] = []
        self.action_text = ""
        self.action_url = ""

    def subject(self, s: str):
        self.subject_ = s
        return self

    def line(self, s: str):
        self.lines.append(s)
        return self

    def action(self, text: str, url: str):
        self.action_text, self.action_url = text, url
        return self

    def html(self) -> str:
        out = "".join(f"<p>{l}</p>" for l in self.lines)
        return out + (f'<p><a href="{self.action_url}">{self.action_text}</a></p>' if self.action_url else "")


class Notification:
    tatemono = ""
    channels: list[str] = ["database"]
    subject = ""
    template = ""

    def __init__(self, notifiable=None, data: dict | None = None):
        self.notifiable = notifiable
        self.data = data or {}

    def via(self, notifiable) -> list[str]:
        return type(self).channels

    def to_mail(self, notifiable):
        C = type(self)
        if not C.template and not C.subject:
            return None
        body = render_template(C.template, {**self.data, "name": getattr(notifiable, "name", None), "email": getattr(notifiable, "email", None)})
        return MailMessage().subject(C.subject).line(body)

    def to_database(self, notifiable) -> dict:
        return {"type": type(self).__name__, **self.data}

    def to_broadcast(self, notifiable) -> dict:
        return self.to_database(notifiable)


async def notify(notifiable, n: Notification) -> None:
    """$user->notify(new X($user)) equivalent. Table: <prefix>_notifications (Laravel-compatible shape)."""
    slug = type(n).tatemono
    for ch in n.via(notifiable):
        if ch == "database":
            db = connection(slug)
            t = prefixed_table(slug, "notifications")
            if db.has_table(t):
                ts = sql_now()
                db.insert(t, {"id": str(uuid.uuid4()), "type": type(n).__name__, "notifiable_type": "user",
                              "notifiable_id": notifiable.id, "data": json.dumps(n.to_database(notifiable), separators=(",", ":")),
                              "read_at": None, "created_at": ts, "updated_at": ts}, pk="id")
        elif ch == "mail":
            m = n.to_mail(notifiable)
            if m and getattr(notifiable, "email", None):
                class _Built(Mailable):
                    def build(self_inner):                       # noqa: N805
                        return {"subject": m.subject_, "html": m.html()}
                await send_mail(notifiable.email, _Built({}))
        elif ch == "broadcast":
            broadcast_to(f"private-{slug}.{notifiable.id}", "Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
                         n.to_broadcast(notifiable))
