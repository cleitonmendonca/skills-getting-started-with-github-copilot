import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data
    assert "Programming Class" in data


def test_signup_and_unregister():
    activity = "Chess Club"
    email = "testuser@mergington.edu"

    # Ensure user is not already signed up
    client.post(f"/activities/{activity}/unregister?email={email}")

    # Sign up
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert f"Signed up {email} for {activity}" in response.json()["message"]

    # Duplicate signup should fail
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]

    # Unregister
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 200
    assert f"Removed {email} from {activity}" in response.json()["message"]

    # Unregister again should fail
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 400
    assert "not registered" in response.json()["detail"]


def test_signup_activity_full():
    activity = "Chess Club"
    # Fill up the activity
    max_participants = 12
    emails = [f"user{i}@mergington.edu" for i in range(max_participants)]
    # Unregister all first
    for email in emails:
        client.post(f"/activities/{activity}/unregister?email={email}")
    # Sign up max participants
    for email in emails:
        client.post(f"/activities/{activity}/signup?email={email}")
    # Try to sign up one more
    response = client.post(f"/activities/{activity}/signup?email=overflow@mergington.edu")
    assert response.status_code == 400
    assert "Activity is full" in response.json()["detail"]
