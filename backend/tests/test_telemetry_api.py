def test_create_telemetry_entry(client):
    payload = {
        "satelliteId": "SAT-001",
        "timestamp": "2026-10-18T10:00:00Z",
        "altitude": 401.5,
        "velocity": 8.9,
        "status": "healthy",
    }

    response = client.post("/telemetry", json=payload)

    assert response.status_code == 200

    data = response.json()
    assert data["satelliteId"] == "SAT-001"
    assert data["altitude"] == 401.5
    assert data["velocity"] == 8.9
    assert data["status"] == "healthy"
    assert "id" in data
    assert data["id"]

def test_create_telemetry_reject_negative_altitude(client):
    payload = {
        "satelliteId": "SAT-001",
        "timestamp": "2026-10-18T10:00:00Z",
        "altitude": -401.5,
        "velocity": 8.9,
        "status": "healthy",
    }

    response = client.post("/telemetry", json=payload)

    assert response.status_code == 422

def test_create_telemetry_reject_negative_velocity(client):
    payload = {
        "satelliteId": "SAT-001",
        "timestamp": "2026-10-18T10:00:00Z",
        "altitude": 401.5,
        "velocity": -8.9,
        "status": "healthy",
    }

    response = client.post("/telemetry", json=payload)

    assert response.status_code == 422

def test_create_telemetry_invalid_status(client):
    payload = {
        "satelliteId": "SAT-001",
        "timestamp": "2026-10-18T10:00:00Z",
        "altitude": 401.5,
        "velocity": 8.9,
        "status": "invalid_status",
    }

    response = client.post("/telemetry", json=payload)

    assert response.status_code == 422



def test_get_telemetry_by_id(client):
    payload = {
        "satelliteId": "SAT-001",
        "timestamp": "2026-10-18T10:00:00Z",
        "altitude": 401.5,
        "velocity": 8.9,
        "status": "healthy",
    }

    create_response = client.post("/telemetry", json=payload)
    assert create_response.status_code == 200

    telemetry_id = create_response.json()['id']

    id_response = client.get(f"/telemetry/{telemetry_id}")

    assert id_response.status_code == 200
    assert id_response.json()["id"] == telemetry_id
    assert id_response.json()["satelliteId"] == "SAT-001"
    assert id_response.json()["timestamp"] == "2026-10-18T10:00:00Z"
    assert id_response.json()["altitude"] == 401.5
    assert id_response.json()["velocity"] == 8.9
    assert id_response.json()["status"] == "healthy"

def test_get_telemetry_by_id_not_found(client):
    response = client.get(
        "/telemetry/012312345"
    )
    assert response.status_code == 404

def test_delete_telemetry_by_id(client):
    payload = {
        "satelliteId": "SAT-001",
        "timestamp": "2026-10-18T10:00:00Z",
        "altitude": 401.5,
        "velocity": 8.9,
        "status": "healthy",
    }

    create_response = client.post("/telemetry", json=payload)
    assert create_response.status_code == 200

    telemetry_id = create_response.json()['id']

    id_response = client.delete(f"/telemetry/{telemetry_id}")
    assert id_response.status_code == 200
    assert id_response.json()['status'] == 'ok'

def test_delete_telemetry_by_id_not_found(client):
    response = client.delete(
        "/telemetry/012312345"
    )
    assert response.status_code == 404

     

def test_get_all_telemetry_data(client):
    payload1 = {
        "satelliteId": "SAT-001",
        "timestamp": "2026-10-18T10:00:00Z",
        "altitude": 401.5,
        "velocity": 8.9,
        "status": "healthy",
    }

    payload2 = {
        "satelliteId": "SAT-002",
        "timestamp": "2026-10-18T10:00:00Z",
        "altitude": 401.5,
        "velocity": 8.9,
        "status": "critical",
    }

    client.post("/telemetry", json=payload1)
    client.post("/telemetry", json=payload2)


    response = client.get("/telemetry")

    assert response.status_code == 200

    data = response.json()
    assert len(data) == 2

    sat_ids = {record["satelliteId"] for record in data}

    assert sat_ids == {payload1["satelliteId"], payload2["satelliteId"]}

def test_get_all_telemetry_data_pagination(client):
    for i in range(5):
        payload = {
            "satelliteId": f"SAT-00{i}",
            "timestamp": "2026-10-18T10:00:00Z",
            "altitude": 401.5 + i,
            "velocity": 8.9 + i,
            "status": "healthy",
        }

        response = client.post("/telemetry", json=payload)
        assert response.status_code == 200

    response = client.get("/telemetry?limit=2&offset=0")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2

    assert [record["satelliteId"] for record in data] == ['SAT-000', "SAT-001"]


def test_get_all_telemetry_data_pagination_offset(client):
    for i in range(20):
        payload = {
            "satelliteId": f"SAT-00{i}",
            "timestamp": "2026-10-18T10:00:00Z",
            "altitude": 401.5 + i,
            "velocity": 8.9 + i,
            "status": "healthy",
        }

        response = client.post("/telemetry", json=payload)
        assert response.status_code == 200

    response = client.get("/telemetry?limit=2&offset=10")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2

    assert [record["satelliteId"] for record in data] == ['SAT-0010', "SAT-0011"]
