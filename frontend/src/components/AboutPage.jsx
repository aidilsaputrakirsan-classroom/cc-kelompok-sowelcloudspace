function AboutPage({ onBack }) {
  const team = [
    { name: "Anjas Geofany Diamare", nim: "10231016", role: "Lead Backend" },
    { name: "Cantika Ade Qutnindra Maharani", nim: "10231024", role: "Lead Frontend" },
    { name: "Arya Wijaya Saroyo", nim: "10231020", role: "Lead DevOps" },
    { name: "Meiske Handayani", nim: "10231052", role: "Lead QA & Docs" },
  ]

  return (
    <div style={styles.wrapper}>
      <button onClick={onBack} style={styles.backButton}>
        {"<-"} Kembali
      </button>

      <h1 style={styles.title}>About This Project</h1>
      <p style={styles.description}>
        Aplikasi Sowel Task dibangun untuk memudahkan pengguna dalam mengelola
        tugas dengan lebih cepat, rapi, dan kolaboratif.
      </p>

      <h2 style={styles.sectionTitle}>Tech Stack</h2>
      <ul style={styles.list}>
        <li><strong>Backend:</strong> FastAPI + PostgreSQL</li>
        <li><strong>Frontend:</strong> React + Vite</li>
        <li><strong>Container:</strong> Docker + Docker Compose</li>
        <li><strong>CI/CD:</strong> GitHub Actions (coming soon)</li>
      </ul>

      <h2 style={styles.sectionTitle}>Tim</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHead}>Nama</th>
            <th style={styles.tableHead}>NIM</th>
            <th style={styles.tableHead}>Peran</th>
          </tr>
        </thead>
        <tbody>
          {team.map((member) => (
            <tr key={member.nim}>
              <td style={styles.tableCell}>{member.name}</td>
              <td style={styles.tableCell}>{member.nim}</td>
              <td style={styles.tableCell}>{member.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const styles = {
  wrapper: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem",
    background: "rgba(255,255,255,0.92)",
    borderRadius: "20px",
    boxShadow: "0 16px 40px rgba(76, 29, 149, 0.12)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  backButton: {
    marginBottom: "1.5rem",
    padding: "0.7rem 1rem",
    border: "none",
    borderRadius: "10px",
    background: "#7c5cbf",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
  },
  title: {
    marginTop: 0,
    color: "#2f1c53",
  },
  description: {
    color: "#4b5563",
    lineHeight: 1.7,
    marginBottom: "1.5rem",
  },
  sectionTitle: {
    color: "#2f1c53",
    marginBottom: "0.75rem",
  },
  list: {
    color: "#374151",
    lineHeight: 1.8,
    paddingLeft: "1.2rem",
    marginBottom: "1.5rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    overflow: "hidden",
  },
  tableHead: {
    textAlign: "left",
    padding: "0.85rem",
    background: "#ede9fe",
    color: "#4c1d95",
    borderBottom: "1px solid #ddd6fe",
  },
  tableCell: {
    padding: "0.85rem",
    borderBottom: "1px solid #ede9fe",
    color: "#374151",
  },
}

export default AboutPage
