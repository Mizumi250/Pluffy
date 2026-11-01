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
        import urllib.error
        import urllib.request

        validated = await request.validate({'prompt': 'required|string|max:4000'})
        client_ip = request.ip()
        try:
            is_local_client = client_ip is not None and ipaddress.ip_address(client_ip).is_loopback
        except ValueError:
            is_local_client = False
        if not is_local_client:
            raise HttpException(403, 'This local AI endpoint only accepts requests from this computer.')
        prompt = validated['prompt']
        model = env('PLUFF_AI_MODEL', 'llama3.2')
        payload = json.dumps({
            'model': model,
            'stream': False,
            'messages': [{'role': 'user', 'content': prompt}],
        }).encode('utf-8')

        def _ask_local_ollama():
            req = urllib.request.Request(
                'http://127.0.0.1:11434/api/chat',
                data=payload,
                headers={'Content-Type': 'application/json'},
                method='POST',
            )
            with urllib.request.urlopen(req, timeout=120) as result:
                return json.loads(result.read().decode('utf-8'))

        try:
            loop = asyncio.get_running_loop()
            result = await loop.run_in_executor(None, _ask_local_ollama)
        except urllib.error.URLError as error:
            raise HttpException(503, 'Local Ollama is unavailable. Start Ollama at 127.0.0.1:11434 and pull the configured model.') from error
        except (json.JSONDecodeError, UnicodeDecodeError) as error:
            raise HttpException(502, 'Local Ollama returned an invalid response.') from error

        answer = (result.get('message') or {}).get('content')
        if not isinstance(answer, str) or not answer.strip():
            raise HttpException(502, 'Local Ollama returned an empty response.')
        return response.json({'model': result.get('model', model), 'response': answer})


