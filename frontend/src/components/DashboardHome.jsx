function DashboardHome({
  folders,
  allFolders,
  tasks,
  dashboardQuery,
  onSearchChange,
  onAddFolder,
  onOpenFolder,
  onEditFolder,
}) {
  const today = new Date()
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - today.getDay() + 1 + index)
    return date
  })

  const progressSummary = {
    done: tasks.filter((task) => task.status === "done").length,
    inProgress: tasks.filter((task) => task.status !== "done").length,
    overdue: tasks.filter((task) => task.deadline && new Date(task.deadline) < new Date() && task.status !== "done").length,
  }

  const completionRate = tasks.length ? Math.round((progressSummary.done / tasks.length) * 100) : 0
  const sharedFolders = allFolders.filter((folder) => folder.type === "group").length

  return (
    <section className="dashboard-page">
      <div className="dashboard-page__header">
        <div>
          <p className="eyebrow">Main Dashboard</p>
          <h1>Halo, Cantika!</h1>
          <p className="dashboard-page__subtitle">
            {today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="dashboard-page__actions">
          <label className="search-field">
            <span>Search</span>
            <input
              type="text"
              value={dashboardQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Cari folder atau member"
            />
          </label>
          <button type="button" className="primary-button" onClick={onAddFolder}>
            Add New+
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-rail">
          <div className="panel week-card">
            <div className="panel__head">
              <h2>Week Calendar</h2>
              <span>
                {today.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="week-strip">
              {weekDays.map((day) => {
                const isToday = day.toDateString() === today.toDateString()

                return (
                  <div key={day.toISOString()} className={`week-strip__day ${isToday ? "week-strip__day--active" : ""}`}>
                    <span>{day.toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 2)}</span>
                    <strong>{day.getDate()}</strong>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="panel">
            <div className="panel__head">
              <h2>Progress</h2>
              <span>{tasks.length} reminder</span>
            </div>
            <div className="metric-stack">
              <div className="metric-card metric-card--green">
                <small>Finished</small>
                <strong>{progressSummary.done}</strong>
              </div>
              <div className="metric-card metric-card--amber">
                <small>On Progress</small>
                <strong>{progressSummary.inProgress}</strong>
              </div>
              <div className="metric-card metric-card--rose">
                <small>Overdue</small>
                <strong>{progressSummary.overdue}</strong>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel__head">
              <h2>Percentage</h2>
              <span>Snapshot</span>
            </div>
            <div className="progress-columns">
              <div className="progress-columns__item">
                <div className="progress-columns__bar">
                  <span style={{ height: `${Math.max(completionRate, 12)}%` }} />
                </div>
                <small>done</small>
              </div>
              <div className="progress-columns__item">
                <div className="progress-columns__bar">
                  <span style={{ height: `${Math.max(Math.min(progressSummary.inProgress * 18, 100), 10)}%` }} />
                </div>
                <small>active</small>
              </div>
              <div className="progress-columns__item">
                <div className="progress-columns__bar">
                  <span style={{ height: `${Math.max(Math.min(progressSummary.overdue * 22, 100), 8)}%` }} />
                </div>
                <small>late</small>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="folder-summary">
            <div className="folder-summary__item">
              <strong>{allFolders.length}</strong>
              <span>Reminder folders</span>
            </div>
            <div className="folder-summary__item">
              <strong>{sharedFolders}</strong>
              <span>Shared groups</span>
            </div>
            <div className="folder-summary__item">
              <strong>{allFolders.length - sharedFolders}</strong>
              <span>Personal spaces</span>
            </div>
          </div>

          <div className="folder-list">
            {folders.length === 0 ? (
              <div className="panel folder-empty">
                <h3>Belum ada folder yang cocok</h3>
                <p>Coba kata kunci lain atau buat folder reminder baru lewat tombol `Add New+`.</p>
              </div>
            ) : (
              folders.map((folder) => {
                const folderTasks = tasks.filter((task) => task.folderId === folder.id)

                return (
                  <button
                    key={folder.id}
                    type="button"
                    className={`folder-card folder-card--${folder.color}`}
                    onClick={() => onOpenFolder(folder.id)}
                  >
                    <div className="folder-card__avatar">
                      {folder.imageData ? (
                        <img
                          className="folder-card__avatar-image"
                          src={folder.imageData}
                          alt={`Folder ${folder.name}`}
                        />
                      ) : (
                        folder.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="folder-card__body">
                      <div className="folder-card__title-row">
                        <h3>{folder.name}</h3>
                        <span className="folder-card__type">{folder.type === "group" ? "Group" : "Personal"}</span>
                      </div>
                      <p>{folder.description}</p>
                      <div className="folder-card__meta">
                        <span>{folder.members.length} member</span>
                        <span>{folderTasks.length} reminder</span>
                        <span
                          className="linkish"
                          onClick={(event) => {
                            event.stopPropagation()
                            onEditFolder(folder.id)
                          }}
                        >
                          Edit foto
                        </span>
                      </div>
                      <div className="folder-card__members">
                        {folder.members.map((member) => (
                          <span key={member} className="folder-card__member-chip">
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default DashboardHome
