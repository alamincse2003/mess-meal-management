async def test_balance_requires_auth(client):
    response = await client.get("/balance", params={"month": "2026-09"})
    assert response.status_code == 401


async def test_balance_calculation(client, user_a, user_b):
    # User A eats 3 meal slots, User B eats 1 meal slot this month.
    await client.post(
        "/meals",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "breakfast": True, "lunch": True, "dinner": True},
    )
    await client.post(
        "/meals",
        headers=user_b["headers"],
        json={"date": "2026-09-01", "breakfast": True, "lunch": False, "dinner": False},
    )

    # Total cost this month: 400 (bazar) + 400 (expense) = 800, over 4 meal slots => rate 200.
    await client.post(
        "/bazar",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "amount": 400, "description": "Rice"},
    )
    await client.post(
        "/expenses",
        headers=user_a["headers"],
        json={"date": "2026-09-01", "amount": 400, "category": "Gas"},
    )

    await client.post(
        "/deposits", headers=user_a["headers"], json={"date": "2026-09-01", "amount": 1000}
    )

    response = await client.get(
        "/balance", headers=user_a["headers"], params={"month": "2026-09"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["meal_rate"] == 200.0

    members_by_id = {m["user_id"]: m for m in body["members"]}

    member_a = members_by_id[user_a["user"]["id"]]
    assert member_a["meals_eaten"] == 3
    assert member_a["total_deposits"] == 1000.0
    assert member_a["cost_share"] == 600.0
    assert member_a["balance"] == 400.0

    member_b = members_by_id[user_b["user"]["id"]]
    assert member_b["meals_eaten"] == 1
    assert member_b["total_deposits"] == 0.0
    assert member_b["cost_share"] == 200.0
    assert member_b["balance"] == -200.0


async def test_balance_with_no_meals_has_zero_rate(client, user_a):
    response = await client.get(
        "/balance", headers=user_a["headers"], params={"month": "2026-09"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["meal_rate"] == 0.0
    assert body["members"][0]["balance"] == 0.0
