function Header({
  totalTasks,
  completedTasks,
  isConnected,
  onLogout,
}) {
  const pendingTasks = totalTasks - completedTasks

  return (
    <header style={styles.header}>
      <div style={styles.topRow}>
        <div style={styles.left}>
          <h1 style={styles.title}>Sowel Task</h1>
          <p style={styles.subtitle}>Kelola dan cari task berdasarkan nama dengan cepat</p>
        </div>
        <div style={styles.right}>
          <div style={styles.stats}>
            <span style={styles.badge}>{totalTasks} total</span>
            <span style={{ ...styles.badge, background: "rgba(52,211,153,0.2)", color: "#059669" }}>
              {completedTasks} done
            </span>
            <span style={{ ...styles.badge, background: "rgba(251,191,36,0.2)", color: "#d97706" }}>
              {pendingTasks} pending
            </span>
            <span
              style={{
                ...styles.statusDot,
                backgroundColor: isConnected ? "#E2EFDA" : "#FBE5D6",
                color: isConnected ? "#059669" : "#dc2626",
              }}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <button onClick={onLogout} style={styles.btnLogout} id="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

const styles = {
  header: {
    display: "flex",
    flexDirection: "column",
    padding: "1.5rem 2rem",
    background: "linear-gradient(135deg, #7c5cbf, #9b8ec4)",
    color: "white",
    borderRadius: "16px",
    marginBottom: "1.5rem",
    boxShadow: "0 8px 30px rgba(124, 92, 191, 0.25)",
    fontFamily: "'Inter', sans-serif",
    gap: "1rem",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  left: {},
  title: { margin: 0, fontSize: "1.6rem", fontWeight: 800 },
  subtitle: { margin: "0.25rem 0 0 0", fontSize: "0.85rem", opacity: 0.82 },
  right: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0.6rem",
  },
  stats: {
    display: "flex",
    gap: "0.4rem",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  badge: {
    background: "rgba(255,255,255,0.2)",
    padding: "0.25rem 0.65rem",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  statusDot: {
    padding: "0.25rem 0.65rem",
    borderRadius: "20px",
    fontSize: "0.7rem",
    fontWeight: 600,
  },
  btnLogout: {
    padding: "0.4rem 1rem",
    background: "rgba(255,255,255,0.15)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: 600,
    transition: "all 0.2s",
    fontFamily: "'Inter', sans-serif",
  },
}

export default Header
