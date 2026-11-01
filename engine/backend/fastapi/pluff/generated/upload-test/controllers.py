# ARKZEN GENERATED CONTROLLERS: upload-test
from pluff.runtime import *
from .models import UploadedFile
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class UploadedFileController:
    @staticmethod
    async def index(request, response):
        records = await UploadedFile.latest().get()
        for record in records:
            record.url = '/storage/' + str(record.disk_path).lstrip('/') if record.is_image else None
        return response.json({'data': records})

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'files': 'required|array', 'files.*': 'file|max:10240'})
        user = request.user() or await request.auth_user()
        uploaded = []
        for file in request.files('files'):
            stored_name = Storage.put("arkzen/upload-test", file)
            is_image = str(file.get('mimetype', '')).startswith('image/')
            record = await UploadedFile.create({'user_id': user.id if user else None, 'original_name': file['originalname'], 'stored_name': stored_name.rsplit('/', 1)[-1], 'mime_type': file.get('mimetype', 'application/octet-stream'), 'size_bytes': file['size'], 'disk_path': stored_name, 'is_image': is_image})
            if is_image:
                record.url = '/storage/' + stored_name.lstrip('/')
            uploaded.append(record)
        return response.json({'data': uploaded}, 201)

    @staticmethod
    async def destroy(request, response):
        uploaded_file = await UploadedFile.find_or_fail(request.route('id'))
        Storage.delete(uploaded_file.disk_path)
        await uploaded_file.delete()
        return response.json({'message': 'File deleted'})

    @staticmethod
    async def fileUrl(request, response):
        uploaded_file = await UploadedFile.find_or_fail(request.route('id'))
        disk_path = uploaded_file.disk_path
        if not Storage.exists(disk_path):
            return response.json({'message': 'File not found'}, 404)
        return RawResponse(Storage.read(disk_path), headers={'Content-Type': uploaded_file.mime_type or 'application/octet-stream', 'Content-Disposition': 'attachment; filename*=UTF-8\'\'' + quote(uploaded_file.original_name or 'download', safe='')})


