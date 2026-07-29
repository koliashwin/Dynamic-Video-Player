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