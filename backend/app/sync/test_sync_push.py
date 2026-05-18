"""Tests for POST /api/v1/sync/push."""

import uuid
from datetime import datetime, timezone

import pytest


def _make_account(**overrides):
    defaults = {
        "id": str(uuid.uuid4()),
        "name": f"Acct {uuid.uuid4().hex[:6]}",
        "currency_code": "EUR",
        "icon_name": "Savings",
        "color": "#FF5733",
        "include_in_total": True,
        "is_archived": False,
    }
    defaults.update(overrides)
    return defaults


def _make_category(**overrides):
    defaults = {
        "id": str(uuid.uuid4()),
        "name": f"Cat {uuid.uuid4().hex[:6]}",
        "category_type": "expense",
        "icon_name": "Savings",
        "color": "#33FF57",
    }
    defaults.update(overrides)
    return defaults


def _make_transaction(source_account_id, category_id, **overrides):
    defaults = {
        "id": str(uuid.uuid4()),
        "source_account_id": str(source_account_id),
        "category_id": str(category_id),
        "transaction_type": "expense",
        "amount": "100.0000",
        "occurred_at": datetime.now(timezone.utc).isoformat(),
        "note": "sync test",
    }
    defaults.update(overrides)
    return defaults


class TestSyncPush:
    def test_push_empty_payload(self, client):
        """Pushing an empty payload is valid and returns zero counts."""
        response = client.post("/api/v1/sync/push", json={})
        assert response.status_code == 200
        data = response.json()
        assert data["accounts_created"] == 0
        assert data["categories_created"] == 0
        assert data["transactions_created"] == 0

    def test_push_accounts_only(self, client):
        """Push a single account."""
        acct = _make_account()
        response = client.post(
            "/api/v1/sync/push",
            json={"accounts": [acct]},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["accounts_created"] == 1

    def test_push_full_payload(self, client):
        """Push accounts + categories + transactions in one call."""
        acct = _make_account()
        cat = _make_category()
        txn = _make_transaction(acct["id"], cat["id"])

        response = client.post(
            "/api/v1/sync/push",
            json={
                "accounts": [acct],
                "categories": [cat],
                "transactions": [txn],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["accounts_created"] == 1
        assert data["categories_created"] == 1
        assert data["transactions_created"] == 1

    def test_push_is_idempotent(self, client):
        """Pushing the same data twice should silently skip duplicates."""
        acct = _make_account()
        cat = _make_category()

        payload = {"accounts": [acct], "categories": [cat]}

        r1 = client.post("/api/v1/sync/push", json=payload)
        assert r1.status_code == 200
        assert r1.json()["accounts_created"] == 1

        r2 = client.post("/api/v1/sync/push", json=payload)
        assert r2.status_code == 200
        assert r2.json()["accounts_created"] == 0
        assert r2.json()["categories_created"] == 0

    def test_push_categories_with_parent(self, client):
        """Child categories referencing a parent in the same batch."""
        parent = _make_category(name="Food")
        child = _make_category(name="Groceries", parent_id=parent["id"])

        response = client.post(
            "/api/v1/sync/push",
            json={"categories": [parent, child]},
        )
        assert response.status_code == 200
        assert response.json()["categories_created"] == 2

    def test_push_rejects_bad_currency(self, client):
        """Invalid currency_code should be rejected by validation."""
        acct = _make_account(currency_code="eur")  # lowercase → invalid
        response = client.post(
            "/api/v1/sync/push",
            json={"accounts": [acct]},
        )
        assert response.status_code == 422

    def test_push_requires_auth(self):
        """Without auth cookies the endpoint should return 401."""
        from fastapi.testclient import TestClient
        from app.main import app as _app

        with TestClient(_app) as raw_client:
            response = raw_client.post("/api/v1/sync/push", json={})
            assert response.status_code == 401
