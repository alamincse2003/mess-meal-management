from tests.conftest import login_user, register_user


async def test_create_user(client):
    response = await client.post(
        "/users",
        json={"name": "Alice", "email": "alice@test.com", "password": "pass1234"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Alice"
    assert body["email"] == "alice@test.com"
    assert "password" not in body
    assert "password_hash" not in body


async def test_login_success(client):
    await register_user(client, "Alice", "alice@test.com")
    token = await login_user(client, "alice@test.com")
    assert token


async def test_login_wrong_password(client):
    await register_user(client, "Alice", "alice@test.com")
    response = await client.post(
        "/users/login",
        json={"email": "alice@test.com", "password": "wrongpass"},
    )
    assert response.status_code == 401


async def test_list_users_requires_auth(client):
    response = await client.get("/users")
    assert response.status_code == 401


async def test_list_users_with_auth(client, user_a, user_b):
    response = await client.get("/users", headers=user_a["headers"])
    assert response.status_code == 200
    assert len(response.json()) == 2


async def test_get_user_requires_auth(client, user_a):
    response = await client.get(f"/users/{user_a['user']['id']}")
    assert response.status_code == 401


async def test_update_user_requires_auth(client, user_a):
    response = await client.put(
        f"/users/{user_a['user']['id']}",
        json={"name": "Hacked", "email": "hacked@test.com", "password": "whatever1"},
    )
    assert response.status_code == 401


async def test_update_user_forbidden_for_non_owner(client, user_a, user_b):
    response = await client.put(
        f"/users/{user_b['user']['id']}",
        headers=user_a["headers"],
        json={"name": "Hacked", "email": "hacked@test.com", "password": "whatever1"},
    )
    assert response.status_code == 403


async def test_update_user_succeeds_for_owner(client, user_a):
    response = await client.put(
        f"/users/{user_a['user']['id']}",
        headers=user_a["headers"],
        json={"name": "Updated Name", "email": "usera@test.com", "password": "testpass123"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"
