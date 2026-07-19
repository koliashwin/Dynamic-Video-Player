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

    data = json.loads(result.stdout)
    return round(float(data['format']['duration']),2)