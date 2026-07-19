from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config.database import Base, engine
from app.routers.videos import router as video_router
from app.routers.clips import router as clip_router
from app.routers.sections import router as section_router

Base.metadata.create_all(bind=engine)

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
app.include_router(clip_router)
app.include_router(section_router)


@app.get("/")
def health_check():
    return {
        "message": "backend working"
    }