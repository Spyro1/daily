import uuid


def test_categories_router_get_list(client):
    response = client.get("/api/v1/categories")

    assert response.status_code == 200
    assert response.json() == []


def test_categories_router_get_missing_category(client):
    response = client.get(f"/api/v1/categories/{uuid.uuid4()}")

    assert response.status_code == 404
