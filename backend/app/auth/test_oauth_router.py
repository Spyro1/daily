def test_oauth_logout(client):
    response = client.post("/api/v1/oauth/logout")

    assert response.status_code == 204


def test_oauth_validate_requires_cookie(client):
    response = client.post("/api/v1/oauth/validate")

    assert response.status_code == 401
    assert response.json()["detail"] == "Access token not found"


def test_oauth_refresh_requires_cookie(client):
    response = client.post("/api/v1/oauth/refresh")

    assert response.status_code == 401
    assert response.json()["detail"] == "Refresh token not found"


def test_oauth_callback_rejects_invalid_state(client):
    response = client.get("/api/v1/oauth/callback", params={"code": "test-code", "state": "invalid"})

    assert response.status_code == 400
