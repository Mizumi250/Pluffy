"""Mail: Blade-compatible placeholders, log mailer by default, SMTP when MAIL_MAILER=smtp."""
from __future__ import annotations

import asyncio
import html as _html
import re
import smtplib
from email.message import EmailMessage

from .support import Log, env

__all__ = ["render_template", "Mailable", "send_mail", "Mail"]


def render_template(tpl: str, data: dict) -> str:
    """Renders {{ name }} / {{ $name }} / {!! name !!} placeholders (a small Blade-compatible subset)."""
    def get(path: str):
        cur = data
        for k in re.split(r"->|\.", path.lstrip("$")):
            cur = cur.get(k) if isinstance(cur, dict) else getattr(cur, k, None) if cur is not None else None
        return cur

    def raw(m):
        v = get(m.group(1))
        return "" if v is None else str(v)

    def esc(m):
        v = get(m.group(1))
        return _html.escape("" if v is None else str(v), quote=True).replace("&#x27;", "&#39;")

    tpl = re.sub(r"\{!!\s*([\w$.>-]+)\s*!!\}", raw, tpl)
    return re.sub(r"\{\{\s*([\w$.>-]+)\s*\}\}", esc, tpl)


class Mailable:
    subject = ""
    template = ""

    def __init__(self, data: dict | None = None):
        self.data = data or {}

    def html(self) -> str:
        return render_template(type(self).template, self.data)

    def build(self) -> dict:
        """Override in a :py body to build fully custom content."""
        return {"subject": type(self).subject, "html": self.html()}


def _smtp_send(msg: EmailMessage) -> None:
    host, port = env("MAIL_HOST", "127.0.0.1"), int(env("MAIL_PORT", "587") or 587)
    with smtplib.SMTP(host, port, timeout=20) as s:
        user = env("MAIL_USERNAME")
        if user:
            s.starttls()
            s.login(user, env("MAIL_PASSWORD") or "")
        s.send_message(msg)


async def send_mail(to: str, mailable: Mailable) -> dict:
    built = mailable.build()
    msg = EmailMessage()
    msg["From"], msg["To"], msg["Subject"] = env("MAIL_FROM_ADDRESS", "hello@example.com"), to, built["subject"]
    msg.set_content(re.sub(r"<[^>]+>", " ", built["html"]))
    msg.add_alternative(built["html"], subtype="html")
    if env("MAIL_MAILER", "log") == "smtp":
        await asyncio.to_thread(_smtp_send, msg)
    else:
        Log.info(f'[mail:log] to={to} subject="{built["subject"]}"')
    return {"to": to, "subject": built["subject"]}


class _Pending:
    def __init__(self, address: str):
        self.address = address

    async def send(self, mailable: Mailable):
        return await send_mail(self.address, mailable)


class _Mail:
    @staticmethod
    def to(address: str) -> _Pending:
        return _Pending(address)


Mail = _Mail()
