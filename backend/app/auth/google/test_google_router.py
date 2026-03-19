def test_google_login_redirect(client):
    response = client.get("/api/v1/google/login", follow_redirects=False)

    assert response.status_code == 302
    assert "accounts.google.com" in response.headers["location"]
