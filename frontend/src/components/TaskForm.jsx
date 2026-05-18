import { useEffect, useState } from "react"

function TaskForm({ onSubmit, editingTask, onCancelEdit, folderOptions = [], selectedFolderId = null }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    deadline: "",
    assigned_to: "",
    folderId: selectedFolderId || "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || "",
        description: editingTask.description || "",
        priority: editingTask.priority || "medium",
        deadline: editingTask.deadline ? editingTask.deadline.slice(0, 16) : "",
        assigned_to: editingTask.assigned_to || "",
        folderId: editingTask.folderId || selectedFolderId || "",
      })
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        deadline: "",
        assigned_to: "",
        folderId: selectedFolderId || "",
      })
    }
    setError("")
  }, [editingTask, selectedFolderId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    if (!formData.title.trim()) {
      setError("Judul task wajib diisi")
      return
    }

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      priority: formData.priority,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      assigned_to: formData.assigned_to.trim() || null,
    }

    try {
      await onSubmit(taskData, editingTask?.id, formData.folderId || null)
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        deadline: "",
        assigned_to: "",
        folderId: selectedFolderId || "",
      })
    } catch (err) {
      setError(err.message)
    }
  }

  const priorityColors = {
    low: { bg: "#dcfce7", color: "#16a34a", border: "#86efac" },
    medium: { bg: "#fef9c3", color: "#ca8a04", border: "#fde68a" },
    high: { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        {editingTask ? "Edit Reminder" : "Tambah Reminder Baru"}
      </h2>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
          <div style={{ ...styles.field, flex: 2 }}>
            <label style={styles.label}>Judul Task *</label>
            <input
              type="text"
              name="title"
              id="task-title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Deploy ke Cloud Run"
              style={styles.input}
            />
          </div>
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>Priority</label>
            <div style={styles.priorityGroup}>
              {["low", "medium", "high"].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, priority }))}
                  style={{
                    ...styles.priorityBtn,
                    backgroundColor: formData.priority === priority ? priorityColors[priority].bg : "#f5f5f5",
                    color: formData.priority === priority ? priorityColors[priority].color : "#999",
                    border: `2px solid ${formData.priority === priority ? priorityColors[priority].border : "#e5e5e5"}`,
                    fontWeight: formData.priority === priority ? 700 : 500,
                  }}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.row}>
          <div style={{ ...styles.field, flex: 2 }}>
            <label style={styles.label}>Deskripsi</label>
            <input
              type="text"
              name="description"
              id="task-description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Opsional"
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Folder Reminder</label>
            <select
              name="folderId"
              value={formData.folderId}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Tanpa folder</option>
              {folderOptions.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name} ({folder.type})
                </option>
              ))}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Deadline</label>
            <input
              type="datetime-local"
              name="deadline"
              id="task-deadline"
              value={formData.deadline}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Assigned To</label>
            <input
              type="text"
              name="assigned_to"
              id="task-assigned"
              value={formData.assigned_to}
              onChange={handleChange}
              placeholder="Nama anggota"
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.actions}>
          <button type="submit" style={styles.btnSubmit} id="task-submit">
            {editingTask ? "Update Reminder" : "Tambah Reminder"}
          </button>
          {editingTask && (
            <button type="button" onClick={onCancelEdit} style={styles.btnCancel}>
              Batal
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

const styles = {
  container: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    fontFamily: "'Inter', sans-serif",
  },
  title: {
    margin: "0 0 1rem 0",
    color: "#7c5cbf",
    fontSize: "1.15rem",
    fontWeight: 700,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  row: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  field: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    minWidth: "180px",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#555",
  },
  input: {
    padding: "0.65rem 0.85rem",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "0.92rem",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "'Inter', sans-serif",
    background: "white",
  },
  priorityGroup: {
    display: "flex",
    gap: "0.4rem",
  },
  priorityBtn: {
    flex: 1,
    padding: "0.5rem 0.3rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.75rem",
    textTransform: "capitalize",
    transition: "all 0.2s",
    fontFamily: "'Inter', sans-serif",
  },
  actions: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "0.5rem",
  },
  btnSubmit: {
    padding: "0.7rem 1.5rem",
    background: "linear-gradient(135deg, #7c5cbf, #9b8ec4)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.92rem",
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(124, 92, 191, 0.25)",
    transition: "all 0.2s",
    fontFamily: "'Inter', sans-serif",
  },
  btnCancel: {
    padding: "0.7rem 1.5rem",
    backgroundColor: "#f3f4f6",
    color: "#555",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.92rem",
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
  },
  error: {
    background: "linear-gradient(135deg, #fee2e2, #fecaca)",
    color: "#dc2626",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    marginBottom: "0.5rem",
    fontSize: "0.88rem",
    fontWeight: 500,
  },
}

export default TaskForm
