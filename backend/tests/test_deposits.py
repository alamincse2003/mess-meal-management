async def test_create_deposit_requires_auth(client):
    response = await client.post("/deposits", json={"date": "2026-09-01", "amount": 3000})
    assert response.status_code == 401


async def test_create_and_list_deposit(client, user_a):
    response = await client.post(
        "/deposits", headers=user_a["headers"], json={"date": "2026-09-01", "amount": 3000}
    )
    assert response.status_code == 200
    assert response.json()["user_id"] == user_a["user"]["id"]

    list_response = await client.get("/deposits", headers=user_a["headers"])
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1


async def test_deposits_are_shared_across_users(client, user_a, user_b):
    await client.post(
        "/deposits", headers=user_a["headers"], json={"date": "2026-09-01", "amount": 3000}
    )

    response = await client.get("/deposits", headers=user_b["headers"])
    assert response.status_code == 200
    assert len(response.json()) == 1


async def test_update_deposit_forbidden_for_non_owner(client, user_a, user_b):
    created = await client.post(
        "/deposits", headers=user_a["headers"], json={"date": "2026-09-01", "amount": 3000}
    )
    deposit_id = created.json()["id"]

    response = await client.put(
        f"/deposits/{deposit_id}",
        headers=user_b["headers"],
        json={"date": "2026-09-01", "amount": 1},
    )
    assert response.status_code == 403


async def test_delete_deposit_forbidden_for_non_owner(client, user_a, user_b):
    created = await client.post(
        "/deposits", headers=user_a["headers"], json={"date": "2026-09-01", "amount": 3000}
    )
    deposit_id = created.json()["id"]

    response = await client.delete(f"/deposits/{deposit_id}", headers=user_b["headers"])
    assert response.status_code == 403
