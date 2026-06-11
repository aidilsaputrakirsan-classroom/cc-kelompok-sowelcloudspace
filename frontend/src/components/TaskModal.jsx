import TaskForm from "./TaskForm"

function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  editingTask,
  folderOptions = [],
  selectedFolderId = null,
}) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card--task" onClick={(event) => event.stopPropagation()}>
        <div className="modal-card__header">
          <div>
            <p className="eyebrow">{editingTask ? "Edit Task" : "New Task"}</p>
            <h2>{editingTask ? "Ubah task" : "Tambah Task Baru"}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>x</button>
        </div>

        <TaskForm
          onSubmit={onSubmit}
          editingTask={editingTask}
          onCancelEdit={onClose}
          folderOptions={folderOptions}
          selectedFolderId={selectedFolderId}
          lockFolderSelection={Boolean(selectedFolderId)}
        />
      </div>
    </div>
  )
}

export default TaskModal
