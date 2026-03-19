def test_dashboard_router_get(client):
    response = client.get("/api/v1/dashboard")

    assert response.status_code == 200
    assert response.json() == {"accounts": [], "transactions": []}
