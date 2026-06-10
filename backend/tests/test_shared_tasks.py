import pytest

def get_auth_headers(client, email, password, name):
    # Register
    client.post("/auth/register", json={
        "email": email,
        "password": password,
        "name": name
    })
    # Login
    response = client.post("/auth/login", data={
        "username": name,
        "password": password
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_shared_task_workflow(client):
    # 1. Setup 3 Users: Alice (owner), Bob (member), Charlie (stranger)
    alice_headers = get_auth_headers(client, "alice@example.com", "Password123", "Alice")
    bob_headers = get_auth_headers(client, "bob@example.com", "Password123", "Bob")
    charlie_headers = get_auth_headers(client, "charlie@example.com", "Password123", "Charlie")

    # 2. Alice creates a Group Folder with Bob as a member
    folder_resp = client.post("/api/folders", json={
        "name": "Folder Projek Kelompok",
        "type": "group",
        "description": "Folder untuk kerja kelompok Alice dan Bob",
        "members": ["Bob"],
        "color": "sunset"
    }, headers=alice_headers)
    assert folder_resp.status_code == 200
    folder_id = folder_resp.json()["id"]

    # 3. Alice creates a Task inside that folder
    task_resp = client.post("/tasks", json={
        "title": "Setup Repositori",
        "description": "Fork dan clone repo utama",
        "priority": "high",
        "folder_id": folder_id
    }, headers=alice_headers)
    assert task_resp.status_code == 200
    task_id = task_resp.json()["id"]

    # 4. Bob (member) fetches tasks and should see Alice's task in the folder
    bob_tasks_resp = client.get("/tasks", headers=bob_headers)
    assert bob_tasks_resp.status_code == 200
    bob_tasks = bob_tasks_resp.json()
    assert len(bob_tasks) >= 1
    assert any(t["id"] == task_id for t in bob_tasks)

    # Bob fetches tasks filtered by folder_id
    bob_folder_tasks_resp = client.get(f"/tasks?folder_id={folder_id}", headers=bob_headers)
    assert bob_folder_tasks_resp.status_code == 200
    assert any(t["id"] == task_id for t in bob_folder_tasks_resp.json())

    # Bob fetches the task directly (GET /tasks/{id})
    bob_single_task_resp = client.get(f"/tasks/{task_id}", headers=bob_headers)
    assert bob_single_task_resp.status_code == 200
    assert bob_single_task_resp.json()["title"] == "Setup Repositori"

    # 5. Charlie (stranger) should NOT see the task in their list
    charlie_tasks_resp = client.get("/tasks", headers=charlie_headers)
    assert charlie_tasks_resp.status_code == 200
    assert not any(t["id"] == task_id for t in charlie_tasks_resp.json())

    # Charlie should NOT be allowed to read the task directly (GET /tasks/{id}) -> 403
    charlie_single_task_resp = client.get(f"/tasks/{task_id}", headers=charlie_headers)
    assert charlie_single_task_resp.status_code == 403

    # Charlie should NOT be allowed to fetch tasks with folder_id -> returns empty list (or fails validation)
    charlie_folder_tasks_resp = client.get(f"/tasks?folder_id={folder_id}", headers=charlie_headers)
    assert len(charlie_folder_tasks_resp.json()) == 0

    # 6. Charlie should NOT be allowed to create a task in Alice's folder -> 403
    charlie_create_task_resp = client.post("/tasks", json={
        "title": "Task Charlie Ilegal",
        "folder_id": folder_id
    }, headers=charlie_headers)
    assert charlie_create_task_resp.status_code == 403

    # 7. Bob (member) updates the task status -> 200
    bob_complete_resp = client.put(f"/tasks/{task_id}/complete", headers=bob_headers)
    assert bob_complete_resp.status_code == 200
    assert bob_complete_resp.json()["status"] == "done"

    # Bob updates the task details -> 200
    bob_update_resp = client.put(f"/tasks/{task_id}", json={
        "title": "Setup Repositori Selesai",
        "priority": "medium"
    }, headers=bob_headers)
    assert bob_update_resp.status_code == 200
    assert bob_update_resp.json()["title"] == "Setup Repositori Selesai"

    # 8. Bob (member) attempts to delete the task -> should be rejected with 403
    bob_delete_resp = client.delete(f"/tasks/{task_id}", headers=bob_headers)
    assert bob_delete_resp.status_code == 403

    # 9. Alice (owner of task and folder) deletes the task -> 200
    alice_delete_resp = client.delete(f"/tasks/{task_id}", headers=alice_headers)
    assert alice_delete_resp.status_code == 200

    # Verify task is deleted
    alice_get_deleted_resp = client.get(f"/tasks/{task_id}", headers=alice_headers)
    assert alice_get_deleted_resp.status_code == 404
