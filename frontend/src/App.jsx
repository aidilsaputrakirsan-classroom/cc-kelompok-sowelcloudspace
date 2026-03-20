import { useState, useEffect, useCallback } from "react"
import Header from "./components/Header"
import SearchBar from "./components/SearchBar"
import ItemForm from "./components/ItemForm"
import ItemList from "./components/ItemList"
import LoginPage from "./components/LoginPage"
import {
  fetchItems, createItem, updateItem, deleteItem,
  checkHealth, login, register, clearToken,
} from "./services/api"

// Komponen Toast dengan auto-dismiss
function Toast({ message, type, onClose }) {
  if (!message) return null
  const bgColor = type === "success" ? "#4caf50" : "#f44336"

  // Auto close setelah 3 detik
  setTimeout(onClose, 3000)

  return (
    <div style={{
      position: "fixed", top: "1rem", right: "1rem",
      backgroundColor: bgColor, color: "#fff",
      padding: "1rem", borderRadius: "4px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      zIndex: 1000
    }}>
      {message}
      <button
        onClick={onClose}
        style={{ marginLeft: "1rem", background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}
      >
        ✖
      </button>
    </div>
  )
}

// Komponen Spinner
function Spinner() {
  return (
    <div style={{ textAlign: "center", margin: "1rem" }}>
      <div className="spinner" style={{
        border: "4px solid #f3f3f3",
        borderTop: "4px solid #3498db",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        animation: "spin 1s linear infinite",
        margin: "0 auto"
      }} />
      <style>
        {`@keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }`}
      </style>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [items, setItems] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [toast, setToast] = useState({ message: "", type: "" })

  const loadItems = useCallback(async (search = "") => {
    setLoading(true)
    try {
      const data = await fetchItems(search)
      setItems(data.items)
      setTotalItems(data.total)
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
      loadItems()
    }
  }, [isAuthenticated, loadItems])

  const handleLogin = async (email, password) => {
    try {
      const data = await login(email, password)
      setUser(data.user)
      setIsAuthenticated(true)
      setToast({ message: "Login berhasil", type: "success" })
    } catch (err) {
      setToast({ message: "Login gagal: " + err.message, type: "error" })
    }
  }

  const handleRegister = async (userData) => {
    try {
      await register(userData)
      await handleLogin(userData.email, userData.password)
      setToast({ message: "Registrasi berhasil", type: "success" })
    } catch (err) {
      setToast({ message: "Registrasi gagal: " + err.message, type: "error" })
    }
  }

  const handleLogout = () => {
    clearToken()
    setUser(null)
    setIsAuthenticated(false)
    setItems([])
    setTotalItems(0)
    setEditingItem(null)
    setSearchQuery("")
    setToast({ message: "Logout berhasil", type: "success" })
  }

  const handleSubmit = async (itemData, editId) => {
    setLoading(true)
    try {
      if (editId) {
        await updateItem(editId, itemData)
        setEditingItem(null)
        setToast({ message: "Item berhasil diperbarui", type: "success" })
      } else {
        await createItem(itemData)
        setToast({ message: "Item berhasil ditambahkan", type: "success" })
      }
      loadItems(searchQuery)
    } catch (err) {
      if (err.message === "UNAUTHORIZED") handleLogout()
      else setToast({ message: "Gagal menyimpan: " + err.message, type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    const item = items.find((i) => i.id === id)
    if (!window.confirm(`Yakin ingin menghapus "${item?.name}"?`)) return
    setLoading(true)
    try {
      await deleteItem(id)
      loadItems(searchQuery)
      setToast({ message: "Item berhasil dihapus", type: "success" })
    } catch (err) {
      if (err.message === "UNAUTHORIZED") handleLogout()
      else setToast({ message: "Gagal menghapus: " + err.message, type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    loadItems(query)
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />
  }

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <Header
          totalItems={totalItems}
          isConnected={isConnected}
          user={user}
          onLogout={handleLogout}
        />
        <ItemForm
          onSubmit={handleSubmit}
          editingItem={editingItem}
          onCancelEdit={() => setEditingItem(null)}
        />
        <SearchBar onSearch={handleSearch} />
        {loading && <Spinner />}
        <ItemList
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
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

const styles = {
  app: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "2rem",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  container: { maxWidth: "900px", margin: "0 auto" },
}

export default App
