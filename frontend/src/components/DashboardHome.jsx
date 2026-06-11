import { useEffect, useMemo, useState } from "react"

const FOLDERS_PER_PAGE = 6

function DashboardHome({
  folders,
  allFolders,
  tasks,
  currentUser,
  dashboardQuery,
  onSearchChange,
  onAddFolder,
  onOpenFolder,
  onEditFolder,
  onDeleteFolder,
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

  const sharedFolders = allFolders.filter((folder) => folder.type === "group").length
  const greetingName = currentUser?.name?.trim() || "Teman"
  const [folderPage, setFolderPage] = useState(1)
  const totalFolderPages = Math.max(1, Math.ceil(folders.length / FOLDERS_PER_PAGE))

  const paginatedFolders = useMemo(() => {
    const start = (folderPage - 1) * FOLDERS_PER_PAGE
    return folders.slice(start, start + FOLDERS_PER_PAGE)
  }, [folderPage, folders])

  // Reset to page 1 when search query changes
  useEffect(() => {
    setFolderPage(1)
  }, [dashboardQuery])

  // Clamp page if folders shrink (e.g. after delete)
  useEffect(() => {
    setFolderPage((prev) => Math.min(prev, totalFolderPages))
  }, [totalFolderPages])

  return (
    <section className="dashboard-page">
      <div className="dashboard-page__header">
        <div>
          <p className="eyebrow">Main Dashboard</p>
          <h1>{`Halo, ${greetingName}!`}</h1>
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
              paginatedFolders.map((folder) => {
                const folderTasks = tasks.filter((task) => task.folderId === folder.id)
                const hasMembers = folder.type === "group" && folder.members.length > 0

                return (
                  <article
                    key={folder.id}
                    className={`folder-card folder-card--${folder.color}`}
                    onClick={() => onOpenFolder(folder.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        onOpenFolder(folder.id)
                      }
                    }}
                    role="button"
                    tabIndex={0}
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
                        <span>{folder.type === "group" ? `${folder.members.length} member` : "Personal folder"}</span>
                        <span>{folderTasks.length} reminder</span>
                        <button
                          type="button"
                          className="folder-card__action folder-card__action--edit"
                          onClick={(event) => {
                            event.stopPropagation()
                            onEditFolder(folder.id)
                          }}
                        >
                          Edit folder
                        </button>
                        <button
                          type="button"
                          className="folder-card__action folder-card__action--delete"
                          onClick={(event) => {
                            event.stopPropagation()
                            onDeleteFolder(folder.id)
                          }}
                        >
                          Hapus folder
                        </button>
                      </div>
                      {hasMembers && (
                        <div className="folder-card__members">
                          {folder.members.map((member) => (
                            <span key={member} className="folder-card__member-chip">
                              {member}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                )
              })
            )}
          </div>

          {folders.length > FOLDERS_PER_PAGE && (
            <div className="folder-pagination" aria-label="Navigasi halaman folder">
              <button
                type="button"
                onClick={() => setFolderPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={folderPage === 1}
              >
                Prev
              </button>
              <span>
                {folderPage} / {totalFolderPages}
              </span>
              <button
                type="button"
                onClick={() => setFolderPage((currentPage) => Math.min(totalFolderPages, currentPage + 1))}
                disabled={folderPage === totalFolderPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default DashboardHome
