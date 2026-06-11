import WorkspacePage from "./WorkspacePage"
import TaskList from "./TaskList"

function formatDate(value) {
  if (!value) return "-"
  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function FolderDetailPage({
  selectedFolder,
  folders,
  tasks,
  isConnected,
  loading,
  onAddFolder,
  onClearFolder,
  onSelectFolder,
  onEditFolder,
  onDeleteFolder,
  onBackHome,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  onAddTask,
}) {
  const completedTasks = tasks.filter((task) => task.status === "done").length
  const overdueTasks = tasks.filter((task) => (
    task.status !== "done" && task.deadline && new Date(task.deadline) < new Date()
  )).length

  if (!selectedFolder) {
    return (
      <WorkspacePage
        selectedFolder={null}
        folders={folders}
        totalTasks={0}
        filteredTasks={0}
        completedTasks={0}
        isConnected={isConnected}
        onAddFolder={onAddFolder}
        onClearFolder={onClearFolder}
        onSelectFolder={onSelectFolder}
        onEditFolder={onEditFolder}
      >
        <div className="panel folder-detail-empty">
          <h2>Pilih folder untuk melihat detail</h2>
          <p>Buka salah satu folder dari dashboard atau pilih dari chip di atas.</p>
        </div>
      </WorkspacePage>
    )
  }

  return (
    <WorkspacePage
      selectedFolder={selectedFolder}
      folders={folders}
      totalTasks={tasks.length}
      filteredTasks={tasks.length}
      completedTasks={completedTasks}
      isConnected={isConnected}
      onAddFolder={onAddFolder}
      onClearFolder={onClearFolder}
      onSelectFolder={onSelectFolder}
      onEditFolder={onEditFolder}
    >
      <div className={`folder-detail-hero folder-detail-hero--${selectedFolder.color}`}>
        <div className="folder-detail-hero__main">
          <button type="button" className="folder-detail-hero__back" onClick={onBackHome}>
            Kembali ke dashboard
          </button>
          <div className="folder-detail-hero__identity">
            <div className="folder-detail-hero__avatar">
              {selectedFolder.imageData ? (
                <img src={selectedFolder.imageData} alt={`Folder ${selectedFolder.name}`} />
              ) : (
                selectedFolder.name.slice(0, 2).toUpperCase()
              )}
            </div>

            <div>
              <p className="eyebrow">Folder Detail</p>
              <h2>{selectedFolder.name}</h2>
              <p className="folder-detail-hero__description">
                {selectedFolder.description || "Folder ini belum punya deskripsi."}
              </p>
            </div>
          </div>
        </div>

        <div className="folder-detail-hero__side">
          <span className="folder-detail-pill">
            {selectedFolder.type === "group" ? "Group folder" : "Personal folder"}
          </span>
          <span className="folder-detail-pill">{tasks.length} reminder</span>
          <span className="folder-detail-pill">{completedTasks} selesai</span>
          <span className="folder-detail-pill">{overdueTasks} overdue</span>
        </div>
      </div>

      <div className="folder-detail-grid">
        <div className="panel folder-detail-panel">
          <div className="panel__head">
            <div>
              <h2>Informasi Folder</h2>
              <p>Detail folder diambil dari backend dan ditampilkan apa adanya di frontend.</p>
            </div>
          </div>

          <div className="folder-detail-stats">
            <div className="folder-detail-stat">
              <strong>{selectedFolder.members.length}</strong>
              <span>Member</span>
            </div>
            <div className="folder-detail-stat">
              <strong>{formatDate(selectedFolder.createdAt)}</strong>
              <span>Dibuat</span>
            </div>
            <div className="folder-detail-stat">
              <strong>{formatDate(selectedFolder.updatedAt || selectedFolder.createdAt)}</strong>
              <span>Terakhir diubah</span>
            </div>
          </div>

          <div className="folder-detail-members">
            {selectedFolder.type === "group" && selectedFolder.members.length > 0 ? (
              selectedFolder.members.map((member) => (
                <span key={member} className="folder-card__member-chip folder-card__member-chip--soft">
                  {member}
                </span>
              ))
            ) : (
              <p className="empty-inline">
                {selectedFolder.type === "group"
                  ? "Belum ada member di folder ini."
                  : "Folder personal tidak memiliki daftar member."}
              </p>
            )}
          </div>

          <div className="folder-detail-actions">
            <button type="button" className="ghost-button" onClick={() => onEditFolder(selectedFolder.id)}>
              Edit folder
            </button>
            <button type="button" className="folder-danger-button" onClick={() => onDeleteFolder(selectedFolder.id)}>
              Hapus folder
            </button>
          </div>
        </div>

        <div className="panel folder-detail-panel">
          <div className="panel__head">
            <div>
              <h2>Reminder di Folder Ini</h2>
              <p>
                {selectedFolder.type === "group"
                  ? "Folder group ini bisa dipakai kolaborasi oleh member yang sudah terhubung ke folder."
                  : "Semua task yang terhubung ke folder ini ditampilkan dan bisa dikelola di sini."}
              </p>
            </div>
            {loading ? <span>Memuat...</span> : <span>{tasks.length} item</span>}
          </div>

          <div className="folder-detail-task-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => onAddTask(selectedFolder.id)}
            >
              Tambah Task Baru
            </button>
          </div>

          <TaskList
            tasks={tasks}
            searchQuery=""
            priorityFilter="all"
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onComplete={onCompleteTask}
            loading={loading}
          />
        </div>
      </div>
    </WorkspacePage>
  )
}

export default FolderDetailPage
