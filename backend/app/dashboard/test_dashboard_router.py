def test_dashboard_router_get_includes_seeded_account(client, seed_account):
    response = client.get("/api/v1/dashboard")

    assert response.status_code == 200
    payload = response.json()
    assert "accounts" in payload
    assert "transactions" in payload
    assert any(account["id"] == seed_account["id"] for account in payload["accounts"])
