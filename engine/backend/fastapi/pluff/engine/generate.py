"""Turns an Arkzen payload (variant :py) into Python source files for one tatemono.

Mirrors the Laravel builders: same URLs, same response shapes, same class naming.
"""
from __future__ import annotations

import base64
import json
import re

import yaml

from ..runtime.support import lcfirst, prefixed_table, snake, studly

Any = dict

IMPORTS = "from pluff.runtime import *\n"


def dec(b64) -> str:
    if not b64:
        return ""
    try:
        return base64.b64decode(b64).decode("utf-8")
    except Exception:                                  # noqa: BLE001
        return ""


def ind(body: str, spaces: int = 8) -> str:
    pad = " " * spaces
    return "\n".join((pad + l) if l.strip() else l for l in body.split("\n"))


def q(s) -> str:
    return json.dumps(str(s), ensure_ascii=False)


def pluralize(w: str) -> str:
    return w[:-1] + "ies" if w.endswith("y") else w + "es" if w.endswith("s") else w + "s"


def table_to_model(t: str) -> str:
    return studly(re.sub(r"s$", "", t))


def parse_sections(raws) -> Any:
    out: Any = {}
    for raw in raws or []:
        try:
            doc = yaml.safe_load(raw)
        except yaml.YAMLError:
            continue                                   # malformed section: skipped, the parser reports DSL errors
        if isinstance(doc, dict):
            for k, v in doc.items():
                if isinstance(v, dict):
                    out[str(k)] = v
    return out


def find_database_for_model(dbs: list[Any], model: str) -> Any | None:
    snk = snake(model)
    for db in dbs:
        if model.lower() == re.sub(r"s$", "", db["table"]):
            return db
        if snk + "s" == db["table"] or snk == db["table"]:
            return db
    return dbs[0] if dbs else None


def method_body(body: str, name: str, params: str = "self") -> str:
    """A DSL job/console body may be the whole `handle()` method or just its statements."""
    b = body.strip()
    if re.match(rf"^(async\s+)?def\s+{name}\s*\(", b):
        return ind(b if b.startswith("async") else "async " + b, 4)
    return f"    async def {name}({params}):\n{ind(b or 'pass', 8)}"


def generate(p: Any) -> Any:
    slug: str = p["name"]
    dbs: list[Any] = p.get("databases") or []
    apis: list[Any] = p.get("apis") or []
    warnings: list[str] = []
    files: dict[str, str] = {}
    has_auth = bool(p.get("auth"))

    def T(raw: str) -> str:
        return prefixed_table(slug, raw)

    jobs = parse_sections(p.get("jobs"))
    events = parse_sections(p.get("events"))
    consoles = parse_sections(p.get("consoles"))
    notifs = parse_sections(p.get("notifications"))
    mails = parse_sections(p.get("mails"))
    realtimes = parse_sections(p.get("realtimes"))

    # ── models ──
    model_names: dict[str, str] = {}                   # table -> class
    for api in apis:
        db = find_database_for_model(dbs, api["model"])
        if db:
            model_names[db["table"]] = api["model"]
    for db in dbs:
        model_names.setdefault(db["table"], table_to_model(db["table"]))

    cast_map = {"boolean": "boolean", "integer": "integer", "bigInteger": "integer", "decimal": "decimal:2", "float": "float",
                "json": "array", "date": "date", "datetime": "datetime", "timestamp": "datetime"}
    models = f"# ARKZEN GENERATED MODELS: {slug} (FastAPI). Do not edit.\n{IMPORTS}\n"
    if has_auth:
        models += f"User = user_model_for({q(slug)})\n\n\n"
    for db in dbs:
        cls = model_names[db["table"]]
        cols: Any = db.get("columns") or {}
        fillable = [n for n, c in cols.items() if not c.get("primary")]
        casts = {n: cast_map[c.get("type") or "string"] for n, c in cols.items() if (c.get("type") or "string") in cast_map}
        rels: list[str] = []
        for n, c in cols.items():
            if not c.get("foreign"):
                continue
            ref = str(c["foreign"]).split(".")[0]
            rels.append(f"    def {n.replace('_id', '')}(self):\n        return self.belongs_to({model_names.get(ref) or table_to_model(ref)}, {q(n)})\n")
        for other in dbs:
            if other["table"] == db["table"]:
                continue
            for col, cfg in (other.get("columns") or {}).items():
                if cfg.get("foreign") and str(cfg["foreign"]).split(".")[0] == db["table"]:
                    rels.append(f"    def {pluralize(col.replace('_id', ''))}(self):\n        return self.has_many({model_names[other['table']]}, {q(col)})\n")
        models += (f"class {cls}(Model):\n    table = {q(T(db['table']))}\n    connection_name = {q(slug)}\n"
                   f"    fillable = {fillable!r}\n    casts = {casts!r}\n    timestamps = {db.get('timestamps') is not False}\n"
                   f"    soft_deletes = {bool(db.get('softDeletes'))}\n\n" + "\n".join(rels) + "\n\n")
    files["models.py"] = models
    all_models = ([("User")] if has_auth else []) + list(model_names.values())
    model_imports = f"from .models import {', '.join(all_models)}\n" if all_models else ""
    common = IMPORTS + model_imports

    # ── middleware ──
    mw_snippets: Any = p.get("middlewareSnippets") or {}
    mw = f"# ARKZEN GENERATED MIDDLEWARE: {slug}\n{common}\n\n"
    for i, (name, b64) in enumerate(mw_snippets.items()):
        mw += f"async def _mw_{i}(request, response, next):\n{ind(dec(b64).strip() or 'pass', 4)}\n\n\n"
    mw += "middleware_fns = {" + ", ".join(f"{q(n)}: _mw_{i}" for i, n in enumerate(mw_snippets)) + "}\n"
    files["middleware.py"] = mw

    # ── policies ──
    pol_snippets: Any = p.get("policySnippets") or {}
    pol = f"# ARKZEN GENERATED POLICIES: {slug}\n{common}\n\n"
    policy_names: list[str] = []
    for api in [a for a in apis if a.get("policy")]:
        db = find_database_for_model(dbs, api["model"])
        owner = next((c for c in ("user_id", "owner_id", "created_by", "author_id") if db and (db.get("columns") or {}).get(c)), None)
        v = snake(api["model"])
        default = f"return (user is not None and user.id == {v}.{owner}) or (user is not None and user.role == 'admin')" if owner \
            else "return user is not None and user.role == 'admin'"

        def body(k: str) -> str:
            b = dec(pol_snippets.get(k)).strip()
            return b or default

        pol += (f"class {api['model']}Policy:\n    def view_any(self, user):\n        return True\n\n"
                f"    def view(self, user, {v}):\n        return True\n\n    def create(self, user):\n        return True\n\n"
                f"    async def update(self, user, {v}):\n{ind(body('update'), 8)}\n\n"
                f"    async def delete(self, user, {v}):\n{ind(body('delete'), 8)}\n\n\n")
        policy_names.append(f"{api['model']}Policy")
    files["policies.py"] = pol

    # ── controllers ──
    controller_names: list[str] = []
    ctl = f"# ARKZEN GENERATED CONTROLLERS: {slug}\n{common}"
    if policy_names:
        ctl += f"from .policies import {', '.join(policy_names)}\n"
    ctl += "from .mails import mail_classes\nfrom .notifications import notification_classes\nfrom .realtime import MessageSentEvents\n\n\n"

    def rules(v: Any | None) -> str:
        return repr({k: str(r) for k, r in (v or {}).items()})

    for api in apis:
        M: str = api["model"]
        v = snake(M)
        use_policy = bool(api.get("policy"))
        methods: list[str] = []
        for name, ep in (api.get("endpoints") or {}).items():
            def auth(a: str) -> str:
                if not use_policy:
                    return ""
                return f"await authorize(request, {M}Policy, {q(a)}{'' if a == 'create' else ', ' + v})\n"

            find = f"{v} = await {M}.find_or_fail(request.route('id'))\n"
            resp_type = (ep.get("response") or {}).get("type") or ""
            etype = ep.get("type")
            lines: str
            if name == "index":
                query = ep.get("query") or {}
                m = re.search(r"default:(\d+)", str(query.get("per_page") or ""))
                per_page = m.group(1) if m else "15"
                s = "query = " + f"{M}.query()\n"
                if "search" in query:
                    s += ("if request.filled('search'):\n    term = '%' + str(request.input('search')) + '%'\n"
                          "    def _search(w):\n        w.or_where('name', 'like', term)\n        w.or_where('description', 'like', term)\n"
                          "    query.where(_search)\n")
                for k in [k for k in query if k not in ("search", "per_page")]:
                    s += f"if request.filled({q(k)}):\n    query.where({q(k)}, request.input({q(k)}))\n"
                if resp_type == "array":
                    s += "return response.json(await query.order_by('created_at', 'desc').get())\n"
                else:
                    s += f"return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', {per_page}), request.input('page', 1), request.url()))\n"
                lines = s
            elif name == "store":
                if etype == "broadcast":
                    lines = (f"validated = await request.validate({rules(ep.get('validation'))})\nmessage = await {M}.create(validated)\n"
                             "channel_type = validated.get('channel_type') or 'public'\n_u = await request.auth_user()\n"
                             "ev = MessageSentEvents[channel_type](message.to_json())\nev.user_id = _u.id if _u else None\nbroadcast(ev)\n"
                             "return response.json(message, 201)\n")
                elif etype == "mail_send":
                    lines = (f"validated = await request.validate({rules(ep.get('validation'))})\nuser = await request.auth_user()\n"
                             "Cls = mail_classes.get(validated['mail'])\nif Cls is None:\n    raise Exception('Unknown mail type: ' + str(validated['mail']))\n"
                             "await Mail.to(validated['to']).send(Cls(*list((validated.get('data') or {}).values())))\n"
                             f"mail_log = await {M}.create({{'user_id': user.id if user else None, 'to_email': validated['to'], 'subject': Cls.subject or validated['mail'], 'mail_class': Cls.__name__, 'status': 'sent'}})\n"
                             "return response.json(mail_log, 201)\n")
                elif etype == "notification_trigger":
                    lines = (f"validated = await request.validate({rules(ep.get('validation'))})\nuser = request.user()\n"
                             "Cls = notification_classes.get(validated['notification'])\nif Cls is None:\n    raise Exception('Unknown notification type: ' + str(validated['notification']))\n"
                             "await notify(user, Cls(user))\nreturn response.json({'message': 'Notification triggered successfully', 'type': validated['notification']}, 201)\n")
                elif etype in ("upload", "upload_index", "upload_destroy", "upload_url"):
                    lines = "return response.json({'message': 'Upload endpoints are not supported on the FastAPI backend yet'}, 501)\n"
                else:
                    lines = (f"{auth('create')}validated = await request.validate({rules(ep.get('validation'))})\n"
                             f"{v} = await {M}.create(validated)\nreturn response.json({v}, 201)\n")
            elif name == "show":
                lines = f"{find}return response.json({v})\n"
            elif name == "update":
                lines = f"{find}{auth('update')}validated = await request.validate({rules(ep.get('validation'))})\nawait {v}.update(validated)\nreturn response.json({v})\n"
            elif name == "destroy":
                if etype == "upload_destroy":
                    lines = "return response.json({'message': 'Upload endpoints are not supported on the FastAPI backend yet'}, 501)\n"
                else:
                    msg = (ep.get("response") or {}).get("value") or f"{M} deleted successfully"
                    lines = f"{find}{auth('delete')}await {v}.delete()\nreturn response.json({{'message': {q(msg)}}})\n"
            elif name == "fileUrl":
                lines = "return response.json({'message': 'Upload endpoints are not supported on the FastAPI backend yet'}, 501)\n"
            elif name == "adminOnly":
                lines = (f"user = request.user()\ngranted = bool(user) and user.role == 'admin'\n"
                         f"await {M}.create({{'user_id': user.id if user else None, 'action': 'GET /admin-only', 'role_required': 'admin', 'granted': granted}})\n"
                         "if not granted:\n    return response.json({'message': '\\u2717 Access denied \\u2014 admin role required'}, 403)\n"
                         "return response.json({'message': '\\u2713 Access granted \\u2014 you are admin'})\n")
            elif name == "userOnly":
                lines = (f"user = request.user()\nawait {M}.create({{'user_id': user.id if user else None, 'action': 'GET /user-only', 'role_required': 'user', 'granted': True}})\n"
                         "return response.json({'message': '\\u2713 Access granted \\u2014 open to all authenticated users'})\n")
            elif name == "promote":
                lines = "user = request.user()\nawait user.update({'role': 'admin'})\nreturn response.json({'message': 'Promoted to admin', 'user': await user.fresh()})\n"
            elif name == "demote":
                lines = "user = request.user()\nawait user.update({'role': 'user'})\nreturn response.json({'message': 'Demoted to user', 'user': await user.fresh()})\n"
            else:
                b = dec(ep.get("body")).strip()
                lines = (b + "\n") if b else (f"# Custom endpoint: {name}\n# Add @arkzen:endpoint:py:{name} ... :end to your tatemono to inject logic.\n"
                                              f"return response.json({{'message': {q(f'Endpoint {name} is not implemented yet')}}}, 501)\n")
            methods.append(f"    @staticmethod\n    async def {name}(request, response):\n{ind(lines.rstrip(chr(10)), 8)}\n")
        ctl += f"class {api['controller']}:\n" + "\n".join(methods) + "\n\n"
        controller_names.append(api["controller"])

    for cr in p.get("customRoutes") or []:
        methods = []
        for r in cr.get("routes") or []:
            b = dec(r.get("body")).strip()
            stub_msg = q("Handler " + str(r["handler"]) + " is not implemented yet")
            body = b or f"return response.json({{'message': {stub_msg}}}, 501)"
            methods.append(f"    @staticmethod\n    async def {r['handler']}(request, response, *params):\n{ind(body, 8)}\n")
        ctl += f"class {cr['controller']}:\n" + "\n".join(methods) + "\n\n"
        controller_names.append(cr["controller"])
    files["controllers.py"] = ctl

    # ── jobs ──
    jb = f"# ARKZEN GENERATED JOBS: {slug}\n{common}\n\n"
    job_classes: list[str] = []
    for name, cfg in jobs.items():
        cls = f"{studly(name)}Job"
        body = dec(cfg.get("body")).strip() or f"Log.info('[Arkzen Job] Running: {cls}', self.data)"
        jb += (f"class {cls}(Job):\n    tatemono = {q(slug)}\n    queue = {q(cfg.get('queue') or 'default')}\n"
               f"    tries = {int(cfg.get('tries') or 3)}\n    timeout = {int(cfg.get('timeout') or 60)}\n{method_body(body, 'handle')}\n\n\n")
        job_classes.append(cls)
    files["jobs.py"] = jb

    # ── events + listeners ──
    ev = f"# ARKZEN GENERATED EVENTS + LISTENERS: {slug}\n{common}\nfrom . import models as _models\n\n\n"
    event_classes: list[str] = []
    listener_classes: list[str] = []
    listener_map: dict[str, list[str]] = {}
    for name, cfg in events.items():
        cls = studly(name)
        ev += f"class {cls}(Event):\n    tatemono = {q(slug)}\n\n\n"
        event_classes.append(cls)
        try:
            bodies = json.loads(dec(cfg.get("listener_bodies")) or "{}")
        except ValueError:
            bodies = {}
        raw_l = cfg.get("listeners")
        names = raw_l if isinstance(raw_l, list) else str(raw_l or "").split(",")
        for l in [str(s).strip() for s in names if str(s).strip()]:
            body = dec(bodies.get(l)).strip()
            stub = (f"EventLog = getattr(_models, 'EventLog', None)\nif EventLog:\n    await EventLog.create({{'event_name': {q(name)}, 'listener': {q(l)}, 'payload': json.dumps(event.data)}})\n"
                    f"else:\n    Log.info('[Arkzen Listener] {l}', event.data)")
            ev += f"class {l}(Listener):\n    async def handle(self, event):\n{ind(body or stub, 8)}\n\n\n"
            listener_classes.append(l)
            listener_map.setdefault(cls, []).append(l)
    files["events.py"] = "import json\n" + ev

    # ── console commands ──
    cm = f"# ARKZEN GENERATED COMMANDS: {slug}\n{common}\n\n"
    cmd_classes: list[str] = []
    for name, cfg in consoles.items():
        cls = studly(name)
        sig = cfg.get("signature") or f"{slug}:{name}"
        body = dec(cfg.get("body")).strip() or f"self.info('[Arkzen:{slug}] Running: {sig}')\nreturn Command.SUCCESS"
        sched = repr(str(cfg["schedule"])) if cfg.get("schedule") else "None"
        cm += (f"class {cls}(Command):\n    signature = {q(sig)}\n    description = {q(cfg.get('description') or '')}\n"
               f"    schedule = {sched}\n{method_body(body, 'handle')}\n\n\n")
        cmd_classes.append(cls)
    files["commands.py"] = cm

    # ── mail ──
    ml = f"# ARKZEN GENERATED MAIL: {slug}\n{IMPORTS}\n\n"
    mail_map: list[str] = []
    for name, cfg in mails.items():
        cls = f"{studly(name)}Mail"
        fields = ["mail_message" if f == "message" else f for f in (cfg.get("data") or {}).keys()]
        tpl = dec(cfg.get("blade_body")) or f"<p>{cfg.get('subject') or cls}</p>" + "".join(f"<p>{{{{ {f} }}}}</p>" for f in fields)
        sig = ", ".join(f"{f}=None" for f in fields)
        ml += (f"class {cls}(Mailable):\n    subject = {q(cfg.get('subject') or cls)}\n    template = {q(tpl)}\n\n"
               f"    def __init__(self{', ' + sig if sig else ''}):\n        super().__init__({{{', '.join(f'{q(f)}: {f}' for f in fields)}}})\n\n\n")
        for k in dict.fromkeys([name, name.replace("_", "-")]):
            mail_map.append(f"{q(k)}: {studly(name)}Mail")
    ml += "mail_classes = {" + ", ".join(mail_map) + "}\n"
    files["mails.py"] = ml

    # ── notifications ──
    nt = f"# ARKZEN GENERATED NOTIFICATIONS: {slug}\n{IMPORTS}\n\n"
    notif_map: list[str] = []
    for name, cfg in notifs.items():
        cls = f"{studly(name)}Notification"
        ch = cfg.get("channels")
        channels = ch if isinstance(ch, list) else [s.strip() for s in str(ch or "database").split(",")]
        msg = cfg.get("message") or "You have a new notification."
        mail_body = dec(cfg.get("toMail_body")).strip()
        to_mail = (f"    def to_mail(self, notifiable):\n{ind(mail_body, 8)}\n" if mail_body else
                   f"    def to_mail(self, notifiable):\n        return MailMessage().subject({q(cfg.get('subject') or cls)}).line({q(msg)})\n")
        nt += (f"class {cls}(Notification):\n    tatemono = {q(slug)}\n    channels = {channels!r}\n\n"
               f"    def to_database(self, notifiable):\n        return {{'message': {q(msg)}, 'type': {q(cls)}}}\n\n{to_mail}\n\n")
        for k in dict.fromkeys([name, name.replace("_", "-")]):
            notif_map.append(f"{q(k)}: {studly(name)}Notification")
    nt += "notification_classes = {" + ", ".join(notif_map) + "}\n"
    files["notifications.py"] = nt

    # ── realtime (broadcast events) ──
    rt = f"# ARKZEN GENERATED REALTIME: {slug}\n{IMPORTS}\n\n"
    bc_classes: list[tuple[str, str]] = []
    for name, cfg in realtimes.items():
        if not cfg.get("channel"):
            continue                                   # channel declarations only; auth is handled by /broadcasting/auth
        typ = cfg.get("type") or "public"
        cls = studly(name)
        channel = re.sub(r"\.\{id\}$", "", str(cfg["channel"]))
        rt += (f"class {cls}(BroadcastEvent):\n    tatemono = {q(slug)}\n    channel_type = {q(typ)}\n    channel = {q(channel)}\n"
               f"    event_name = {q(f'{slug}.{name}')}\n\n\n")
        bc_classes.append((typ, cls))
    first: dict[str, str] = {}
    for typ, cls in bc_classes:
        first.setdefault(typ, cls)
    rt += "MessageSentEvents = {" + ", ".join(f"{q(t)}: {first[t]}" for t in ("public", "private", "presence") if t in first) + "}\n"
    files["realtime.py"] = rt

    # ── routes ──
    prefix = f"/api/{slug}"
    rts = (f"# ARKZEN GENERATED ROUTES: {slug}\n{common}from . import controllers as C\nfrom .middleware import middleware_fns\n\n\n"
           f"def build_router():\n    S = {q(slug)}\n    r = Router(S)\n\n    def mw(name):\n"
           "        if name == 'auth' or name.startswith('auth:'):\n            return auth_middleware(S)\n"
           "        if name.startswith('role:'):\n            return role_middleware(*name[5:].split(','))\n"
           "        fn = middleware_fns.get(name)\n        if fn is None:\n            raise Exception('Unknown middleware: ' + name)\n"
           "        return middleware(S, fn)\n\n")
    if has_auth:
        rts += f"    register_auth_routes(r, S, {q(prefix)})\n"
    for api in apis:
        for name, ep in (api.get("endpoints") or {}).items():
            chain = [f"mw({q(str(m).strip())})" for m in (api.get("middleware") or [])]
            if ep.get("type") in ("broadcast", "mail_send") and not chain:
                chain.append("optional_auth(S)")
            path = f"{api.get('prefix') or ''}{ep.get('route') or ''}"
            rts += f"    r.add({q(str(ep.get('method') or 'GET').upper())}, {q(path)}, [{', '.join(chain)}], handle(S, C.{api['controller']}.{name}))\n"
    for cr in p.get("customRoutes") or []:
        chain = [f"mw({q(str(m).strip())})" for m in (cr.get("middleware") or [])]
        for r in cr.get("routes") or []:
            rts += (f"    r.add({q(str(r.get('method') or 'GET').upper())}, {q(r['route'])}, [{', '.join(chain)}], "
                    f"handle(S, lambda rq, rs: C.{cr['controller']}.{r['handler']}(rq, rs, *rq.route().values())))\n")
    rts += "    return r\n"
    files["routes.py"] = rts

    # ── module entry ──
    def imp(names: list[str], f: str) -> str:
        return f"from .{f} import {', '.join(names)}\n" if names else ""

    files["__init__.py"] = (
        f"# ARKZEN GENERATED MODULE ENTRY: {slug}\nfrom .routes import build_router\n"
        + imp(job_classes, "jobs") + imp(event_classes + listener_classes, "events") + imp(cmd_classes, "commands")
        + f"\nname = {q(slug)}\nrouter = build_router()\n"
        f"jobs = {{{', '.join(f'{q(c)}: {c}' for c in job_classes)}}}\n"
        f"listeners = {{{', '.join(f'{q(c)}: {c}' for c in listener_classes)}}}\n"
        f"events = {{{', '.join(f'{q(c)}: {c}' for c in event_classes)}}}\n"
        f"listener_map = {listener_map!r}\ncommands = [{', '.join(cmd_classes)}]\n")

    return {"files": files,
            "registry": {"models": list(model_names.values()) + (["User"] if has_auth else []), "controllers": controller_names,
                         "tables": [T(d["table"]) for d in dbs]},
            "warnings": warnings}
