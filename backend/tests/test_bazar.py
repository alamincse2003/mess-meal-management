async def test_create_bazar_entry_requires_auth(client):
    response = await client.post(
        "/bazar", json={"date": "2026-09-01", "amount": 500, "description": "Rice"}
    )
    assert response.status_code == 401


async def test_create_and_list_bazar_entry(client, user_a):
    response = await client.post(
        "/bazar",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "amount": 500, "description": "Rice"},
    )
    assert response.status_code == 200
    assert response.json()["user_id"] == user_a["user"]["id"]

    list_response = await client.get("/bazar", headers=user_a["headers"])
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1


async def test_bazar_entries_are_shared_across_users(client, user_a, user_b):
    await client.post(
        "/bazar",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "amount": 500, "description": "Rice"},
    )

    response = await client.get("/bazar", headers=user_b["headers"])
    assert response.status_code == 200
    assert len(response.json()) == 1


async def test_update_bazar_entry_forbidden_for_non_owner(client, user_a, user_b):
    created = await client.post(
        "/bazar",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "amount": 500, "description": "Rice"},
    )
    entry_id = created.json()["id"]

    response = await client.put(
        f"/bazar/{entry_id}",
        headers=user_b["headers"],
        json={"date": "2026-09-01", "amount": 999, "description": "Hacked"},
    )
    assert response.status_code == 403


async def test_update_bazar_entry_succeeds_for_owner(client, user_a):
    created = await client.post(
        "/bazar",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "amount": 500, "description": "Rice"},
    )
    entry_id = created.json()["id"]

    response = await client.put(
        f"/bazar/{entry_id}",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "amount": 600, "description": "Rice and fish"},
    )
    assert response.status_code == 200
    assert response.json()["amount"] == 600


async def test_delete_bazar_entry_forbidden_for_non_owner(client, user_a, user_b):
    created = await client.post(
        "/bazar",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "amount": 500, "description": "Rice"},
    )
    entry_id = created.json()["id"]

    response = await client.delete(f"/bazar/{entry_id}", headers=user_b["headers"])
    assert response.status_code == 403


async def test_bazar_entry_requires_positive_amount(client, user_a):
    response = await client.post(
        "/bazar",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "amount": -10, "description": "Invalid"},
    )
    assert response.status_code == 422
