import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    """
    Fixture to provide a TestClient instance for API testing.
    """
    return TestClient(app)

@pytest.fixture
def mock_admin_email():
    return "razingerjosef@gmail.com"

@pytest.fixture
def mock_operator_data():
    return {
        "user_id": "user-123",
        "full_name": "Test Doctor",
        "email": "test.doctor@gmail.com",
        "phone": "+254700000000",
        "organization": "Test Hospital",
        "license_number": "MED-001",
        "county": "Nairobi",
        "role": "doctor"
    }
