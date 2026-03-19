import uuid


def test_categories_router_get_list_contains_seeded_category(client, seed_category):
    response = client.get("/api/v1/categories")

    assert response.status_code == 200
    assert any(item["id"] == seed_category["id"] for item in response.json())


def test_categories_router_get_by_id(client, seed_category):
    response = client.get(f"/api/v1/categories/{seed_category['id']}")

    assert response.status_code == 200
    assert response.json()["id"] == seed_category["id"]


def test_categories_router_get_missing_category(client):
    response = client.get(f"/api/v1/categories/{uuid.uuid4()}")

    assert response.status_code == 404


def test_categories_router_create_category(client):
    category_name = f"Created Category {uuid.uuid4().hex[:8]}"
    response = client.post(
        "/api/v1/categories",
        json={
            "name": category_name,
            "icon_name": "Savings",
            "color": "#654321",
            "type": "expense",
        },
    )

    assert response.status_code == 201

    list_response = client.get("/api/v1/categories")
    assert list_response.status_code == 200
    assert any(item["name"] == category_name for item in list_response.json())


def test_categories_router_update_category(client, seed_category):
    response = client.patch(
        f"/api/v1/categories/{seed_category['id']}",
        json={
            "name": "Updated Category",
            "type": "income",
        },
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Updated Category"
    assert response.json()["type"] == "income"


def test_categories_router_delete_category(client, seed_category):
    response = client.delete(f"/api/v1/categories/{seed_category['id']}")

    assert response.status_code == 204

    get_response = client.get(f"/api/v1/categories/{seed_category['id']}")
    assert get_response.status_code == 404
