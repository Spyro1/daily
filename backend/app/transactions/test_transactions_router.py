import uuid


def test_transactions_router_get_list(client):
    response = client.get("/api/v1/transactions")

    assert response.status_code == 200
    assert response.json() == []


def test_transactions_router_get_missing_transaction(client):
    response = client.get(f"/api/v1/transactions/{uuid.uuid4()}")

    assert response.status_code == 404
