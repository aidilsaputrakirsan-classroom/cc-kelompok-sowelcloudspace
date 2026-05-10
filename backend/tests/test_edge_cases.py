"""
Test edge cases — input invalid, empty fields, pagination, stats, dll.
Target: menambah coverage ≥ 60% dan total test ≥ 15.
"""


# ==================== EDGE CASE: REGISTER ====================

def test_register_empty_email(client):
    """Test register dengan email kosong → 422."""
    response = client.post("/auth/register", json={
        "email": "",
        "password": "ValidPass123",
        "name": "Test User"
    })
    assert response.status_code == 422


def test_register_invalid_email_format(client):
    """Test register dengan format email invalid → 422."""
    response = client.post("/auth/register", json={
        "email": "bukan-email",
        "password": "ValidPass123",
        "name": "Test User"
    })
    assert response.status_code == 422


def test_register_short_password(client):
    """Test register dengan password kurang dari 8 karakter → 422."""
    response = client.post("/auth/register", json={
        "email": "short@example.com",
        "password": "123",
        "name": "Test User"
    })
    assert response.status_code == 422


def test_register_missing_name(client):
    """Test register tanpa field name → 422."""
    response = client.post("/auth/register", json={
        "email": "noname@example.com",
        "password": "ValidPass123"
    })
    assert response.status_code == 422


def test_register_empty_body(client):
    """Test register dengan body kosong → 422."""
    response = client.post("/auth/register", json={})
    assert response.status_code == 422


# ==================== EDGE CASE: LOGIN ====================

def test_login_nonexistent_user(client):
    """Test login dengan email yang belum terdaftar → 401."""
    response = client.post("/auth/login", data={
        "username": "nobody@example.com",
        "password": "SomePassword123"
    })
    assert response.status_code == 401


def test_login_empty_password(client):
    """Test login dengan password kosong → 422."""
    response = client.post("/auth/login", data={
        "username": "test@example.com",
        "password": ""
    })
    # FastAPI OAuth2 form requires password field
    assert response.status_code in [401, 422]


# ==================== EDGE CASE: TASK ====================

def test_create_task_empty_title(client, auth_headers):
    """Test membuat task dengan title kosong — tetap berhasil karena schema menerima str kosong."""
    response = client.post("/tasks", json={
        "title": "",
        "priority": "high"
    }, headers=auth_headers)
    # String kosong tetap valid untuk tipe str di Pydantic
    assert response.status_code == 200
    assert response.json()["title"] == ""


def test_create_task_missing_title(client, auth_headers):
    """Test membuat task tanpa field title → 422."""
    response = client.post("/tasks", json={
        "description": "Tanpa title",
        "priority": "low"
    }, headers=auth_headers)
    assert response.status_code == 422


def test_create_task_with_all_fields(client, auth_headers):
    """Test membuat task dengan semua field lengkap."""
    response = client.post("/tasks", json={
        "title": "Full Task",
        "description": "Deskripsi lengkap",
        "priority": "high",
        "deadline": "2026-12-31T23:59:59",
        "assigned_to": "Anjas"
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Full Task"
    assert data["description"] == "Deskripsi lengkap"
    assert data["priority"] == "high"
    assert data["assigned_to"] == "Anjas"


def test_update_task_not_found(client, auth_headers):
    """Test update task yang tidak ada → 404."""
    response = client.put("/tasks/9999", json={
        "title": "Updated Title"
    }, headers=auth_headers)
    assert response.status_code == 404


def test_delete_task_not_found(client, auth_headers):
    """Test delete task yang tidak ada → 404."""
    response = client.delete("/tasks/9999", headers=auth_headers)
    assert response.status_code == 404


def test_complete_task_not_found(client, auth_headers):
    """Test complete task yang tidak ada → tetap return (None)."""
    response = client.put("/tasks/9999/complete", headers=auth_headers)
    # update_task returns None → endpoint returns null response
    assert response.status_code == 200 or response.status_code == 404


# ==================== PAGINATION ====================

def test_pagination_skip_limit(client, auth_headers):
    """Test pagination dengan ?skip=0&limit=2."""
    # Buat 5 tasks
    for i in range(5):
        client.post("/tasks", json={
            "title": f"Pagination Task {i+1}",
            "priority": "medium"
        }, headers=auth_headers)

    # Ambil dengan limit=2
    response = client.get("/tasks?skip=0&limit=2", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_pagination_skip(client, auth_headers):
    """Test pagination skip melewati beberapa item."""
    # Buat 3 tasks
    for i in range(3):
        client.post("/tasks", json={
            "title": f"Skip Task {i+1}",
            "priority": "low"
        }, headers=auth_headers)

    # Ambil semua
    all_resp = client.get("/tasks", headers=auth_headers)
    total = len(all_resp.json())

    # Skip 1
    response = client.get(f"/tasks?skip=1&limit=100", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == total - 1


def test_pagination_limit_zero(client, auth_headers):
    """Test pagination dengan limit=0 → return empty list."""
    client.post("/tasks", json={
        "title": "Limit Zero Task",
        "priority": "high"
    }, headers=auth_headers)

    response = client.get("/tasks?skip=0&limit=0", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


# ==================== STATS ====================

def test_stats_empty(client, auth_headers):
    """Test stats ketika belum ada task → semua 0."""
    response = client.get("/tasks/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["completed"] == 0
    assert data["pending"] == 0


def test_stats_unauthorized(client):
    """Test stats tanpa login → 401."""
    response = client.get("/tasks/stats")
    assert response.status_code == 401


def test_stats_after_create_and_complete(client, auth_headers):
    """Test stats setelah buat dan selesaikan beberapa task."""
    # Buat 3 tasks
    ids = []
    for i in range(3):
        resp = client.post("/tasks", json={
            "title": f"Stats Task {i+1}",
            "priority": "medium"
        }, headers=auth_headers)
        ids.append(resp.json()["id"])

    # Complete 2 tasks
    client.put(f"/tasks/{ids[0]}/complete", headers=auth_headers)
    client.put(f"/tasks/{ids[1]}/complete", headers=auth_headers)

    response = client.get("/tasks/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert data["completed"] == 2
    assert data["pending"] == 1


# ==================== ROOT & TEAM ====================

def test_root_endpoint(client):
    """Test root endpoint → 200."""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_team_endpoint(client):
    """Test team endpoint → return team info."""
    response = client.get("/team")
    assert response.status_code == 200
    data = response.json()
    assert "team" in data
    assert "members" in data
    assert len(data["members"]) == 4


# ==================== AUTH TOKEN ====================

def test_invalid_token(client):
    """Test akses endpoint protected dengan token invalid → 401."""
    response = client.get("/tasks", headers={
        "Authorization": "Bearer invalid-token-xxx"
    })
    assert response.status_code == 401


def test_missing_token(client):
    """Test akses endpoint protected tanpa token → 401."""
    response = client.get("/tasks")
    assert response.status_code == 401
