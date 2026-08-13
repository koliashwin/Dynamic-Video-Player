import os
import json
import shutil
import subprocess
import sys
import platform

IS_FROZEN = getattr(sys, "frozen", False)
IS_WINDOWS = platform.system() == "Windows"

def binary_name(name:str) -> str:
     return f"{name}.exe" if IS_WINDOWS else name

def binary_path(name: str) -> str:
    if IS_FROZEN:
        return os.path.join(os.path.dirname(sys.executable), "bin", binary_name(name))
    return name

def ffprobe_available() -> bool:
    path = binary_path('ffprobe')
    if IS_FROZEN:
         return os.path.isfile(path)
    return shutil.which(path) is not None

def get_video_duration(filepath: str) -> float:

    if not ffprobe_available():
        raise RuntimeError(
            "ffprobe not found. Install ffmpeg and ensure it's on PATH "
            "or bundled in bin/ next to the app (.exe file), for the offline build."
        )
    
    try:
        result = subprocess.run(
            [
                binary_path('ffprobe'),
                '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'json',
                filepath
            ],
            capture_output=True,
            text=True,
            check=True,
            timeout=30
        )
    except subprocess.TimeoutExpired:
         raise RuntimeError("ffprobe timed out reading this file")
    
    if result.returncode != 0:
            raise RuntimeError(f"ffprobe failed to fetch duration: {result.stderr[-500:]}")
    
    data = json.loads(result.stdout)
    return round(float(data['format']['duration']),2)

def ensure_faststart(path: str) -> None:
    remuxed = f"{path}.faststart.mp4"
    try:
        result = subprocess.run(
            [
                binary_path('ffmpeg'),
                '-y', '-i', 
                path, '-c', 'copy',
                '-movflags', '+faststart', 
                remuxed
            ],
            check=True,
            text=True,
            capture_output=True,
            timeout=120
        )
    except subprocess.TimeoutExpired:
         raise RuntimeError("ffmpg timed out remuxing this file")
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg faststart remux failed: {result.stderr[-500:]}")

    os.replace(remuxed, path)