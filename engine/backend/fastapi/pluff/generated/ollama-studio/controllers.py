# ARKZEN GENERATED CONTROLLERS: ollama-studio
from pluff.runtime import *
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class AssistantController:
    @staticmethod
    async def chat(request, response):
        import asyncio
        import ipaddress
        import json
        import urllib.parse
        import urllib.error
        import urllib.request

        validated = await request.validate({'prompt': 'required|string|max:4000'})
        client_ip = request.ip()
        try:
            is_local_client = client_ip is not None and ipaddress.ip_address(client_ip).is_loopback
        except ValueError:
            is_local_client = False
        if not is_local_client:
            raise HttpException(403, 'This AI endpoint only accepts requests from this computer.')
        prompt = validated['prompt']
        model = env('PLUFF_AI_MODEL', 'gemini-3.6-flash')
        base_url = (env('PLUFF_AI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta/openai/') or '').rstrip('/')
        api_key = env('PLUFF_AI_API_KEY')
        if not api_key:
            raise HttpException(503, 'AI API is not configured. Set PLUFF_AI_API_KEY in the FastAPI backend environment.')
        parsed_url = urllib.parse.urlsplit(base_url)
        if (parsed_url.scheme not in ('https', 'http') or not parsed_url.hostname or parsed_url.username or
                parsed_url.password or parsed_url.query or parsed_url.fragment):
            raise HttpException(500, 'PLUFF_AI_BASE_URL must be an HTTP(S) base URL without credentials, query, or fragment.')
        if parsed_url.scheme != 'https' and parsed_url.hostname not in ('localhost', '127.0.0.1', '::1'):
            raise HttpException(500, 'PLUFF_AI_BASE_URL must use HTTPS except for a loopback API.')
        payload = json.dumps({
            'model': model,
            'stream': False,
            'messages': [{'role': 'user', 'content': prompt}],
        }).encode('utf-8')

        def _ask_ai_api():
            req = urllib.request.Request(
                base_url + '/chat/completions',
                data=payload,
                headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + api_key},
                method='POST',
            )
            with urllib.request.urlopen(req, timeout=120) as result:
                return json.loads(result.read().decode('utf-8'))

        try:
            loop = asyncio.get_running_loop()
            result = await loop.run_in_executor(None, _ask_ai_api)
        except urllib.error.HTTPError as error:
            raise HttpException(502, f'AI API returned HTTP {error.code}. Check the configured provider, model, and API key.') from error
        except urllib.error.URLError as error:
            raise HttpException(503, 'AI API is unavailable. Check PLUFF_AI_BASE_URL and your network connection.') from error
        except (json.JSONDecodeError, UnicodeDecodeError) as error:
            raise HttpException(502, 'AI API returned an invalid response.') from error

        choices = result.get('choices')
        answer = (choices[0].get('message') or {}).get('content') if isinstance(choices, list) and choices else None
        if not isinstance(answer, str) or not answer.strip():
            raise HttpException(502, 'AI API returned an empty or unsupported response.')
        return response.json({'model': result.get('model', model), 'response': answer})


