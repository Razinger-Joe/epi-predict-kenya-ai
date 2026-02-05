from fastapi.testclient import TestClient
import pytest

def test_list_operators(client: TestClient):
    """Test listing all operators."""
    response = client.get("/api/operators")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_register_operator_success(client: TestClient, mock_operator_data):
    """Test successful operator registration."""
    response = client.post("/api/operators/register", json=mock_operator_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["operator"]["email"] == mock_operator_data["email"]
    assert data["operator"]["is_verified"] is False

def test_register_operator_invalid_email(client: TestClient, mock_operator_data):
    """Test registration with non-Gmail account."""
    mock_operator_data["email"] = "test@yahoo.com"
    response = client.post("/api/operators/register", json=mock_operator_data)
    assert response.status_code == 400
    assert "Gmail account" in response.json()["detail"]

def test_approve_operator_unauthorized(client: TestClient):
    """Test approval without admin email."""
    response = client.post("/api/operators/op-123/approve?admin_email=fake@email.com")
    assert response.status_code == 403

def test_check_admin_status(client: TestClient, mock_admin_email):
    """Test checking admin status."""
    response = client.get(f"/api/operators/check-admin/{mock_admin_email}")
    assert response.status_code == 200
    assert response.json()["is_admin"] is True

    response = client.get("/api/operators/check-admin/regular@user.com")
    assert response.status_code == 200
    assert response.json()["is_admin"] is False
