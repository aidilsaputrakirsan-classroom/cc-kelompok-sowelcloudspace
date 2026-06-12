const FALLBACK_API_URL = "http://localhost"
const USER_STORAGE_KEY = "sowel_user"

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
    const hostname = url.hostname.toLowerCase()
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1"

    if (url.protocol !== "https:" && !isLocalhost) {
      throw createApiError("VITE_API_URL harus menggunakan HTTPS.", {
        code: "INSECURE_API_URL",
        userMessage: "Backend production harus memakai URL HTTPS penuh agar tidak terkena Mixed Content di Railway.",
        isFatal: true,
      })
    }

    return url.toString().replace(/\/$/, "")
  } catch (error) {
    if (isApiError(error)) {
      throw error
    }

    throw createApiError("VITE_API_URL bukan URL yang valid.", {
      code: "INVALID_API_URL",
      userMessage: "Konfigurasi API production tidak valid. Periksa format VITE_API_URL.",
      isFatal: true,
    })
  }
}

export const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL)

let authToken = localStorage.getItem("sowel_token") || null

function normalizeFolder(folder) {
  if (!folder || typeof folder !== "object") return null

  return {
    id: folder.id,
    name: folder.name || "",
    type: folder.type || "personal",
    description: folder.description || "",
    members: Array.isArray(folder.members) ? folder.members : [],
    color: folder.color || "indigo",
    imageData: folder.imageData || folder.image_data || "",
    ownerId: folder.ownerId ?? folder.owner_id ?? null,
    createdAt: folder.createdAt || folder.created_at || null,
    updatedAt: folder.updatedAt || folder.updated_at || null,
  }
}

function normalizeTask(task) {
  if (!task || typeof task !== "object") return null

  const folderId = task.folderId ?? task.folder_id ?? null
  const createdAt = task.createdAt || task.created_at || null
  const updatedAt = task.updatedAt || task.updated_at || null
  const folder = normalizeFolder(task.folder)

  return {
    ...task,
    folderId,
    folder_id: folderId,
    folder,
    createdAt,
    created_at: createdAt,
    updatedAt,
    updated_at: updatedAt,
  }
}

function serializeFolderPayload(folderData = {}) {
  return {
    name: folderData.name?.trim() || "",
    type: folderData.type || "personal",
    description: folderData.description?.trim() || "",
    members: Array.isArray(folderData.members) ? folderData.members : [],
    color: folderData.color || "indigo",
    image_data: folderData.imageData || folderData.image_data || "",
  }
}

function storeUser(user) {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY)
    return
  }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : null
  } catch {
    return null
  }
}

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
  localStorage.removeItem(USER_STORAGE_KEY)
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
    const is503 = response.status === 503

    throw createApiError(message, {
      code: is503 ? "SERVICE_UNAVAILABLE" : (isServerError ? "SERVER_ERROR" : "REQUEST_FAILED"),
      status: response.status,
      userMessage: is503
        ? "Layanan tidak tersedia saat ini. Silakan coba beberapa saat lagi."
        : (isServerError
          ? "Server sedang bermasalah. Coba beberapa saat lagi."
          : message),
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
  formData.append("username", username)
  formData.append("password", password)

  const data = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  })

  if (!data.access_token) {
    throw createApiError(data.detail || "Username atau password salah", {
      code: "INVALID_AUTH_RESPONSE",
      userMessage: "Respons login dari server tidak lengkap. Coba lagi.",
    })
  }

  setToken(data.access_token)
  storeUser(data.user ?? null)
  return data
}

export async function fetchCurrentUser() {
  const user = await request("/auth/me", {
    headers: authHeaders(),
  })
  storeUser(user)
  return user
}

export async function fetchTasks() {
  const data = await request("/tasks", {
    headers: authHeaders(),
  })
  return Array.isArray(data) ? data.map(normalizeTask).filter(Boolean) : []
}

function normalizeTaskListResponse(data) {
  if (Array.isArray(data)) {
    return data.map(normalizeTask).filter(Boolean)
  }

  const taskList = data?.tasks || data?.items || data?.reminders || []
  return Array.isArray(taskList) ? taskList.map(normalizeTask).filter(Boolean) : []
}

export async function fetchUpcomingReminders(difficulty) {
  const query = new URLSearchParams({ difficulty }).toString()
  const data = await request(`/tasks/reminders/upcoming?${query}`, {
    headers: authHeaders(),
  })
  return normalizeTaskListResponse(data)
}

export async function fetchCalendarReminders(year, month) {
  const query = new URLSearchParams({
    year: String(year),
    month: String(month).padStart(2, "0"),
  }).toString()
  const data = await request(`/tasks/reminders/calendar?${query}`, {
    headers: authHeaders(),
  })
  return normalizeTaskListResponse(data)
}

export async function fetchTask(id) {
  const data = await request(`/tasks/${id}`, {
    headers: authHeaders(),
  })
  return normalizeTask(data)
}

export async function createTask(taskData) {
  const data = await request("/tasks", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(taskData),
  })
  return normalizeTask(data)
}

export async function updateTask(id, taskData) {
  const data = await request(`/tasks/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(taskData),
  })
  return normalizeTask(data)
}

export async function completeTask(id) {
  const data = await request(`/tasks/${id}/complete`, {
    method: "PUT",
    headers: authHeaders(),
  })
  return normalizeTask(data)
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

export async function fetchFolders() {
  const data = await request("/api/folders", {
    headers: authHeaders(),
  })
  return Array.isArray(data) ? data.map(normalizeFolder).filter(Boolean) : []
}

export async function fetchFolder(id) {
  const data = await request(`/api/folders/${id}`, {
    headers: authHeaders(),
  })
  return normalizeFolder(data)
}

export async function createFolder(folderData) {
  const data = await request("/api/folders", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(serializeFolderPayload(folderData)),
  })
  return normalizeFolder(data)
}

export async function updateFolder(id, folderData) {
  const data = await request(`/api/folders/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(serializeFolderPayload(folderData)),
  })
  return normalizeFolder(data)
}

export async function deleteFolder(id) {
  return request(`/api/folders/${id}`, {
    method: "DELETE",
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

export async function fetchServiceMetrics(service) {
  return request(`/${service}/metrics`)
}

export async function fetchServiceHealth(service) {
  return request(`/${service}/health`)
}
