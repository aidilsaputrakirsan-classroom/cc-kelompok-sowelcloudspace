"""Test CRUD task endpoints."""


def test_create_task(client, auth_headers):
    """Test membuat task baru."""
    response = client.post("/tasks", json={
        "title": "Belajar Cloud Computing",
        "description": "Mempelajari dasar-dasar cloud",
        "priority": "high"
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Belajar Cloud Computing"
    assert data["priority"] == "high"
    assert data["status"] == "pending"
    assert "id" in data


def test_create_task_unauthorized(client):
    """Test membuat task tanpa login → 401."""
    response = client.post("/tasks", json={
        "title": "Task tanpa login",
        "priority": "low"
    })
    assert response.status_code == 401


def test_get_tasks(client, auth_headers):
    """Test mengambil daftar tasks → 200."""
    # Buat 2 tasks
    client.post("/tasks", json={
        "title": "Task 1", "priority": "high"
    }, headers=auth_headers)
    client.post("/tasks", json={
        "title": "Task 2", "priority": "low"
    }, headers=auth_headers)

    response = client.get("/tasks", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


def test_get_task_not_found(client, auth_headers):
    """Test mengambil task yang tidak ada → 404."""
    response = client.get("/tasks/9999", headers=auth_headers)
    assert response.status_code == 404


def test_update_task(client, auth_headers):
    """Test update task → data berubah."""
    # Buat task
    create_resp = client.post("/tasks", json={
        "title": "Task Awal", "priority": "medium"
    }, headers=auth_headers)
    task_id = create_resp.json()["id"]

    # Update
    response = client.put(f"/tasks/{task_id}", json={
        "title": "Task Diupdate",
        "priority": "high"
    }, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["title"] == "Task Diupdate"
    assert response.json()["priority"] == "high"


def test_delete_task(client, auth_headers):
    """Test hapus task → 200, lalu GET → 404."""
    # Buat task
    create_resp = client.post("/tasks", json={
        "title": "Task Hapus", "priority": "low"
    }, headers=auth_headers)
    task_id = create_resp.json()["id"]

    # Hapus
    response = client.delete(f"/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200

    # Verifikasi sudah tidak ada
    get_resp = client.get(f"/tasks/{task_id}", headers=auth_headers)
    assert get_resp.status_code == 404


def test_complete_task(client, auth_headers):
    """Test menyelesaikan task → status jadi 'done'."""
    # Buat task
    create_resp = client.post("/tasks", json={
        "title": "Task Selesai", "priority": "medium"
    }, headers=auth_headers)
    task_id = create_resp.json()["id"]

    # Complete
    response = client.put(f"/tasks/{task_id}/complete", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "done"


def test_task_stats(client, auth_headers):
    """Test endpoint stats → total, completed, pending."""
    # Buat 2 tasks
    resp1 = client.post("/tasks", json={
        "title": "Task Pending", "priority": "high"
    }, headers=auth_headers)
    resp2 = client.post("/tasks", json={
        "title": "Task Done", "priority": "low"
    }, headers=auth_headers)

    # Complete satu task
    task_id = resp2.json()["id"]
    client.put(f"/tasks/{task_id}/complete", headers=auth_headers)

    # Cek stats
    response = client.get("/tasks/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert data["completed"] >= 1
    assert data["pending"] >= 1
