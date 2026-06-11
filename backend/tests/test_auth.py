"""Test authentication endpoints."""


def test_register_success(client):
    """Test register user baru berhasil."""
    response = client.post("/auth/register", json={
        "email": "newuser@example.com",
        "password": "SecurePass123",
        "name": "New User"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["name"] == "New User"
    assert "id" in data
    # Password TIDAK boleh ada di response
    assert "password" not in data
    assert "hashed_password" not in data


def test_register_duplicate_email(client):
    """Test register dengan email yang sudah ada → 400."""
    # Register pertama
    client.post("/auth/register", json={
        "email": "duplicate@example.com",
        "password": "Pass1234567",
        "name": "User 1"
    })
    # Register kedua dengan email sama
    response = client.post("/auth/register", json={
        "email": "duplicate@example.com",
        "password": "Pass4567890",
        "name": "User 2"
    })
    assert response.status_code == 400


def test_login_success(client):
    """Test login dengan kredensial benar → return token."""
    # Register dulu
    client.post("/auth/register", json={
        "email": "login@example.com",
        "password": "MyPassword123",
        "name": "Login User"
    })
    # Login — menggunakan form data (OAuth2PasswordRequestForm), username = name
    response = client.post("/auth/login", data={
        "username": "Login User",
        "password": "MyPassword123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    # Verify user data is returned
    assert "user" in data
    assert data["user"]["name"] == "Login User"
    assert data["user"]["email"] == "login@example.com"


def test_login_wrong_password(client):
    """Test login dengan password salah → 401."""
    # Register
    client.post("/auth/register", json={
        "email": "wrongpass@example.com",
        "password": "CorrectPass123",
        "name": "User"
    })
    # Login dengan password salah (username = name)
    response = client.post("/auth/login", data={
        "username": "User",
        "password": "WrongPassword"
    })
    assert response.status_code == 401