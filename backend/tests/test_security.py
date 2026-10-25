from fastapi.testclient import TestClient
from app.main import app, safe_path
from fastapi import HTTPException
import pytest

def test_safe_path_rejects_parent_traversal():
    with pytest.raises(HTTPException):
        safe_path("../secret.txt")

def test_safe_path_rejects_env():
    with pytest.raises(HTTPException):
        safe_path(".env")

def test_health_endpoint():
    client = TestClient(app)
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
