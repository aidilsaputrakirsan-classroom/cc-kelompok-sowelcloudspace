import TaskForm from "./TaskForm"

function TaskModal({
  isOpen,
  mode = "create",
  editingTask = null,
  onClose,
  onSubmit,
  folderOptions = [],
  selectedFolderId = null,
}) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card--task" onClick={(event) => event.stopPropagation()}>
        <div className="modal-card__header">
          <div>
            <p className="eyebrow">{mode === "edit" ? "Edit Task" : "New Task"}</p>
            <h2>{mode === "edit" ? "Ubah reminder" : "Buat task baru"}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>x</button>
        </div>

        <TaskForm
          onSubmit={onSubmit}
          editingTask={editingTask}
          onCancelEdit={onClose}
          folderOptions={folderOptions}
          selectedFolderId={selectedFolderId}
          lockFolderSelection={mode === "create" && selectedFolderId !== null}
          isModal
        />
      </div>
    </div>
  )
}

export default TaskModal
