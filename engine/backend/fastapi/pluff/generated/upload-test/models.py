# ARKZEN GENERATED MODELS: upload-test (FastAPI). Do not edit.
from pluff.runtime import *

class UploadedFile(Model):
    table = "upload_test_uploaded_files"
    connection_name = "upload-test"
    fillable = ['user_id', 'original_name', 'stored_name', 'mime_type', 'size_bytes', 'disk_path', 'is_image']
    casts = {'id': 'integer', 'user_id': 'integer', 'size_bytes': 'integer', 'is_image': 'boolean'}
    timestamps = True
    soft_deletes = False



