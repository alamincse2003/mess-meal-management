from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import meals, users

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meals.router, prefix="/meals")
app.include_router(users.router, prefix="/users")


@app.get("/")
def read_root():
    return {"message": "MessMate API is running"}


@app.get("/health")
def read_health():
    return {"status": "ok"}
