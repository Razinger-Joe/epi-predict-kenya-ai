from fastapi.testclient import TestClient
import pytest

def test_harvest_simulation(client: TestClient):
    """Test simulating social media harvest."""
    response = client.post("/api/insights/harvest")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["insights"], list)
    assert len(data["insights"]) > 0

def test_harvest_with_filters(client: TestClient):
    """Test harvesting with specific county filters."""
    payload = {"counties": ["Nairobi"]}
    response = client.post("/api/insights/harvest", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Check that returned insights are only from Nairobi
    for insight in data["insights"]:
        assert insight["county"] == "Nairobi"

def test_list_insights(client: TestClient):
    """Test listing insights."""
    response = client.get("/api/insights")
    assert response.status_code == 200
    data = response.json()
    assert "insights" in data
    assert isinstance(data["insights"], list)

def test_featured_counties(client: TestClient):
    """Test retrieving featured counties."""
    response = client.get("/api/insights/counties/featured")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 10
    assert len(data["counties"]) == 10
    
    # Verify key counties exist
    counties = [c["name"] for c in data["counties"]]
    assert "Nairobi" in counties
    assert "Kisumu" in counties
    assert "Turkana" in counties
