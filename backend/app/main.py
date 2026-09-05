from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import balance, bazar, deposits, expenses, meals, users

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meals.router, prefix="/meals")
app.include_router(users.router, prefix="/users")
app.include_router(bazar.router, prefix="/bazar")
app.include_router(expenses.router, prefix="/expenses")
app.include_router(deposits.router, prefix="/deposits")
app.include_router(balance.router, prefix="/balance")


@app.get("/")
def read_root():
    return {"message": "MessMate API is running"}


@app.get("/health")
def read_health():
    return {"status": "ok"}
