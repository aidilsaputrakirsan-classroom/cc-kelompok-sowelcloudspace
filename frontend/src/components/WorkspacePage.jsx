function WorkspacePage({
  selectedFolder,
  folders,
  totalTasks,
  filteredTasks,
  completedTasks,
  isConnected,
  onAddFolder,
  onClearFolder,
  onSelectFolder,
  onEditFolder,
  children,
}) {
  return (
    <section className="stack-page">
      <div className="workspace-hero">
        <div>
          <p className="eyebrow">Reminder Workspace</p>
          <h1>{selectedFolder ? selectedFolder.name : "All folders"}</h1>
          <p className="workspace-hero__lead">
            Halaman task lama dipakai di sini untuk isi reminder dari folder personal atau group yang kamu pilih.
          </p>
        </div>

        <div className="workspace-hero__stats">
          <span>{totalTasks} total</span>
          <span>{completedTasks} done</span>
          <span>{filteredTasks} visible</span>
          <span className={`status-chip ${isConnected ? "status-chip--ok" : "status-chip--off"}`}>
            {isConnected ? "Backend connected" : "Backend disconnected"}
          </span>
        </div>
      </div>

      <div className="workspace-toolbar">
        <div className="folder-chip-row">
          <button
            type="button"
            className={`folder-chip ${!selectedFolder ? "folder-chip--active" : ""}`}
            onClick={onClearFolder}
          >
            Semua
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              className={`folder-chip ${selectedFolder?.id === folder.id ? "folder-chip--active" : ""}`}
              onClick={() => onSelectFolder(folder.id)}
            >
              {folder.name}
            </button>
          ))}
        </div>

        <div className="workspace-toolbar__actions">
          {selectedFolder && (
            <button type="button" className="ghost-button" onClick={() => onEditFolder(selectedFolder.id)}>
              Edit folder
            </button>
          )}
          <button type="button" className="primary-button" onClick={onAddFolder}>
            Add folder
          </button>
        </div>
      </div>

      <div className="workspace-stack">{children}</div>
    </section>
  )
}

export default WorkspacePage
