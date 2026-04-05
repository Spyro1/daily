"""Tests for JWT authentication and OAuth endpoints."""

from app.auth.jwt_utils import create_access_token, create_refresh_token, decode_token
from app.auth.schema import AuthMethod, TokenData


# ─── Helpers ─────────────────────────────────────────────────────────

def _make_token(user_id: str, email: str = "test@example.com") -> str:
    """Create a valid access token for testing."""
    data = TokenData(user_id=user_id, email=email, auth_method=AuthMethod.GOOGLE.value)
    return create_access_token(payload=data.model_dump())


# ─── JWT token tests ────────────────────────────────────────────────

class TestJWTAuth:
    def test_token_contains_user_id(self, test_user):
        """Token payload must include the user_id claim."""
        token = _make_token(test_user["id"], test_user["email"])
        payload = decode_token(token)
        assert payload["user_id"] == test_user["id"]

    def test_validate_with_valid_token(self, client, test_user):
        """Validate succeeds with a correctly signed token."""
        token = _make_token(test_user["id"], test_user["email"])
        client.cookies.set("access_token", token)
        response = client.post("/api/v1/oauth/validate")
        assert response.status_code == 200
        assert response.json()["message"] == "Access token is valid"

    def test_validate_rejects_invalid_token(self, client):
        """Validate returns 401 for a garbage token."""
        client.cookies.set("access_token", "invalid-garbage-token")
        response = client.post("/api/v1/oauth/validate")
        assert response.status_code == 401

    def test_refresh_issues_new_access_token(self, client, test_user):
        """Refresh endpoint returns a new access_token cookie."""
        data = TokenData(user_id=test_user["id"], email=test_user["email"], auth_method=AuthMethod.GOOGLE.value)
        refresh = create_refresh_token(payload=data.model_dump())
        client.cookies.set("refresh_token", refresh)
        response = client.post("/api/v1/oauth/refresh")
        assert response.status_code == 200
        assert "access_token" in response.cookies


# ─── OAuth endpoint tests ───────────────────────────────────────────

class TestOAuthEndpoints:
    def test_logout_clears_cookies(self, client):
        response = client.post("/api/v1/oauth/logout")
        assert response.status_code == 204

    def test_validate_requires_cookie(self, client):
        response = client.post("/api/v1/oauth/validate")
        assert response.status_code == 401
        assert response.json()["detail"] == "Access token not found"

    def test_refresh_requires_cookie(self, client):
        response = client.post("/api/v1/oauth/refresh")
        assert response.status_code == 401
        assert response.json()["detail"] == "Refresh token not found"

    def test_callback_rejects_invalid_state(self, client):
        response = client.get("/api/v1/oauth/callback", params={"code": "test-code", "state": "invalid"})
        assert response.status_code == 400
