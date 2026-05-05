import { useEffect, useState } from "react"

const DEFAULT_FORM = {
  name: "",
  type: "personal",
  description: "",
  members: ["Cantika"],
  memberInput: "",
  imageData: "",
}

function FolderModal({ isOpen, mode = "create", initialData = null, onClose, onSubmit }) {
  const [formData, setFormData] = useState(DEFAULT_FORM)

  useEffect(() => {
    if (!isOpen) {
      setFormData(DEFAULT_FORM)
      return
    }

    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name || "",
        type: initialData.type || "personal",
        description: initialData.description || "",
        members: Array.isArray(initialData.members) && initialData.members.length > 0 ? initialData.members : ["Cantika"],
        memberInput: "",
        imageData: initialData.imageData || "",
      })
      return
    }

    setFormData(DEFAULT_FORM)
  }, [initialData, isOpen, mode])

  if (!isOpen) return null

  const addMember = (rawName) => {
    const normalizedName = rawName.trim()
    if (!normalizedName) return

    setFormData((prev) => {
      const exists = prev.members.some((member) => member.toLowerCase() === normalizedName.toLowerCase())
      if (exists) {
        return { ...prev, memberInput: "" }
      }

      return {
        ...prev,
        members: [...prev.members, normalizedName],
        memberInput: "",
      }
    })
  }

  const removeMember = (memberToRemove) => {
    setFormData((prev) => {
      const nextMembers = prev.members.filter((member) => member !== memberToRemove)
      return {
        ...prev,
        members: nextMembers.length > 0 ? nextMembers : ["Cantika"],
      }
    })
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, imageData: String(reader.result || "") }))
    }
    reader.readAsDataURL(file)
  }

  const handleMemberKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault()
      addMember(formData.memberInput)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const pendingInput = formData.memberInput.trim()
    const nextMembers = pendingInput
      ? [...formData.members, pendingInput].filter((member, index, all) => (
        all.findIndex((item) => item.toLowerCase() === member.toLowerCase()) === index
      ))
      : formData.members

    onSubmit({
      name: formData.name.trim(),
      type: formData.type,
      description: formData.description.trim() || "Folder reminder baru.",
      members: nextMembers.filter(Boolean),
      imageData: formData.imageData || "",
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-card__header">
          <div>
            <p className="eyebrow">{mode === "edit" ? "Edit Folder" : "New Folder"}</p>
            <h2>{mode === "edit" ? "Ubah folder reminder" : "Buat folder reminder"}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>x</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            <span>Nama folder</span>
            <input
              type="text"
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Contoh: tugas studio"
              required
            />
          </label>

          <label>
            <span>Foto folder</span>
            <div className="upload-field">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <small>Pilih foto asli untuk avatar folder. File akan disimpan lokal di browser.</small>
            </div>
            <div className="upload-preview">
              {formData.imageData ? (
                <img src={formData.imageData} alt={`Preview ${formData.name || "folder"}`} />
              ) : (
                <div className="upload-preview__fallback">
                  {(formData.name || "FD").slice(0, 2).toUpperCase()}
                </div>
              )}
              {formData.imageData && (
                <button
                  type="button"
                  className="ghost-button upload-remove"
                  onClick={() => setFormData((prev) => ({ ...prev, imageData: "" }))}
                >
                  Hapus foto
                </button>
              )}
            </div>
          </label>

          <label>
            <span>Jenis folder</span>
            <select
              value={formData.type}
              onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value }))}
            >
              <option value="personal">Personal</option>
              <option value="group">Group</option>
            </select>
          </label>

          <label>
            <span>Deskripsi singkat</span>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Folder ini dipakai untuk reminder apa?"
            />
          </label>

          <label>
            <span>Member</span>
            <div className="member-builder">
              <div className="member-builder__chips">
                {formData.members.map((member) => (
                  <span key={member} className="member-chip">
                    {member}
                    <button
                      type="button"
                      className="member-chip__remove"
                      onClick={() => removeMember(member)}
                      aria-label={`Hapus ${member}`}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>

              <input
                type="text"
                value={formData.memberInput}
                onChange={(event) => setFormData((prev) => ({ ...prev, memberInput: event.target.value }))}
                onKeyDown={handleMemberKeyDown}
                placeholder="Tulis nama member lalu tekan Enter"
              />
              <small>Setiap tekan `Enter`, nama akan masuk ke daftar member dan kamu bisa lanjut tambah nama lain.</small>
            </div>
          </label>

          <div className="modal-form__actions">
            <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">
              {mode === "edit" ? "Save changes" : "Create folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FolderModal
