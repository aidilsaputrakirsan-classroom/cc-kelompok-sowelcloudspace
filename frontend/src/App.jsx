import { useCallback, useEffect, useMemo, useState } from "react"
import TaskForm from "./components/TaskForm"
import SearchBar from "./components/SearchBar"
import TaskList from "./components/TaskList"
import LoginPage from "./components/LoginPage"
import AboutPage from "./components/AboutPage"
import SidebarNav from "./components/SidebarNav"
import DashboardHome from "./components/DashboardHome"
import ReminderPage from "./components/ReminderPage"
import YearCalendarPage from "./components/YearCalendarPage"
import FolderModal from "./components/FolderModal"
import WorkspacePage from "./components/WorkspacePage"
import {
  fetchTasks, createTask, updateTask, deleteTask, completeTask,
  checkHealth, login, register, clearToken, getToken,
} from "./services/api"

const FOLDER_STORAGE_KEY = "sowel_folders"
const TASK_FOLDER_STORAGE_KEY = "sowel_task_folder_map"

const DEFAULT_FOLDERS = [
  {
    id: "folder-harahetta",
    name: "harahetta",
    type: "personal",
    members: ["Cantika"],
    color: "sunset",
    description: "Folder pribadi untuk reminder harian dan target cepat.",
  },
  {
    id: "folder-furab",
    name: "furab",
    type: "group",
    members: ["Cantika", "Furab Team"],
    color: "indigo",
    description: "Folder kolaborasi kecil untuk checklist dan progress mingguan.",
  },
  {
    id: "folder-sowelcloudspace",
    name: "sowelcloudspace",
    type: "group",
    members: ["Cantika", "Anjas", "Arya", "Meiske"],
    color: "pink",
    description: "Folder tim utama untuk reminder project dan deadline bersama.",
  },
]

function loadStoredFolders() {
  try {
    const raw = localStorage.getItem(FOLDER_STORAGE_KEY)
    if (!raw) return DEFAULT_FOLDERS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FOLDERS
  } catch {
    return DEFAULT_FOLDERS
  }
}

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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken())
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
  const [folders, setFolders] = useState(loadStoredFolders)
  const [taskFolderMap, setTaskFolderMap] = useState(loadStoredTaskFolderMap)
  const [selectedFolderId, setSelectedFolderId] = useState(null)

  const handleLogout = useCallback(() => {
    clearToken()
    setIsAuthenticated(false)
    setCurrentPage("home")
    setTasks([])
    setEditingTask(null)
    setSearchQuery("")
    setPriorityFilter("all")
    setDashboardQuery("")
    setSelectedFolderId(null)
    setToast({ message: "Logout berhasil", type: "success" })
  }, [])

  useEffect(() => {
    localStorage.setItem(FOLDER_STORAGE_KEY, JSON.stringify(folders))
  }, [folders])

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
      setTasks(Array.isArray(data) ? data : [])
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout()
        return
      }
      setToast({ message: "Gagal memuat data", type: "error" })
    } finally {
      setLoading(false)
    }
  }, [handleLogout])

  useEffect(() => {
    checkHealth().then(setIsConnected)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks()
    }
  }, [isAuthenticated, loadTasks])

  const updateTaskFolder = useCallback((taskId, folderId) => {
    setTaskFolderMap((prev) => {
      const next = { ...prev }
      if (folderId) next[String(taskId)] = folderId
      else delete next[String(taskId)]
      return next
    })
  }, [])

  const handleLogin = async (email, password) => {
    const data = await login(email, password)
    setIsAuthenticated(true)
    setToast({ message: "Login berhasil!", type: "success" })
    return data
  }

  const handleRegister = async (userData) => {
    await register(userData)
    await handleLogin(userData.email, userData.password)
    setToast({ message: "Registrasi berhasil!", type: "success" })
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
      else setToast({ message: `Gagal menyimpan: ${err.message}`, type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (task) => {
    setSelectedFolderId(task.folderId || null)
    setEditingTask(task)
    setCurrentPage("workspace")
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
      else setToast({ message: `Gagal menghapus: ${err.message}`, type: "error" })
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
      else setToast({ message: `Gagal memperbarui: ${err.message}`, type: "error" })
    }
  }

  const handleOpenFolder = (folderId) => {
    setSelectedFolderId(folderId)
    setCurrentPage("workspace")
    setEditingTask(null)
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

  const handleCreateFolder = (folderData) => {
    const colorCycle = ["sunset", "indigo", "pink", "mint"]
    const nextFolder = {
      id: `folder-${Date.now()}`,
      color: colorCycle[folders.length % colorCycle.length],
      ...folderData,
    }

    setFolders((prev) => [nextFolder, ...prev])
    setSelectedFolderId(nextFolder.id)
    setCurrentPage("workspace")
    setEditingTask(null)
    setIsFolderModalOpen(false)
    setToast({ message: `Folder "${nextFolder.name}" berhasil dibuat`, type: "success" })
  }

  const handleUpdateFolder = (folderData) => {
    if (!folderEditingId) return

    setFolders((prev) => prev.map((folder) => (
      folder.id === folderEditingId
        ? { ...folder, ...folderData }
        : folder
    )))
    setIsFolderModalOpen(false)
    setToast({ message: `Folder "${folderData.name}" berhasil diperbarui`, type: "success" })
  }

  if (!isAuthenticated) {
    return (
      <>
        {currentPage === "about" ? (
          <AboutPage onBack={() => setCurrentPage("home")} />
        ) : (
          <LoginPage
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        )}
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "" })}
        />
      </>
    )
  }

  return (
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
            dashboardQuery={dashboardQuery}
            onSearchChange={setDashboardQuery}
            onAddFolder={handleOpenCreateFolderModal}
            onOpenFolder={handleOpenFolder}
            onEditFolder={handleOpenEditFolderModal}
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

        {currentPage === "workspace" && (
          <WorkspacePage
            selectedFolder={selectedFolder}
            folders={folders}
            totalTasks={enhancedTasks.length}
            filteredTasks={filteredTasks.length}
            completedTasks={enhancedTasks.filter((task) => task.status === "done").length}
            isConnected={isConnected}
            onAddFolder={handleOpenCreateFolderModal}
            onClearFolder={() => setSelectedFolderId(null)}
            onSelectFolder={setSelectedFolderId}
            onEditFolder={handleOpenEditFolderModal}
          >
            <TaskForm
              onSubmit={handleSubmit}
              editingTask={editingTask}
              onCancelEdit={() => setEditingTask(null)}
              folderOptions={folders}
              selectedFolderId={selectedFolderId}
            />
            <SearchBar
              totalTasks={enhancedTasks.length}
              filteredTasks={filteredTasks.length}
              searchQuery={searchQuery}
              priorityFilter={priorityFilter}
              onSearchChange={setSearchQuery}
              onPriorityChange={setPriorityFilter}
            />
            {loading && (
              <div className="loading-state">
                <div className="loading-spinner" />
              </div>
            )}
            <TaskList
              tasks={filteredTasks}
              searchQuery={searchQuery}
              priorityFilter={priorityFilter}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onComplete={handleComplete}
              loading={loading}
            />
          </WorkspacePage>
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
  )
}

export default App
