import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react"
import SidebarNav from "./components/SidebarNav"
import FolderModal from "./components/FolderModal"
import {
  fetchTasks, createTask, updateTask, deleteTask, completeTask,
  checkHealth, login, register, clearToken, getToken, getStoredUser, fetchCurrentUser,
  getUserFriendlyErrorMessage, shouldEscalateApiError,
  fetchFolders, fetchFolder, createFolder, updateFolder, deleteFolder,
} from "./services/api"

const LoginPage = lazy(() => import("./components/LoginPage"))
const AboutPage = lazy(() => import("./components/AboutPage"))
const DashboardHome = lazy(() => import("./components/DashboardHome"))
const ReminderPage = lazy(() => import("./components/ReminderPage"))
const YearCalendarPage = lazy(() => import("./components/YearCalendarPage"))
const FolderDetailPage = lazy(() => import("./components/FolderDetailPage"))

const TASK_FOLDER_STORAGE_KEY = "sowel_task_folder_map"

function loadStoredTaskFolderMap() {
  try {
    const raw = localStorage.getItem(TASK_FOLDER_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function Toast({ message, type, onClose }) {
  if (!message) return null

  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [message, onClose])

  return (
    <div className={`toast toast--${type}`}>
      <span className="toast__icon">{type === "success" ? "OK" : "ERR"}</span>
      <span>{message}</span>
      <button type="button" onClick={onClose} className="toast__close" aria-label="Tutup notifikasi">
        x
      </button>
    </div>
  )
}

function PageLoader() {
  return (
    <div className="loading-state loading-state--page">
      <div className="loading-spinner" />
    </div>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken())
  const [currentUser, setCurrentUser] = useState(getStoredUser)
  const [currentPage, setCurrentPage] = useState("home")
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [dashboardQuery, setDashboardQuery] = useState("")
  const [toast, setToast] = useState({ message: "", type: "" })
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [folderModalMode, setFolderModalMode] = useState("create")
  const [folderEditingId, setFolderEditingId] = useState(null)
  const [folders, setFolders] = useState([])
  const [taskFolderMap, setTaskFolderMap] = useState(loadStoredTaskFolderMap)
  const [selectedFolderId, setSelectedFolderId] = useState(null)
  const [isFolderDetailLoading, setIsFolderDetailLoading] = useState(false)
  const [fatalError, setFatalError] = useState(null)

  const handleLogout = useCallback(() => {
    clearToken()
    setCurrentUser(null)
    setFatalError(null)
    setIsAuthenticated(false)
    setCurrentPage("home")
    setTasks([])
    setEditingTask(null)
    setSearchQuery("")
    setPriorityFilter("all")
    setDashboardQuery("")
    setSelectedFolderId(null)
    setFolders([])
    setToast({ message: "Logout berhasil", type: "success" })
  }, [])

  const escalateApiError = useCallback((error, fallbackMessage) => {
    if (shouldEscalateApiError(error)) {
      setFatalError(error)
      return true
    }

    return false
  }, [])

  useEffect(() => {
    localStorage.setItem(TASK_FOLDER_STORAGE_KEY, JSON.stringify(taskFolderMap))
  }, [taskFolderMap])

  const enhancedTasks = useMemo(() => {
    return tasks.map((task) => {
      const folderId = taskFolderMap[String(task.id)] || null
      const folder = folders.find((item) => item.id === folderId) || null
      return { ...task, folderId, folder }
    })
  }, [folders, taskFolderMap, tasks])

  const selectedFolder = useMemo(
    () => folders.find((folder) => folder.id === selectedFolderId) || null,
    [folders, selectedFolderId],
  )

  const editingFolder = useMemo(
    () => folders.find((folder) => folder.id === folderEditingId) || null,
    [folderEditingId, folders],
  )

  const filteredTasks = useMemo(() => {
    return enhancedTasks.filter((task) => {
      const normalizedQuery = searchQuery.trim().toLowerCase()
      const matchesTitle = !normalizedQuery || task.title?.toLowerCase().includes(normalizedQuery)
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
      const matchesFolder = !selectedFolderId || task.folderId === selectedFolderId

      return matchesTitle && matchesPriority && matchesFolder
    })
  }, [enhancedTasks, priorityFilter, searchQuery, selectedFolderId])

  const visibleFolders = useMemo(() => {
    const normalizedQuery = dashboardQuery.trim().toLowerCase()
    if (!normalizedQuery) return folders
    return folders.filter((folder) => {
      const memberText = folder.members.join(" ").toLowerCase()
      return (
        folder.name.toLowerCase().includes(normalizedQuery)
        || folder.description.toLowerCase().includes(normalizedQuery)
        || memberText.includes(normalizedQuery)
      )
    })
  }, [dashboardQuery, folders])

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchTasks()
      setFatalError(null)
      setTasks(Array.isArray(data) ? data : [])
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout()
        return
      }
      if (!escalateApiError(err, "Gagal memuat data reminder.")) {
        setToast({ message: getUserFriendlyErrorMessage(err, "Gagal memuat data reminder."), type: "error" })
      }
    } finally {
      setLoading(false)
    }
  }, [escalateApiError, handleLogout])

  const loadFolders = useCallback(async () => {
    try {
      const data = await fetchFolders()
      setFatalError(null)
      setFolders(Array.isArray(data) ? data : [])
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout()
        return
      }
      if (!escalateApiError(err, "Gagal memuat folder.")) {
        setToast({ message: getUserFriendlyErrorMessage(err, "Gagal memuat folder."), type: "error" })
      }
    }
  }, [escalateApiError, handleLogout])

  useEffect(() => {
    checkHealth().then(setIsConnected)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks()
      loadFolders()
    }
  }, [isAuthenticated, loadFolders, loadTasks])

  useEffect(() => {
    if (!isAuthenticated || !getToken()) return

    let isMounted = true

    fetchCurrentUser()
      .then((user) => {
        if (!isMounted) return
        setCurrentUser(user && typeof user === "object" ? user : null)
      })
      .catch((err) => {
        if (!isMounted) return
        if (err.message === "UNAUTHORIZED") {
          handleLogout()
          return
        }
        if (!shouldEscalateApiError(err)) return
        setFatalError(err)
      })

    return () => {
      isMounted = false
    }
  }, [handleLogout, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || !selectedFolderId || currentPage !== "folder") return

    let isMounted = true
    setIsFolderDetailLoading(true)

    fetchFolder(selectedFolderId)
      .then((folder) => {
        if (!isMounted || !folder) return
        setFolders((prev) => {
          const exists = prev.some((item) => item.id === folder.id)
          if (!exists) return [folder, ...prev]
          return prev.map((item) => (item.id === folder.id ? folder : item))
        })
      })
      .catch((err) => {
        if (!isMounted) return
        if (err.message === "UNAUTHORIZED") {
          handleLogout()
          return
        }
        if (!escalateApiError(err, "Gagal memuat detail folder.")) {
          setToast({ message: getUserFriendlyErrorMessage(err, "Gagal memuat detail folder."), type: "error" })
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsFolderDetailLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [currentPage, escalateApiError, handleLogout, isAuthenticated, selectedFolderId])

  const updateTaskFolder = useCallback((taskId, folderId) => {
    setTaskFolderMap((prev) => {
      const next = { ...prev }
      if (folderId) next[String(taskId)] = folderId
      else delete next[String(taskId)]
      return next
    })
  }, [])

  const handleLogin = async (username, password) => {
    try {
      const data = await login(username, password)
      setFatalError(null)
      setCurrentUser(data?.user ?? getStoredUser())
      setIsAuthenticated(true)
      setToast({ message: "Login berhasil!", type: "success" })
      return data
    } catch (err) {
      if (!escalateApiError(err, "Login gagal. Coba lagi.")) {
        throw err
      }
      throw err
    }
  }

  const handleRegister = async (userData) => {
    try {
      await register(userData)
      await handleLogin(userData.name, userData.password)
      setToast({ message: "Registrasi berhasil!", type: "success" })
    } catch (err) {
      if (!shouldEscalateApiError(err)) {
        throw err
      }
      throw err
    }
  }

  const handleSubmit = async (taskData, editId, folderId) => {
    setLoading(true)
    try {
      if (editId) {
        const updatedTask = await updateTask(editId, taskData)
        updateTaskFolder(updatedTask.id || editId, folderId)
        setEditingTask(null)
        setToast({ message: "Reminder berhasil diperbarui", type: "success" })
      } else {
        const createdTask = await createTask(taskData)
        updateTaskFolder(createdTask.id, folderId)
        setToast({ message: "Reminder berhasil ditambahkan", type: "success" })
      }
      await loadTasks()
    } catch (err) {
      if (err.message === "UNAUTHORIZED") handleLogout()
      else if (!escalateApiError(err, "Gagal menyimpan reminder.")) {
        setToast({ message: `Gagal menyimpan: ${getUserFriendlyErrorMessage(err)}`, type: "error" })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (task) => {
    setSelectedFolderId(task.folderId || null)
    setEditingTask(task)
    setCurrentPage(task.folderId ? "folder" : "reminders")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    const task = tasks.find((item) => item.id === id)
    if (!window.confirm(`Yakin ingin menghapus "${task?.title}"?`)) return
    setLoading(true)
    try {
      await deleteTask(id)
      updateTaskFolder(id, null)
      await loadTasks()
      setToast({ message: "Reminder berhasil dihapus", type: "success" })
    } catch (err) {
      if (err.message === "UNAUTHORIZED") handleLogout()
      else if (!escalateApiError(err, "Gagal menghapus reminder.")) {
        setToast({ message: `Gagal menghapus: ${getUserFriendlyErrorMessage(err)}`, type: "error" })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (id) => {
    try {
      await completeTask(id)
      await loadTasks()
      setToast({ message: "Reminder ditandai selesai", type: "success" })
    } catch (err) {
      if (err.message === "UNAUTHORIZED") handleLogout()
      else if (!escalateApiError(err, "Gagal memperbarui reminder.")) {
        setToast({ message: `Gagal memperbarui: ${getUserFriendlyErrorMessage(err)}`, type: "error" })
      }
    }
  }

  const handleOpenFolder = (folderId) => {
    setSelectedFolderId(folderId)
    setEditingTask(null)
    setCurrentPage("folder")
  }

  const handleOpenCreateFolderModal = () => {
    setFolderModalMode("create")
    setFolderEditingId(null)
    setIsFolderModalOpen(true)
  }

  const handleOpenEditFolderModal = (folderId) => {
    setFolderModalMode("edit")
    setFolderEditingId(folderId)
    setIsFolderModalOpen(true)
  }

  const handleCreateFolder = async (folderData) => {
    setLoading(true)
    try {
      const nextFolder = await createFolder(folderData)
      setFolders((prev) => [nextFolder, ...prev])
      setSelectedFolderId(nextFolder.id)
      setCurrentPage("folder")
      setEditingTask(null)
      setIsFolderModalOpen(false)
      setToast({ message: `Folder "${nextFolder.name}" berhasil dibuat`, type: "success" })
    } catch (err) {
      if (err.message === "UNAUTHORIZED") handleLogout()
      else if (!escalateApiError(err, "Gagal membuat folder.")) {
        setToast({ message: getUserFriendlyErrorMessage(err, "Gagal membuat folder."), type: "error" })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateFolder = async (folderData) => {
    if (!folderEditingId) return

    setLoading(true)
    try {
      const updatedFolder = await updateFolder(folderEditingId, folderData)
      setFolders((prev) => prev.map((folder) => (
        folder.id === folderEditingId ? updatedFolder : folder
      )))
      setIsFolderModalOpen(false)
      setToast({ message: `Folder "${updatedFolder.name}" berhasil diperbarui`, type: "success" })
    } catch (err) {
      if (err.message === "UNAUTHORIZED") handleLogout()
      else if (!escalateApiError(err, "Gagal memperbarui folder.")) {
        setToast({ message: getUserFriendlyErrorMessage(err, "Gagal memperbarui folder."), type: "error" })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFolder = async (folderId) => {
    const folder = folders.find((item) => item.id === folderId)
    if (!folder) return
    if (!window.confirm(`Yakin ingin menghapus folder "${folder.name}"? Semua reminder di folder ini akan kehilangan folder-nya.`)) return

    setLoading(true)
    try {
      await deleteFolder(folderId)
      setFolders((prev) => prev.filter((item) => item.id !== folderId))
      setTaskFolderMap((prev) => {
        const next = { ...prev }
        for (const [taskId, mappedFolderId] of Object.entries(next)) {
          if (mappedFolderId === folderId) delete next[taskId]
        }
        return next
      })
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null)
        setCurrentPage("home")
      }
      setToast({ message: `Folder "${folder.name}" berhasil dihapus`, type: "success" })
    } catch (err) {
      if (err.message === "UNAUTHORIZED") handleLogout()
      else if (!escalateApiError(err, "Gagal menghapus folder.")) {
        setToast({ message: getUserFriendlyErrorMessage(err, "Gagal menghapus folder."), type: "error" })
      }
    } finally {
      setLoading(false)
    }
  }

  if (fatalError) {
    throw fatalError
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<PageLoader />}>
        <>
          {currentPage === "about" ? (
            <AboutPage onBack={() => setCurrentPage("home")} />
          ) : (
            <LoginPage
              onLogin={handleLogin}
              onRegister={handleRegister}
              onOpenAbout={() => setCurrentPage("about")}
            />
          )}
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ message: "", type: "" })}
          />
        </>
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <div className="app-shell">
        <SidebarNav
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
        />

        <main className="app-main">
          {currentPage === "home" && (
            <DashboardHome
              folders={visibleFolders}
              allFolders={folders}
              tasks={enhancedTasks}
              currentUser={currentUser}
              dashboardQuery={dashboardQuery}
              onSearchChange={setDashboardQuery}
              onAddFolder={handleOpenCreateFolderModal}
              onOpenFolder={handleOpenFolder}
              onEditFolder={handleOpenEditFolderModal}
              onDeleteFolder={handleDeleteFolder}
            />
          )}

          {currentPage === "reminders" && (
            <ReminderPage
              tasks={enhancedTasks}
              onOpenFolder={handleOpenFolder}
              onEditTask={handleEdit}
            />
          )}

          {currentPage === "calendar" && (
            <YearCalendarPage
              tasks={enhancedTasks}
              year={new Date().getFullYear()}
              onOpenFolder={handleOpenFolder}
            />
          )}

          {currentPage === "folder" && (
            <FolderDetailPage
              selectedFolder={selectedFolder}
              folders={folders}
              tasks={filteredTasks}
              isConnected={isConnected}
              loading={loading || isFolderDetailLoading}
              onAddFolder={handleOpenCreateFolderModal}
              onClearFolder={() => {
                setSelectedFolderId(null)
                setCurrentPage("home")
              }}
              onSelectFolder={handleOpenFolder}
              onEditFolder={handleOpenEditFolderModal}
              onDeleteFolder={handleDeleteFolder}
              onBackHome={() => setCurrentPage("home")}
              onEditTask={handleEdit}
              onDeleteTask={handleDelete}
              onCompleteTask={handleComplete}
              onSubmitTask={handleSubmit}
              editingTask={editingTask}
              onCancelTaskEdit={() => setEditingTask(null)}
            />
          )}



          {currentPage === "about" && <AboutPage onBack={() => setCurrentPage("home")} />}
        </main>

        <FolderModal
          isOpen={isFolderModalOpen}
          mode={folderModalMode}
          initialData={editingFolder}
          onClose={() => {
            setIsFolderModalOpen(false)
            setFolderEditingId(null)
          }}
          onSubmit={folderModalMode === "edit" ? handleUpdateFolder : handleCreateFolder}
        />

        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "" })}
        />
      </div>
    </Suspense>
  )
}

export default App
