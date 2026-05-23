"""Test folder CRUD endpoints — /api/folders."""


def test_create_folder(client, auth_headers):
    """Test membuat folder baru → 200 dan data benar."""
    response = client.post(
        "/api/folders",
        json={
            "name": "My Folder",
            "type": "personal",
            "description": "Test folder",
            "members": ["Alice", "Bob"],
            "color": "sunset",
            "image_data": "data:image/png;base64,iVBORw0KGgo=",
        },
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "My Folder"
    assert data["type"] == "personal"
    assert data["description"] == "Test folder"
    assert data["members"] == ["Alice", "Bob"]
    assert data["color"] == "sunset"
    assert data["image_data"].startswith("data:image/png")
    assert "id" in data
    assert "owner_id" in data


def test_get_folders(client, auth_headers):
    """Test ambil semua folder milik user → list."""
    # Buat 2 folder
    client.post("/api/folders", json={"name": "Folder A"}, headers=auth_headers)
    client.post("/api/folders", json={"name": "Folder B"}, headers=auth_headers)

    response = client.get("/api/folders", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    names = [f["name"] for f in data]
    assert "Folder A" in names
    assert "Folder B" in names


def test_get_folder_by_id(client, auth_headers):
    """Test ambil satu folder berdasarkan ID."""
    create_resp = client.post(
        "/api/folders",
        json={"name": "Single Folder"},
        headers=auth_headers,
    )
    folder_id = create_resp.json()["id"]

    response = client.get(f"/api/folders/{folder_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Single Folder"


def test_get_folder_not_found(client, auth_headers):
    """Test ambil folder dengan ID tidak ada → 404."""
    response = client.get("/api/folders/9999", headers=auth_headers)
    assert response.status_code == 404


def test_update_folder(client, auth_headers):
    """Test update folder → data berubah."""
    create_resp = client.post(
        "/api/folders",
        json={"name": "Old Name", "description": "Old desc"},
        headers=auth_headers,
    )
    folder_id = create_resp.json()["id"]

    response = client.put(
        f"/api/folders/{folder_id}",
        json={"name": "New Name", "description": "New desc"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Name"
    assert data["description"] == "New desc"


def test_update_folder_image(client, auth_headers):
    """Test update hanya image_data → foto berubah."""
    create_resp = client.post(
        "/api/folders",
        json={"name": "Photo Folder"},
        headers=auth_headers,
    )
    folder_id = create_resp.json()["id"]
    assert create_resp.json()["image_data"] == ""

    response = client.put(
        f"/api/folders/{folder_id}",
        json={"image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRg=="},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["image_data"].startswith("data:image/jpeg")


def test_update_folder_not_found(client, auth_headers):
    """Test update folder yang tidak ada → 404."""
    response = client.put(
        "/api/folders/9999",
        json={"name": "Ghost"},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_delete_folder(client, auth_headers):
    """Test hapus folder → sukses dan folder hilang."""
    create_resp = client.post(
        "/api/folders",
        json={"name": "To Delete"},
        headers=auth_headers,
    )
    folder_id = create_resp.json()["id"]

    response = client.delete(f"/api/folders/{folder_id}", headers=auth_headers)
    assert response.status_code == 200

    # Pastikan folder sudah hilang
    get_resp = client.get(f"/api/folders/{folder_id}", headers=auth_headers)
    assert get_resp.status_code == 404


def test_delete_folder_not_found(client, auth_headers):
    """Test hapus folder yang tidak ada → 404."""
    response = client.delete("/api/folders/9999", headers=auth_headers)
    assert response.status_code == 404


def test_folder_requires_auth(client):
    """Test akses folder tanpa token → 401."""
    response = client.get("/api/folders")
    assert response.status_code == 401

    response = client.post("/api/folders", json={"name": "Fail"})
    assert response.status_code == 401


def test_folder_members_persistence(client, auth_headers):
    """Test members tersimpan dan terbaca sebagai list."""
    create_resp = client.post(
        "/api/folders",
        json={"name": "Team Folder", "members": ["Alice", "Bob", "Charlie"]},
        headers=auth_headers,
    )
    folder_id = create_resp.json()["id"]
    assert create_resp.json()["members"] == ["Alice", "Bob", "Charlie"]

    # Re-fetch
    get_resp = client.get(f"/api/folders/{folder_id}", headers=auth_headers)
    assert get_resp.json()["members"] == ["Alice", "Bob", "Charlie"]

    # Update members
    put_resp = client.put(
        f"/api/folders/{folder_id}",
        json={"members": ["Alice", "Dave"]},
        headers=auth_headers,
    )
    assert put_resp.json()["members"] == ["Alice", "Dave"]
