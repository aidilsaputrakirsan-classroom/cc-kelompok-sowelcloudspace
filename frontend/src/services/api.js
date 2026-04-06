const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

let authToken = localStorage.getItem("sowel_token") || null

export function setToken(token) {
  authToken = token
  localStorage.setItem("sowel_token", token)
}

export function getToken() {
  return authToken
}

export function clearToken() {
  authToken = null
  localStorage.removeItem("sowel_token")
}

function authHeaders(isForm = false) {
  const headers = {}
  if (!isForm) {
    headers["Content-Type"] = "application/json"
  }
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`
  }
  return headers
}

async function handleResponse(response) {
  if (response.status === 401) {
    clearToken()
    throw new Error("UNAUTHORIZED")
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `Request gagal (${response.status})`)
  }
  if (response.status === 204) return null
  return response.json()
}

// ==================== AUTH ====================

export async function register(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  })
  return handleResponse(response)
}

export async function login(email, password) {
  // OAuth2PasswordRequestForm expects form-urlencoded with "username" field
  const formData = new URLSearchParams()
  formData.append("username", email)
  formData.append("password", password)

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  })
  const data = await handleResponse(response)
  if (!data.access_token) {
    throw new Error(data.detail || "Email atau password salah")
  }
  setToken(data.access_token)
  return data
}

// ==================== TASKS ====================

export async function fetchTasks() {
  const response = await fetch(`${API_URL}/tasks`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function fetchTask(id) {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function createTask(taskData) {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(taskData),
  })
  return handleResponse(response)
}

export async function updateTask(id, taskData) {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(taskData),
  })
  return handleResponse(response)
}

export async function completeTask(id) {
  const response = await fetch(`${API_URL}/tasks/${id}/complete`, {
    method: "PUT",
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function deleteTask(id) {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function fetchStats() {
  const response = await fetch(`${API_URL}/tasks/stats`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/health`)
    const data = await response.json()
    return data.status === "healthy"
  } catch {
    return false
  }
}
