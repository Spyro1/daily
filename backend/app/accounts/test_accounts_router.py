import uuid


def test_accounts_router_get_list_contains_seeded_account(client, seed_account):
    response = client.get("/api/v1/accounts")

    assert response.status_code == 200
    assert any(item["id"] == seed_account["id"] for item in response.json())


def test_accounts_router_get_by_id(client, seed_account):
    response = client.get(f"/api/v1/accounts/{seed_account['id']}")

    assert response.status_code == 200
    assert response.json()["id"] == seed_account["id"]


def test_accounts_router_get_missing_account(client):
    response = client.get(f"/api/v1/accounts/{uuid.uuid4()}")

    assert response.status_code == 404


def test_accounts_router_create_account(client):
    account_name = f"Created Account {uuid.uuid4().hex[:8]}"
    response = client.post(
        "/api/v1/accounts",
        json={
            "name": account_name,
            "currency_code": "USD",
            "icon_name": "Savings",
            "color": "#123456",
            "include_in_total": True,
        },
    )

    assert response.status_code == 201

    list_response = client.get("/api/v1/accounts")
    assert list_response.status_code == 200
    assert any(item["name"] == account_name for item in list_response.json())


def test_accounts_router_update_account(client, seed_account):
    response = client.patch(
        f"/api/v1/accounts/{seed_account['id']}",
        json={
            "name": "Updated Account Name",
            "include_in_total": False,
            "is_archived": True,
        },
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Updated Account Name"
    assert response.json()["include_in_total"] is False
    assert response.json()["is_archived"] is True


def test_accounts_router_delete_account(client, seed_account):
    response = client.delete(f"/api/v1/accounts/{seed_account['id']}")

    assert response.status_code == 204

    get_response = client.get(f"/api/v1/accounts/{seed_account['id']}")
    assert get_response.status_code == 404
