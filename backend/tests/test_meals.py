async def test_create_meal_requires_auth(client):
    response = await client.post(
        "/meals",
        json={"date": "2026-09-01", "breakfast": True, "lunch": False, "dinner": True},
    )
    assert response.status_code == 401


async def test_create_and_list_meal(client, user_a):
    response = await client.post(
        "/meals",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "breakfast": True, "lunch": False, "dinner": True},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["breakfast"] is True
    assert body["user_id"] == user_a["user"]["id"]

    list_response = await client.get("/meals", headers=user_a["headers"])
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1


async def test_list_meals_only_shows_own(client, user_a, user_b):
    await client.post(
        "/meals",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "breakfast": True, "lunch": True, "dinner": True},
    )
    await client.post(
        "/meals",
        headers=user_b["headers"],
        json={"date": "2026-09-01", "breakfast": True, "lunch": True, "dinner": True},
    )

    response = await client.get("/meals", headers=user_a["headers"])
    assert response.status_code == 200
    assert len(response.json()) == 1


async def test_update_meal_forbidden_for_non_owner(client, user_a, user_b):
    created = await client.post(
        "/meals",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "breakfast": True, "lunch": False, "dinner": False},
    )
    meal_id = created.json()["id"]

    response = await client.put(
        f"/meals/{meal_id}",
        headers=user_b["headers"],
        json={"date": "2026-09-01", "breakfast": False, "lunch": False, "dinner": False},
    )
    assert response.status_code == 403


async def test_delete_meal_forbidden_for_non_owner(client, user_a, user_b):
    created = await client.post(
        "/meals",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "breakfast": True, "lunch": False, "dinner": False},
    )
    meal_id = created.json()["id"]

    response = await client.delete(f"/meals/{meal_id}", headers=user_b["headers"])
    assert response.status_code == 403


async def test_meal_summary_aggregates_across_users(client, user_a, user_b):
    await client.post(
        "/meals",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "breakfast": True, "lunch": True, "dinner": True},
    )
    await client.post(
        "/meals",
        headers=user_b["headers"],
        json={"date": "2026-09-02", "breakfast": True, "lunch": False, "dinner": False},
    )

    response = await client.get(
        "/meals/summary", headers=user_a["headers"], params={"month": "2026-09"}
    )
    assert response.status_code == 200
    assert response.json()["total_meal_slots"] == 4
