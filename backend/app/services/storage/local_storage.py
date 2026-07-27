import os 
import shutil

LOCAL_VIDEOS_DIR = os.getenv("LOCAL_VIDEOS_DIR", "videos")

BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")

os.makedirs(LOCAL_VIDEOS_DIR, exist_ok=True)

def upload_file(local_path: str, key: str) -> None:
    destination = os.path.join(LOCAL_VIDEOS_DIR, key)
    shutil.copyfile(local_path, destination)


def delete_file(key: str) -> None:
    destination = os.path.join(LOCAL_VIDEOS_DIR, key)
    if os.path.exists(destination):
        os.remove(destination)


def get_playback_url(key: str, expires_in: int = 3600) -> str:
    # argument "expires_is" is just placeholder to match function prams from cloud_slorage
    return f"{BACKEND_BASE_URL}/videos/{key}" 