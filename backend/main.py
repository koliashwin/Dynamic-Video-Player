from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers.videos import router as video_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.mount(
    "/videos",
    StaticFiles(directory="videos"),
    name="videos"
)

app.include_router(video_router)


@app.get("/")
def health_check():
    return {
        "message": "backend working"
    }