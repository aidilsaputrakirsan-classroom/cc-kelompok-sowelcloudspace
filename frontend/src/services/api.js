const FALLBACK_API_URL = "http://localhost:8000"

export class ApiError extends Error {
  constructor(
    message,
    { code = "API_ERROR", status = null, userMessage = message, isFatal = false, cause = null } = {},
  ) {
    super(message)
    this.name = "ApiError"
    this.code = code
    this.status = status
    this.userMessage = userMessage
    this.isFatal = isFatal
    this.cause = cause
  }
}

function createApiError(message, options) {
  return new ApiError(message, options)
}

export function isApiError(error) {
  return error instanceof ApiError
}

export function shouldEscalateApiError(error) {
  return isApiError(error) && error.isFatal
}

export function getUserFriendlyErrorMessage(error, fallbackMessage = "Terjadi kendala saat menghubungi server.") {
  if (isApiError(error)) {
    return error.userMessage || error.message || fallbackMessage
  }
  if (error instanceof Error) {
    return error.message || fallbackMessage
  }
  return fallbackMessage
}

export function normalizeApiUrl(rawValue) {
  const value = rawValue?.trim()
  if (!value) {
    return FALLBACK_API_URL
  }

  if (value.includes("xxx") || value.includes("your-") || value.includes("__")) {
    throw createApiError("VITE_API_URL masih menggunakan placeholder.", {
      code: "INVALID_API_URL",
      userMessage: "Aplikasi belum terhubung ke backend production. Periksa kembali konfigurasi VITE_API_URL.",
      isFatal: true,
    })
  }

  try {
    const url = new URL(value)
    return url.toString().replace(/\/$/, "")
  } catch {
    throw createApiError("VITE_API_URL bukan URL yang valid.", {
      code: "INVALID_API_URL",
      userMessage: "Konfigurasi API production tidak valid. Periksa format VITE_API_URL.",
      isFatal: true,
    })
  }
}

export const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL)

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
    headers.Authorization = `Bearer ${authToken}`
  }
  return headers
}

async function parseErrorResponse(response) {
  const errorBody = await response.json().catch(() => null)
  return errorBody?.detail || errorBody?.message || null
}

async function handleResponse(response) {
  if (response.status === 401) {
    clearToken()
    throw createApiError("UNAUTHORIZED", {
      code: "UNAUTHORIZED",
      status: 401,
      userMessage: "Sesi kamu sudah berakhir. Silakan login kembali.",
    })
  }

  if (!response.ok) {
    const detail = await parseErrorResponse(response)
    const message = detail || `Request gagal (${response.status})`
    const isServerError = response.status >= 500

    throw createApiError(message, {
      code: isServerError ? "SERVER_ERROR" : "REQUEST_FAILED",
      status: response.status,
      userMessage: isServerError
        ? "Server sedang bermasalah. Coba beberapa saat lagi."
        : message,
      isFatal: isServerError,
    })
  }

  if (response.status === 204) return null
  return response.json()
}

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, options)
    return await handleResponse(response)
  } catch (error) {
    if (isApiError(error)) {
      throw error
    }

    throw createApiError("Tidak dapat terhubung ke server.", {
      code: "NETWORK_ERROR",
      userMessage: "Kami tidak bisa menghubungi server saat ini. Periksa koneksi atau backend production kamu.",
      isFatal: true,
      cause: error,
    })
  }
}

export async function register(userData) {
  return request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  })
}

export async function login(username, password) {
  const formData = new URLSearchParams()
  // Backend FastAPI menggunakan OAuth2PasswordRequestForm,
  // jadi identifier login harus dikirim lewat field "username".
  formData.append("username", username)
  formData.append("password", password)

  const data = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  })

  if (!data.access_token) {
<<<<<<< HEAD
    throw createApiError(data.detail || "Username atau password salah", {
=======
    throw createApiError(data.detail || "Email atau password salah", {
>>>>>>> c6ed4766d199de2a2b0983e43212db80a794ae3e
      code: "INVALID_AUTH_RESPONSE",
      userMessage: "Respons login dari server tidak lengkap. Coba lagi.",
    })
  }

  setToken(data.access_token)
  return data
}

export async function fetchTasks() {
  return request("/tasks", {
    headers: authHeaders(),
  })
}

export async function fetchTask(id) {
  return request(`/tasks/${id}`, {
    headers: authHeaders(),
  })
}

export async function createTask(taskData) {
  return request("/tasks", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(taskData),
  })
}

export async function updateTask(id, taskData) {
  return request(`/tasks/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(taskData),
  })
}

export async function completeTask(id) {
  return request(`/tasks/${id}/complete`, {
    method: "PUT",
    headers: authHeaders(),
  })
}

export async function deleteTask(id) {
  return request(`/tasks/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
}

export async function fetchStats() {
  return request("/tasks/stats", {
    headers: authHeaders(),
  })
}

export async function checkHealth() {
  try {
    const data = await request("/health")
    return data.status === "healthy"
  } catch {
    return false
  }
}
