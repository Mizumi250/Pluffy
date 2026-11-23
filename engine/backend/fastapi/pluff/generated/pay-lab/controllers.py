# ARKZEN GENERATED CONTROLLERS: pay-lab
from pluff.runtime import *
from .models import Product, Order, OrderItem, WebhookEvent
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class ProductController:
    @staticmethod
    async def index(request, response):
        query = Product.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 20), request.input('page', 1), request.url()))


class OrderController:
    @staticmethod
    async def checkout(request, response):
        import asyncio
        import json
        import re
        import secrets
        import urllib.error
        import urllib.parse
        import urllib.request


        def fail(message, status):
            return response.json({'message': message}, status)


        provider_url = (env('PAY_PROVIDER_URL') or '').rstrip('/')
        secret_key = env('PAY_SECRET_KEY')
        app_url = (env('PAY_APP_URL', 'http://localhost:3000') or '').rstrip('/')
        if not provider_url or not secret_key:
            return fail('Payments are not set up yet.', 503)
        parsed = urllib.parse.urlsplit(provider_url)
        loopback = parsed.hostname in ('localhost', '127.0.0.1', '::1')
        if not parsed.hostname or parsed.username or parsed.password or (parsed.scheme != 'https' and not (parsed.scheme == 'http' and loopback)):
            return fail('Payments are not set up yet.', 503)
        allowed_hosts = {parsed.hostname}
        for host in (env('PAY_CHECKOUT_HOSTS') or '').split(','):
            if host.strip():
                allowed_hosts.add(host.strip().lower())

        key = request.header('idempotency-key') or ''
        if not re.fullmatch(r'[A-Za-z0-9_-]{8,64}', key):
            return fail('Missing or invalid Idempotency-Key.', 400)

        # The browser only sends which coffees and how many. It never sends a price.
        raw_items = request.input('items')
        if not isinstance(raw_items, list) or not 1 <= len(raw_items) <= 10:
            return fail('Choose at least one bag.', 422)
        wanted = {}
        for entry in raw_items:
            if not isinstance(entry, dict):
                return fail('Those items are not valid.', 422)
            slug = entry.get('slug')
            qty = entry.get('qty')
            if not isinstance(slug, str) or not re.fullmatch(r'[a-z0-9-]{1,40}', slug):
                return fail('Those items are not valid.', 422)
            if isinstance(qty, bool) or not isinstance(qty, int) or qty < 1 or qty > 10:
                return fail('You can order 1 to 10 bags of each coffee.', 422)
            wanted[slug] = wanted.get(slug, 0) + qty
            if wanted[slug] > 10:
                return fail('You can order 1 to 10 bags of each coffee.', 422)

        rows = await Product.where_in('slug', list(wanted.keys())).get()
        if len(rows) != len(wanted):
            return fail('One of those coffees is no longer available.', 422)
        lines = []
        total = 0
        for row in rows:
            qty = wanted[row.slug]
            lines.append({'slug': row.slug, 'name': row.name, 'unit': int(row.price_cents), 'qty': qty})
            total += int(row.price_cents) * qty
        if total < 100 or total > 100000:
            return fail('That order total is not allowed.', 422)
        fingerprint = '|'.join(sorted(l['slug'] + ':' + str(l['qty']) for l in lines))

        # Same key and same cart returns the same payment page. Same key and a different cart is refused.
        existing = await Order.where('idempotency_key', key).first()
        if existing:
            if existing.fingerprint != fingerprint:
                return fail('This checkout was already used for a different cart.', 409)
            if existing.status == 'pending' and existing.checkout_url:
                return response.json({'checkout_url': existing.checkout_url, 'order': existing.public_id})
            return fail('This order is already finished.', 409)

        public_id = secrets.token_urlsafe(24)
        order = await Order.create({
            'public_id': public_id,
            'status': 'pending',
            'total_cents': total,
            'currency': 'usd',
            'idempotency_key': key,
            'fingerprint': fingerprint,
        })
        for line in lines:
            await OrderItem.create({
                'order_id': order.id,
                'product_slug': line['slug'],
                'name': line['name'],
                'unit_cents': line['unit'],
                'quantity': line['qty'],
            })

        payload = json.dumps({
            'client_reference_id': public_id,
            'currency': 'usd',
            'amount_total': total,
            'success_url': app_url + '/pay-lab/thanks?o=' + public_id,
            'cancel_url': app_url + '/pay-lab?cancelled=1',
            'line_items': [{'name': l['name'], 'unit_amount': l['unit'], 'quantity': l['qty']} for l in lines],
        }).encode('utf-8')


        def _create_session():
            req = urllib.request.Request(
                provider_url + '/v1/checkout/sessions',
                data=payload,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + secret_key,
                    'Idempotency-Key': 'order-' + public_id,
                },
                method='POST',
            )
            with urllib.request.urlopen(req, timeout=15) as result:
                return json.loads(result.read().decode('utf-8'))


        try:
            loop = asyncio.get_running_loop()
            session = await loop.run_in_executor(None, _create_session)
            session_id = session.get('id')
            url = session.get('url')
            link = urllib.parse.urlsplit(url) if isinstance(url, str) else None
            good = (
                isinstance(session_id, str) and 0 < len(session_id) <= 80
                and link is not None and (link.hostname or '').lower() in allowed_hosts
                and (link.scheme == 'https' or (link.scheme == 'http' and loopback))
            )
            if not good:
                raise ValueError('unexpected session')
        except Exception:
            await Order.where('id', order.id).update({'status': 'failed'})
            return fail('The payment page could not be opened. Try again in a moment.', 502)

        await Order.where('id', order.id).update({'provider_session_id': session_id, 'checkout_url': url})
        return response.json({'checkout_url': url, 'order': public_id}, 201)

    @staticmethod
    async def status(request, response):
        import re

        ref = request.input('o') or ''
        if not isinstance(ref, str) or not re.fullmatch(r'[A-Za-z0-9_-]{20,64}', ref):
            return response.json({'message': 'Not found'}, 404)
        order = await Order.where('public_id', ref).first()
        if not order:
            return response.json({'message': 'Not found'}, 404)
        items = await OrderItem.where('order_id', order.id).get()
        return response.json({
            'ref': ref[:8],
            'status': order.status,
            'total_cents': order.total_cents,
            'currency': order.currency,
            'items': [{'name': i.name, 'quantity': i.quantity, 'unit_cents': i.unit_cents} for i in items],
        })

    @staticmethod
    async def webhook(request, response):
        import hashlib
        import hmac
        import json
        import time

        secret = env('PAY_WEBHOOK_SECRET')
        if not secret:
            return response.json({'message': 'Webhooks are not set up.'}, 503)

        # Read the exact bytes the provider signed. Never re-encode the parsed JSON before checking.
        raw = await request.raw.body()
        if len(raw) > 65536:
            return response.json({'message': 'Too large.'}, 413)

        header = request.header('x-pay-signature') or ''
        parts = {}
        for piece in header.split(','):
            name, _, value = piece.strip().partition('=')
            if name and value:
                parts.setdefault(name, []).append(value)
        stamp = (parts.get('t') or [''])[0]
        bad = response.json({'message': 'Invalid signature.'}, 400)
        if not stamp.isdigit() or abs(time.time() - int(stamp)) > 300:
            return bad
        expected = hmac.new(secret.encode('utf-8'), stamp.encode('utf-8') + b'.' + raw, hashlib.sha256).hexdigest().encode('utf-8')
        if not any(hmac.compare_digest(expected, candidate.encode('utf-8', 'ignore')) for candidate in parts.get('v1', [])):
            return bad

        try:
            event = json.loads(raw.decode('utf-8'))
            event_id = event['id']
            event_type = event['type']
            data = event['data']
            if not isinstance(event_id, str) or not isinstance(event_type, str) or not isinstance(data, dict):
                raise ValueError('shape')
        except Exception:
            return response.json({'message': 'Invalid event.'}, 400)
        event_id = event_id[:80]

        if await WebhookEvent.where('event_id', event_id).first():
            return response.json({'received': True, 'duplicate': True})

        session_id = data.get('session_id')
        reference = data.get('client_reference_id')
        order = None
        if isinstance(session_id, str) and isinstance(reference, str):
            order = await Order.where('provider_session_id', session_id).first()
            # Both ids must point at the same order, or the event is ignored.
            if order and order.public_id != reference:
                order = None

        if order and event_type == 'checkout.session.completed':
            try:
                amount_ok = int(data.get('amount_total', -1)) == int(order.total_cents)
            except (TypeError, ValueError):
                amount_ok = False
            currency_ok = str(data.get('currency', '')).lower() == order.currency
            if data.get('payment_status') != 'paid':
                pass  # still processing at the provider, keep waiting
            elif not (amount_ok and currency_ok):
                # Money does not match what we asked for. Never mark it paid.
                await Order.where('id', order.id).where('status', 'pending').update({'status': 'review'})
            else:
                # Only the first writer can move pending to paid, so repeats and races are harmless.
                moved = await Order.where('id', order.id).where('status', 'pending').update({'status': 'paid'})
                if not moved:
                    await Order.where('id', order.id).where('status', 'failed').update({'status': 'review'})
        elif order and event_type == 'checkout.session.expired':
            await Order.where('id', order.id).where('status', 'pending').update({'status': 'failed'})

        try:
            await WebhookEvent.create({'event_id': event_id, 'type': event_type[:60], 'order_public_id': order.public_id if order else None})
        except Exception:
            pass  # a parallel delivery already recorded it
        return response.json({'received': True})


