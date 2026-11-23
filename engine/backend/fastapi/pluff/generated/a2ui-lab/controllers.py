# ARKZEN GENERATED CONTROLLERS: a2ui-lab
from pluff.runtime import *
from .models import Service, RepairTicket, Booking, UnmetRequest
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class ServiceController:
    @staticmethod
    async def index(request, response):
        query = Service.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 50), request.input('page', 1), request.url()))


class RepairTicketController:
    @staticmethod
    async def index(request, response):
        query = RepairTicket.query()
        if request.filled("code"):
            query.where("code", request.input("code"))
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 5), request.input('page', 1), request.url()))


class BookingController:
    @staticmethod
    async def store(request, response):
        validated = await request.validate({'name': 'required|string|max:80', 'service': 'required|string|max:80', 'day': 'required|string|max:10', 'slot': 'required|string|max:5'})
        booking = await Booking.create(validated)
        return response.json(booking, 201)


class AssistantController:
    @staticmethod
    async def plan(request, response):
        import asyncio
        import ipaddress
        import json
        import re
        import urllib.parse
        import urllib.error
        import urllib.request

        validated = await request.validate({'message': 'required|string|max:500'})
        text = validated['message'].strip()

        MENU = {
            'booking_form': {
                'allowed': ['service'],
                'use': 'Book a workshop slot. Use when the visitor wants to book, schedule or reserve. Optional prop "service": one of Basic tune-up, Chain replacement, Brake adjustment, Puncture repair, Full overhaul, only if they named it.',
            },
            'price_list': {
                'allowed': [],
                'use': 'Show the service price list. Use when the visitor asks about price, cost or how much.',
            },
            'repair_status': {
                'allowed': ['code'],
                'use': 'Look up a repair ticket. Use when the visitor asks whether their bike is ready or about a repair. Optional prop "code" like RR-2041, only if they gave it.',
            },
        }
        SUGGESTIONS = ['Book a service', 'How much is a tune-up?', 'Is my bike ready?']
        SERVICE_WORDS = [
            (r'tune', 'Basic tune-up'),
            (r'chain', 'Chain replacement'),
            (r'brake', 'Brake adjustment'),
            (r'puncture|flat|tire|tyre', 'Puncture repair'),
            (r'overhaul|full', 'Full overhaul'),
        ]
        SAY = {
            'booking_form': 'Pick a service and a time.',
            'price_list': 'Here are the current prices.',
            'repair_status': 'Enter your ticket code and I will look it up.',
            'none': 'I can only help with booking, prices and repair status here. Pick one of these.',
        }

        def rule_plan(message):
            low = message.lower()
            found = re.search(r'\brr-\d{4}\b', low)
            if found:
                return 'repair_status', {'code': found.group(0).upper()}
            if re.search(r'\b(ready|status|ticket|picked up|pick up|collect)\b', low):
                return 'repair_status', {}
            if re.search(r'\b(book|booking|schedule|appointment|reserve|slot)\b', low):
                props = {}
                for pattern, name in SERVICE_WORDS:
                    if re.search(pattern, low):
                        props['service'] = name
                        break
                return 'booking_form', props
            if re.search(r'\b(price|prices|cost|costs|how much|rate|rates|fee)\b', low):
                return 'price_list', {}
            return 'none', {}

        def clean_plan(component, props, say):
            if component not in MENU:
                return 'none', {}, SAY['none']
            allowed = MENU[component]['allowed']
            safe = {}
            if isinstance(props, dict):
                for key in allowed:
                    value = props.get(key)
                    if isinstance(value, str) and value.strip():
                        safe[key] = value.strip()[:60]
            if not isinstance(say, str) or not say.strip():
                say = SAY[component]
            return component, safe, say.strip()[:160]

        client_ip = request.ip()
        try:
            is_local_client = client_ip is not None and ipaddress.ip_address(client_ip).is_loopback
        except ValueError:
            is_local_client = False

        api_key = env('PLUFF_AI_API_KEY')
        base_url = (env('PLUFF_AI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta/openai/') or '').rstrip('/')
        model = env('PLUFF_AI_MODEL', 'gemini-3.6-flash')
        parsed_url = urllib.parse.urlsplit(base_url)
        url_ok = (
            parsed_url.scheme in ('https', 'http') and bool(parsed_url.hostname)
            and not parsed_url.username and not parsed_url.password and not parsed_url.query and not parsed_url.fragment
            and (parsed_url.scheme == 'https' or parsed_url.hostname in ('localhost', '127.0.0.1', '::1'))
        )

        source = 'rules'
        component, props = rule_plan(text)
        say = SAY[component]
        if component == 'repair_status' and props.get('code'):
            say = 'Looking up ' + props['code'] + '.'

        if api_key and is_local_client and url_ok:
            system = (
                'You choose ONE screen for a bicycle workshop assistant. Reply with JSON only, no markdown: '
                '{"component": "<name or none>", "props": {}, "say": "<one short plain sentence>"}. '
                'Use "none" when no screen fits. Never invent component names. Screens: '
                + json.dumps({name: item['use'] for name, item in MENU.items()})
            )
            payload = json.dumps({
                'model': model,
                'stream': False,
                'messages': [
                    {'role': 'system', 'content': system},
                    {'role': 'user', 'content': text},
                ],
            }).encode('utf-8')

            def _ask_model():
                req = urllib.request.Request(
                    base_url + '/chat/completions',
                    data=payload,
                    headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + api_key},
                    method='POST',
                )
                with urllib.request.urlopen(req, timeout=20) as result:
                    return json.loads(result.read().decode('utf-8'))

            try:
                loop = asyncio.get_running_loop()
                answer = await loop.run_in_executor(None, _ask_model)
                raw = (((answer.get('choices') or [{}])[0]).get('message') or {}).get('content') or ''
                start, end = raw.find('{'), raw.rfind('}')
                decoded = json.loads(raw[start:end + 1])
                component, props, say = clean_plan(decoded.get('component'), decoded.get('props'), decoded.get('say'))
                source = 'model'
            except Exception:
                source = 'rules'

        if component == 'none':
            await UnmetRequest.create({'message': text, 'source': source})

        return response.json({
            'component': component,
            'props': props,
            'say': say,
            'suggestions': SUGGESTIONS if component == 'none' else [],
            'source': source,
        })


