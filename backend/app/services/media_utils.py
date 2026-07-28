import os
import json
import shutil
import subprocess

def ffprobe_available() -> bool:
    return shutil.which("ffprobe") is not None

def get_video_duration(filepath: str) -> float:

    if not ffprobe_available():
        raise RuntimeError(
            "ffprobe not found on PATH. Install ffmpeg to enable "
            "automatic clip duration detection."
        )
    
    result = subprocess.run(
        [
            'ffprobe',
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'json',
            filepath
        ],
        capture_output=True,
        text=True,
        check=True
    )
    if result.returncode != 0:
            raise RuntimeError(f"ffprobe failed to fetch duration: {result.stderr[-500:]}")
    
    data = json.loads(result.stdout)
    return round(float(data['format']['duration']),2)

def ensure_faststart(path: str) -> None:
    remuxed = f"{path}.faststart.mp4"
    result = subprocess.run(
        [
            'ffmpeg',
            '-y', '-i', 
            path, '-c', 'copy',
            '-movflags', '+faststart', 
            remuxed
        ],
        check=True,
        text=True,
        capture_output=True
    )
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg faststart remux failed: {result.stderr[-500:]}")

    os.replace(remuxed, path)