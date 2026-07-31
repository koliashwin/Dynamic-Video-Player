import os, sys, threading, webbrowser, mimetypes

mimetypes.add_type("text/javascript", ".js")
mimetypes.add_type("text/css", ".css")

os.environ.setdefault("STORAGE_BACKEND","local")
os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:8000")

from main import app
from starlette.routing import Route
from fastapi.responses import FileResponse

def resource_path(relative_path):
    base_path = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_path, relative_path)

FRONTEND_DIR = resource_path("frontend_dist/dist")

app.router.routes = [
    route for route in app.router.routes
    if not (isinstance(route, Route) and route.path == '/')
]

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    requested = os.path.join(FRONTEND_DIR, full_path)
    if full_path and os.path.isfile(requested):
        return FileResponse(requested)
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    threading.Timer(1.5, lambda: webbrowser.open("http://localhost:8000")).start()
    uvicorn.run(app=app, host="127.0.0.1", port=8000)

# steps to build standalon version
# Step 1:
#       create build for frontend with command: "npm run build"

# Step 2:
#       copy frontend build in dedicated folder(frontend_dist/) this folder has to be in same root dir as offline_main.py file

# Step 3:
#       if build/ & dist/ folder exists then delete them with following command
#       "rmdir /s /q build dist"

# Step 4:
#       run following command in terminal/cmd it will create the folder containing .exe file with relevent internal depenancies
#       "python -m PyInstaller --onedir --add-data "frontend_dist;frontend_dist" offline_main.py"

# Step 5:
#       navigate into backend/dist/offline_main/ and create bin/ folder inside it & copy the ffprobe.exe and ffmpeg.exe into that folder.

# Step 6:
#       inside ackend/dist/offline_main/ double click on offline_main.exe file and test application