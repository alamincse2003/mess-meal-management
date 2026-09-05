async def test_create_expense_requires_auth(client):
    response = await client.post(
        "/expenses",
        json={"date": "2026-09-01", "amount": 800, "category": "Gas"},
    )
    assert response.status_code == 401


async def test_create_and_list_expense(client, user_a):
    response = await client.post(
        "/expenses",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "amount": 800, "category": "Gas"},
    )
    assert response.status_code == 200
    assert response.json()["category"] == "Gas"

    list_response = await client.get("/expenses", headers=user_a["headers"])
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1


async def test_expenses_are_shared_across_users(client, user_a, user_b):
    await client.post(
        "/expenses",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "amount": 800, "category": "Gas"},
    )

    response = await client.get("/expenses", headers=user_b["headers"])
    assert response.status_code == 200
    assert len(response.json()) == 1


async def test_update_expense_forbidden_for_non_owner(client, user_a, user_b):
    created = await client.post(
        "/expenses",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "amount": 800, "category": "Gas"},
    )
    expense_id = created.json()["id"]

    response = await client.put(
        f"/expenses/{expense_id}",
        headers=user_b["headers"],
        json={"date": "2026-09-01", "amount": 999, "category": "Hacked"},
    )
    assert response.status_code == 403


async def test_delete_expense_forbidden_for_non_owner(client, user_a, user_b):
    created = await client.post(
        "/expenses",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "amount": 800, "category": "Gas"},
    )
    expense_id = created.json()["id"]

    response = await client.delete(f"/expenses/{expense_id}", headers=user_b["headers"])
    assert response.status_code == 403


async def test_delete_expense_succeeds_for_owner(client, user_a):
    created = await client.post(
        "/expenses",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "amount": 800, "category": "Gas"},
    )
    expense_id = created.json()["id"]

    response = await client.delete(f"/expenses/{expense_id}", headers=user_a["headers"])
    assert response.status_code == 200
