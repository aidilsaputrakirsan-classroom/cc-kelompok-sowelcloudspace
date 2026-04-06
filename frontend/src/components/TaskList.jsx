import TaskCard from "./TaskCard"

function TaskList({ tasks, onEdit, onDelete, onComplete, loading }) {
  if (loading) {
    return <p style={styles.message}>⏳ Memuat data...</p>
  }

  if (tasks.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyIcon}>📋</p>
        <p style={styles.emptyText}>Belum ada task.</p>
        <p style={styles.emptyHint}>
          Gunakan form di atas untuk menambahkan task pertama.
        </p>
      </div>
    )
  }

  // Sort: pending first, then done; within each group sort by created_at desc
  const sorted = [...tasks].sort((a, b) => {
    if (a.status === "done" && b.status !== "done") return 1
    if (a.status !== "done" && b.status === "done") return -1
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div style={styles.grid}>
      {sorted.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onComplete={onComplete}
        />
      ))}
    </div>
  )
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "1rem",
  },
  message: {
    textAlign: "center",
    color: "#888",
    padding: "2rem",
    fontSize: "1.1rem",
    fontFamily: "'Inter', sans-serif",
  },
  empty: {
    textAlign: "center",
    padding: "3rem",
    background: "white",
    borderRadius: "16px",
    border: "2px dashed #d4d4d8",
    fontFamily: "'Inter', sans-serif",
  },
  emptyIcon: {
    fontSize: "3rem",
    margin: "0 0 0.5rem 0",
  },
  emptyText: {
    fontSize: "1.1rem",
    color: "#555",
    margin: "0 0 0.25rem 0",
    fontWeight: 600,
  },
  emptyHint: {
    fontSize: "0.9rem",
    color: "#888",
    margin: 0,
  },
}

export default TaskList
