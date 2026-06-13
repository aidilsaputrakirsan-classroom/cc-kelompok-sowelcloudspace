# API Contract — Sowel Cloud Space

## Base URLs

| Environment | Gateway URL |
|-------------|-------------|
| Local Development | http://localhost:8000 |
| Production | https://backend-production-3ffb5.up.railway.app |

## Authentication

All protected endpoints require JWT token in header:
`Authorization: Bearer <access_token>`

Token diperoleh dari `POST /auth/login`.

## Error Response Format

Semua error menggunakan format yang konsisten:
```json
{
    "detail": "Error message description"
}
```

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created |
| 204 | Deleted (no content) |
| 400 | Bad request / validation error |
| 401 | Unauthorized / invalid token |
| 403 | Forbidden / tidak memiliki akses |
| 404 | Resource not found |
| 422 | Validation error (Pydantic) |
| 500 | Server error |
| 503 | Service unavailable |

---

# Auth Service Endpoints

## POST /auth/register
- **Auth**: None
- **Body**: `{"email": "str", "name": "str", "password": "str (min 8)"}`
- **Response 200**: `{"id": int, "email": "str", "name": "str"}`

## POST /auth/login
- **Auth**: None
- **Body (form-data)**: `username=str&password=str` *(Note: username diisi dengan `name` dari user)*
- **Response 200**: `{"access_token": "str", "token_type": "bearer", "user": {"id": int, "name": "str", "email": "str"}}`

## GET /auth/me
- **Auth**: Required
- **Response 200**: `{"id": int, "name": "str", "email": "str"}`

## GET /users/verify/{username}
- **Auth**: None (Public)
- **Response 200**: `{"exists": true, "user": {"id": int, "name": "str"}}`

---

# Task Service Endpoints

## GET /health
- **Auth**: None
- **Response 200**: `{"status": "healthy", "service": "backend", "version": "1.0.0", "database": "connected"}`

## GET /team
- **Auth**: None
- **Response 200**: Detail anggota cloud-team-sowelcloudspace.

## GET /tasks
- **Auth**: Required
- **Query Params**: `skip=int`, `limit=int`, `folder_id=int` (optional)
- **Response 200**: `[TaskResponse]`

## POST /tasks
- **Auth**: Required
- **Body**: `TaskCreate`
- **Response 200**: `TaskResponse`

## GET /tasks/{task_id}
- **Auth**: Required
- **Response 200**: `TaskResponse`

## PUT /tasks/{task_id}
- **Auth**: Required
- **Body**: `TaskUpdate`
- **Response 200**: `TaskResponse`

## DELETE /tasks/{task_id}
- **Auth**: Required (Admin/Owner)
- **Response 200**: `{"message": "Deleted"}`

## PUT /tasks/{task_id}/complete
- **Auth**: Required
- **Response 200**: `TaskResponse` (dengan status="done")

## GET /tasks/stats
- **Auth**: Optional (Graceful Degradation)
- **Response 200 (With Auth)**: `{"total": int, "completed": int, "pending": int}`
- **Response 200 (No Auth)**: `{"total": 0, "completed": 0, "pending": 0}` (Fallback)

## GET /tasks/public
- **Auth**: None
- **Query Params**: `limit=int` (default 10)
- **Response 200**: `[TaskResponse]`

## GET /tasks/reminders/upcoming
- **Auth**: Required
- **Query Params**: `difficulty=str` (optional), `limit=int` (optional)
- **Response 200**: `[TaskResponse]` (diurutkan dari deadline terdekat)

## GET /tasks/reminders/calendar
- **Auth**: Required
- **Query Params**: `year=int`, `month=int`
- **Response 200**: `[TaskResponse]`

---

# Folder Endpoints

## GET /api/folders
- **Auth**: Required
- **Response 200**: `[FolderResponse]`

## POST /api/folders
- **Auth**: Required
- **Body**: `FolderCreate`
- **Response 200**: `FolderResponse`

## GET /api/folders/{folder_id}
- **Auth**: Required
- **Response 200**: `FolderResponse`

## PUT /api/folders/{folder_id}
- **Auth**: Required (Owner Only)
- **Body**: `FolderUpdate`
- **Response 200**: `FolderResponse`

## DELETE /api/folders/{folder_id}
- **Auth**: Required (Owner Only)
- **Response 200**: `{"message": "Folder deleted"}`
