import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.db import reset_db


@pytest.fixture
def client():
    #  Clear our array db before running test
    reset_db()

    with TestClient(app) as test_client:
        #  Run unit test
        yield test_client

    #  Clear our array db after test is ran
    reset_db()