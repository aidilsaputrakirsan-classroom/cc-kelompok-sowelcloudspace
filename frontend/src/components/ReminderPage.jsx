function getUrgencyBucket(task) {
  if (task.status === "done") return "completed"
  if (!task.deadline) return "later"

  const now = Date.now()
  const due = new Date(task.deadline).getTime()
  const diffHours = (due - now) / (1000 * 60 * 60)

  if (diffHours < 0) return "urgent"
  if (diffHours <= 24 || task.priority === "high") return "urgent"
  if (diffHours <= 72 || task.priority === "medium") return "soon"
  return "later"
}

function ReminderPage({ tasks, onOpenFolder, onEditTask }) {
  const sections = [
    { id: "urgent", title: "Urgent due first", description: "Deadline terdekat dan overdue ditaruh paling atas." },
    { id: "soon", title: "Coming soon", description: "Reminder yang masih aman tapi sudah perlu dipantau." },
    { id: "later", title: "Can wait a bit", description: "Masih ada waktu lebih panjang untuk diselesaikan." },
    { id: "completed", title: "Completed", description: "Reminder yang sudah selesai." },
  ]

  const groupedTasks = sections.map((section) => ({
    ...section,
    items: tasks
      .filter((task) => getUrgencyBucket(task) === section.id)
      .sort((a, b) => {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER
        return dateA - dateB
      }),
  }))

  return (
    <section className="stack-page">
      <div className="stack-page__header">
        <div>
          <p className="eyebrow">Reminder Board</p>
          <h1>Semua reminder berdasarkan urgensi</h1>
        </div>
        <p className="stack-page__lead">
          Bagian paling atas berisi reminder paling urgent, lalu turun ke task yang lebih santai.
        </p>
      </div>

      <div className="reminder-sections">
        {groupedTasks.map((section) => (
          <article key={section.id} className="panel reminder-section">
            <div className="panel__head">
              <div>
                <h2>{section.title}</h2>
                <p>{section.description}</p>
              </div>
              <span>{section.items.length} item</span>
            </div>

            {section.items.length === 0 ? (
              <div className="empty-inline">Belum ada reminder di bagian ini.</div>
            ) : (
              <div className="reminder-items">
                {section.items.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    className="reminder-item"
                    onClick={() => onEditTask(task)}
                  >
                    <div className="reminder-item__top">
                      <h3>{task.title}</h3>
                      <span className={`tag tag--${getUrgencyBucket(task)}`}>{task.priority || "medium"}</span>
                    </div>
                    <p>{task.description || "Tidak ada deskripsi tambahan."}</p>
                    <div className="reminder-item__meta">
                      <span>{task.folder?.name || "Unassigned folder"}</span>
                      <span>
                        {task.deadline
                          ? new Date(task.deadline).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "Tanpa deadline"}
                      </span>
                      {task.folder && (
                        <span
                          className="linkish"
                          onClick={(event) => {
                            event.stopPropagation()
                            onOpenFolder(task.folder.id)
                          }}
                        >
                          Buka folder
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

export default ReminderPage
