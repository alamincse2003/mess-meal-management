import httpx
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
async def client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


async def register_user(client: httpx.AsyncClient, name: str, email: str, password: str = "testpass123") -> dict:
    response = await client.post(
        "/users",
        json={"name": name, "email": email, "password": password},
    )
    assert response.status_code == 200
    return response.json()


async def login_user(client: httpx.AsyncClient, email: str, password: str = "testpass123") -> str:
    response = await client.post(
        "/users/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def user_a(client: httpx.AsyncClient) -> dict:
    user = await register_user(client, "User A", "usera@test.com")
    token = await login_user(client, "usera@test.com")
    return {"user": user, "token": token, "headers": auth_headers(token)}


@pytest.fixture
async def user_b(client: httpx.AsyncClient) -> dict:
    user = await register_user(client, "User B", "userb@test.com")
    token = await login_user(client, "userb@test.com")
    return {"user": user, "token": token, "headers": auth_headers(token)}
