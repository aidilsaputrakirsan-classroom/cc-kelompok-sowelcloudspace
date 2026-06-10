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
    <div className="modal-overlay">
      {/* We strip out standard modal-content padding/background because TaskForm has its own container styling */}
      <div className="modal-content" style={{ padding: 0, background: "transparent", boxShadow: "none", border: "none", maxWidth: "650px" }}>
        <TaskForm
          onSubmit={onSubmit}
          editingTask={editingTask}
          onCancelEdit={onClose}
          folderOptions={folderOptions}
          selectedFolderId={selectedFolderId}
          lockFolderSelection={mode === "create" && selectedFolderId !== null}
        />
      </div>
    </div>
  )
}

export default TaskModal
