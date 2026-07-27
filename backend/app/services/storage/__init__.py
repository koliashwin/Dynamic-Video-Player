import os

storage_type = os.getenv("STORAGE_BACKEND", "local").lower()

if storage_type == "cloud":
    from .cloud_storage import upload_file, delete_file, get_playback_url

else:
    from .local_storage import upload_file, delete_file, get_playback_url