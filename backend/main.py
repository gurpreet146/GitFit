from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import router as auth_router
from routes.profile import router as profile_router
from routes.workouts import router as workouts_router

app = FastAPI(title="GitFit API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(workouts_router)


@app.get("/")
def health_check():
    return {"message": "GitFit API is running"}
