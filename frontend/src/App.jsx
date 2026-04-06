import { useState, useEffect, useCallback } from "react"
import Header from "./components/Header"
import TaskForm from "./components/TaskForm"
import TaskList from "./components/TaskList"
import LoginPage from "./components/LoginPage"
import {
  fetchTasks, createTask, updateTask, deleteTask, completeTask,
  checkHealth, login, register, clearToken, getToken,
} from "./services/api"

// Komponen Toast dengan auto-dismiss
function Toast({ message, type, onClose }) {
  if (!message) return null

  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [message, onClose])

  return (
    <div style={{
      position: "fixed", top: "1.5rem", right: "1.5rem",
      background: type === "success"
        ? "linear-gradient(135deg, #34d399, #10b981)"
        : "linear-gradient(135deg, #f87171, #ef4444)",
      color: "#fff",
      padding: "1rem 1.5rem", borderRadius: "12px",
      boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
      zIndex: 1000,
      display: "flex", alignItems: "center", gap: "0.75rem",
      fontFamily: "'Inter', sans-serif",
      fontSize: "0.9rem",
      fontWeight: 500,
      animation: "slideIn 0.3s ease-out",
    }}>
      <span>{type === "success" ? "✅" : "❌"}</span>
      {message}
      <button
        onClick={onClose}
        style={{
          marginLeft: "0.5rem", background: "rgba(255,255,255,0.2)",
          border: "none", color: "#fff", cursor: "pointer",
          borderRadius: "50%", width: "24px", height: "24px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.8rem",
        }}
      >
        ✕
      </button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken())
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [toast, setToast] = useState({ message: "", type: "" })

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchTasks()
      setTasks(Array.isArray(data) ? data : [])
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout()
      }
      setToast({ message: "Gagal memuat data", type: "error" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkHealth().then(setIsConnected)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks()
    }
  }, [isAuthenticated, loadTasks])

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

  const handleLogout = () => {
    clearToken()
    setIsAuthenticated(false)
    setTasks([])
    setEditingTask(null)
    setToast({ message: "Logout berhasil", type: "success" })
  }

  const handleSubmit = async (taskData, editId) => {
    setLoading(true)
    try {
      if (editId) {
        await updateTask(editId, taskData)
        setEditingTask(null)
        setToast({ message: "Task berhasil diperbarui", type: "success" })
      } else {
        await createTask(taskData)
        setToast({ message: "Task berhasil ditambahkan", type: "success" })
      }
      loadTasks()
    } catch (err) {
      if (err.message === "UNAUTHORIZED") handleLogout()
      else setToast({ message: "Gagal menyimpan: " + err.message, type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    const task = tasks.find((t) => t.id === id)
    if (!window.confirm(`Yakin ingin menghapus "${task?.title}"?`)) return
    setLoading(true)
    try {
      await deleteTask(id)
      loadTasks()
      setToast({ message: "Task berhasil dihapus", type: "success" })
    } catch (err) {
      if (err.message === "UNAUTHORIZED") handleLogout()
      else setToast({ message: "Gagal menghapus: " + err.message, type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (id) => {
    try {
      await completeTask(id)
      loadTasks()
      setToast({ message: "Task selesai! 🎉", type: "success" })
    } catch (err) {
      if (err.message === "UNAUTHORIZED") handleLogout()
      else setToast({ message: "Gagal: " + err.message, type: "error" })
    }
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLogin={handleLogin} onRegister={handleRegister} />
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "" })}
        />
      </>
    )
  }

  return (
    <div style={appStyles.app}>
      <div style={appStyles.container}>
        <Header
          totalTasks={tasks.length}
          completedTasks={tasks.filter(t => t.status === "done").length}
          isConnected={isConnected}
          onLogout={handleLogout}
        />
        <TaskForm
          onSubmit={handleSubmit}
          editingTask={editingTask}
          onCancelEdit={() => setEditingTask(null)}
        />
        {loading && (
          <div style={{ textAlign: "center", margin: "2rem" }}>
            <div style={{
              border: "3px solid #e5e7eb",
              borderTop: "3px solid #7c5cbf",
              borderRadius: "50%",
              width: "36px", height: "36px",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto",
            }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        <TaskList
          tasks={tasks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onComplete={handleComplete}
          loading={loading}
        />
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />
    </div>
  )
}

const appStyles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f3f0ff 0%, #ede9fe 50%, #f5f3ff 100%)",
    padding: "2rem",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  container: { maxWidth: "900px", margin: "0 auto" },
}

export default App
