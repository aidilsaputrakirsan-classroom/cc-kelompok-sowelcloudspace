function SearchBar({
  totalTasks,
  filteredTasks,
  searchQuery,
  priorityFilter,
  onSearchChange,
  onPriorityChange,
}) {
  const priorityOptions = [
    { value: "all", label: "Semua", dot: "#a78bfa", bg: "#ede9fe", border: "#ddd6fe", text: "#6d28d9" },
    { value: "low", label: "Low", dot: "#34d399", bg: "#dcfce7", border: "#bbf7d0", text: "#059669" },
    { value: "medium", label: "Medium", dot: "#fbbf24", bg: "#fef3c7", border: "#fde68a", text: "#d97706" },
    { value: "high", label: "High", dot: "#f43f5e", bg: "#fee2e2", border: "#fecdd3", text: "#e11d48" },
  ]

  return (
    <section style={styles.container}>
      <div style={styles.topRow}>
        <div>
          <h3 style={styles.title}>Search Task</h3>
          <p style={styles.subtitle}>Cari berdasarkan nama task dan pilih priority yang ingin ditampilkan.</p>
        </div>
        <div style={styles.resultBadge}>
          {filteredTasks} / {totalTasks} task
        </div>
      </div>

      <div style={styles.searchRow}>
        <div style={styles.searchInputWrap}>
          <span style={styles.searchIcon}>Search</span>
          <input
            id="task-search"
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari nama task..."
            style={styles.searchInput}
          />
          {searchQuery && (
            <button type="button" onClick={() => onSearchChange("")} style={styles.resetTextButton}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div style={styles.prioritySection}>
        <span style={styles.priorityLabel}>Priority</span>
        <div style={styles.priorityGroup}>
          {priorityOptions.map((option) => {
            const isActive = priorityFilter === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onPriorityChange(option.value)}
                style={{
                  ...styles.priorityButton,
                  background: isActive ? option.bg : "#f8fafc",
                  borderColor: isActive ? option.border : "#e5e7eb",
                  color: isActive ? option.text : "#64748b",
                  boxShadow: isActive ? "0 8px 20px rgba(124, 92, 191, 0.12)" : "none",
                }}
              >
                <span style={{ ...styles.priorityDot, background: option.dot }} />
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const styles = {
  container: {
    background: "white",
    padding: "1.25rem 1.5rem",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    fontFamily: "'Inter', sans-serif",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  title: {
    margin: 0,
    color: "#7c5cbf",
    fontSize: "1.05rem",
    fontWeight: 700,
  },
  subtitle: {
    margin: "0.25rem 0 0 0",
    color: "#64748b",
    fontSize: "0.9rem",
  },
  resultBadge: {
    background: "#f3e8ff",
    color: "#7c3aed",
    padding: "0.45rem 0.85rem",
    borderRadius: "999px",
    fontSize: "0.82rem",
    fontWeight: 700,
  },
  searchRow: {
    marginBottom: "1rem",
  },
  searchInputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    padding: "0.85rem 1rem",
    background: "#ffffff",
  },
  searchIcon: {
    color: "#7c5cbf",
    fontWeight: 700,
    fontSize: "0.85rem",
    minWidth: "52px",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#334155",
    fontSize: "0.95rem",
    fontFamily: "'Inter', sans-serif",
  },
  resetTextButton: {
    padding: "0.45rem 0.8rem",
    background: "#f3e8ff",
    color: "#7c3aed",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
  },
  prioritySection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.65rem",
  },
  priorityLabel: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#475569",
  },
  priorityGroup: {
    display: "flex",
    gap: "0.65rem",
    flexWrap: "wrap",
  },
  priorityButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.7rem 1rem",
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 700,
    transition: "all 0.2s ease",
    fontFamily: "'Inter', sans-serif",
  },
  priorityDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    display: "inline-block",
  },
}

export default SearchBar
