import uuid


def test_accounts_router_get_list(client):
    response = client.get("/api/v1/accounts")

    assert response.status_code == 200
    assert response.json() == []


def test_accounts_router_get_missing_account(client):
    response = client.get(f"/api/v1/accounts/{uuid.uuid4()}")

    assert response.status_code == 404
