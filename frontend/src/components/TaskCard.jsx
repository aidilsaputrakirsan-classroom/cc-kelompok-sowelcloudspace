function TaskCard({ task, onEdit, onDelete, onComplete }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const priorityConfig = {
    low: { label: "Low", color: "#16a34a", bg: "#dcfce7", icon: "🟢" },
    medium: { label: "Medium", color: "#ca8a04", bg: "#fef9c3", icon: "🟡" },
    high: { label: "High", color: "#dc2626", bg: "#fee2e2", icon: "🔴" },
  }

  const statusConfig = {
    pending: { label: "Pending", color: "#d97706", bg: "#fef3c7", icon: "⏳" },
    done: { label: "Done", color: "#059669", bg: "#d1fae5", icon: "✅" },
  }

  const priority = priorityConfig[task.priority] || priorityConfig.medium
  const status = statusConfig[task.status] || statusConfig.pending
  const isDone = task.status === "done"

  // Check if deadline has passed
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !isDone

  return (
    <div style={{
      ...styles.card,
      borderLeft: `4px solid ${isDone ? "#10b981" : isOverdue ? "#ef4444" : "#7c5cbf"}`,
      opacity: isDone ? 0.75 : 1,
    }}>
      <div style={styles.cardHeader}>
        <h3 style={{
          ...styles.taskTitle,
          textDecoration: isDone ? "line-through" : "none",
          color: isDone ? "#9ca3af" : "#1a1a2e",
        }}>
          {task.title}
        </h3>
        <div style={styles.badges}>
          <span style={{
            ...styles.badge,
            backgroundColor: priority.bg,
            color: priority.color,
          }}>
            {priority.icon} {priority.label}
          </span>
          <span style={{
            ...styles.badge,
            backgroundColor: status.bg,
            color: status.color,
          }}>
            {status.icon} {status.label}
          </span>
        </div>
      </div>

      {task.description && (
        <p style={styles.description}>{task.description}</p>
      )}

      <div style={styles.meta}>
        {task.assigned_to && (
          <span style={styles.metaItem}>👤 {task.assigned_to}</span>
        )}
        {task.deadline && (
          <span style={{
            ...styles.metaItem,
            color: isOverdue ? "#dc2626" : "#666",
            fontWeight: isOverdue ? 600 : 400,
          }}>
            📅 {formatDate(task.deadline)} {isOverdue && "⚠️"}
          </span>
        )}
        <span style={styles.metaItem}>🕐 {formatDate(task.created_at)}</span>
      </div>

      <div style={styles.actions}>
        {!isDone && (
          <button
            onClick={() => onComplete(task.id)}
            style={styles.btnComplete}
            id={`complete-task-${task.id}`}
          >
            ✅ Selesai
          </button>
        )}
        <button
          onClick={() => onEdit(task)}
          style={styles.btnEdit}
          id={`edit-task-${task.id}`}
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          style={styles.btnDelete}
          id={`delete-task-${task.id}`}
        >
          🗑️ Hapus
        </button>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: "white",
    padding: "1.25rem",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    transition: "all 0.2s",
    fontFamily: "'Inter', sans-serif",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "0.5rem",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  taskTitle: {
    margin: 0,
    fontSize: "1.05rem",
    fontWeight: 700,
    flex: 1,
  },
  badges: {
    display: "flex",
    gap: "0.35rem",
    flexShrink: 0,
  },
  badge: {
    padding: "0.2rem 0.6rem",
    borderRadius: "20px",
    fontSize: "0.7rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  description: {
    color: "#666",
    fontSize: "0.88rem",
    margin: "0.25rem 0 0.75rem 0",
    lineHeight: 1.5,
  },
  meta: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    fontSize: "0.78rem",
    color: "#888",
    marginBottom: "0.75rem",
  },
  metaItem: {},
  actions: {
    display: "flex",
    gap: "0.4rem",
    borderTop: "1px solid #f3f4f6",
    paddingTop: "0.75rem",
  },
  btnComplete: {
    flex: 1,
    padding: "0.45rem",
    background: "#d1fae5",
    color: "#059669",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 600,
    transition: "all 0.2s",
    fontFamily: "'Inter', sans-serif",
  },
  btnEdit: {
    flex: 1,
    padding: "0.45rem",
    background: "#ede9fe",
    color: "#7c5cbf",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 600,
    transition: "all 0.2s",
    fontFamily: "'Inter', sans-serif",
  },
  btnDelete: {
    flex: 1,
    padding: "0.45rem",
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 600,
    transition: "all 0.2s",
    fontFamily: "'Inter', sans-serif",
  },
}

export default TaskCard
