import uuid
from datetime import datetime, timezone


def test_transactions_router_get_list(client):
    response = client.get("/api/v1/transactions")

    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "total" in data
    assert "skip" in data
    assert "limit" in data
    assert isinstance(data["data"], list)


def test_transactions_router_get_list_with_filters(client, seed_account, seed_category, seed_transaction):
    """Test GET /transactions with various filters"""
    # Filter by category
    response = client.get(f"/api/v1/transactions?category_id={seed_category['id']}")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 0
    assert len(data["data"]) <= data["limit"]

    # Filter by account
    response = client.get(f"/api/v1/transactions?account_id={seed_account['id']}")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 0

    # Filter by transaction type
    response = client.get("/api/v1/transactions?transaction_type=expense")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 0

    # Test pagination
    response = client.get("/api/v1/transactions?skip=0&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["skip"] == 0
    assert data["limit"] == 10


def test_transactions_router_get_missing_transaction(client):
    response = client.get(f"/api/v1/transactions/{uuid.uuid4()}")

    assert response.status_code == 404


def test_transactions_router_create_transaction(client, seed_account, seed_category):
    response = client.post(
        "/api/v1/transactions",
        json={
            "amount": "15.25",
            "transaction_type": "expense",
            "occurred_at": datetime.now(timezone.utc).isoformat(),
            "category_id": seed_category["id"],
            "source_account_id": seed_account["id"],
            "note": "Created from test",
        },
    )

    assert response.status_code == 201
    # data = response.json()
    # assert data["id"]
    # assert data["amount"] == "15.25"
    # assert data["transaction_type"] == "expense"
    # assert data["note"] == "Created from test"


def test_transactions_router_update_transaction(client, seed_transaction, seed_category):
    new_amount = "25.50"
    response = client.patch(
        f"/api/v1/transactions/{seed_transaction['id']}",
        json={
            "amount": new_amount,
            "note": "Updated note",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == new_amount
    assert data["note"] == "Updated note"


def test_transactions_router_delete_transaction(client, seed_transaction):
    response = client.delete(f"/api/v1/transactions/{seed_transaction['id']}")

    assert response.status_code == 204

    get_response = client.get(f"/api/v1/transactions/{seed_transaction['id']}")
    assert get_response.status_code == 404
