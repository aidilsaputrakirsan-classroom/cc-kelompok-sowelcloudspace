import { useEffect, useState } from "react"

import { API_URL, getToken, getUserFriendlyErrorMessage, isApiError } from "../services/api"

const DEFAULT_FORM = {
  name: "",
  type: "personal",
  description: "",
  members: [],
  memberInput: "",
  imageData: "",
}

function FolderModal({ isOpen, mode = "create", initialData = null, onClose, onSubmit }) {
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [isVerifying, setIsVerifying] = useState(false)
  const [memberError, setMemberError] = useState("")

  useEffect(() => {
    if (!isOpen) {
      setFormData(DEFAULT_FORM)
      setIsVerifying(false)
      setMemberError("")
      return
    }

    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name || "",
        type: initialData.type || "personal",
        description: initialData.description || "",
        members: Array.isArray(initialData.members) ? initialData.members : [],
        memberInput: "",
        imageData: initialData.imageData || "",
      })
      setIsVerifying(false)
      setMemberError("")
      return
    }

    setFormData(DEFAULT_FORM)
    setIsVerifying(false)
    setMemberError("")
  }, [initialData, isOpen, mode])

  if (!isOpen) return null

  const addMember = async (rawName) => {
    const normalizedName = rawName.trim()
    if (!normalizedName) {
      setMemberError("")
      return { ok: false, members: formData.members }
    }

    const duplicateMember = formData.members.find((member) => member.toLowerCase() === normalizedName.toLowerCase())
    if (duplicateMember) {
      setMemberError("")
      setFormData((prev) => ({ ...prev, memberInput: "" }))
      return { ok: true, members: formData.members }
    }

    setIsVerifying(true)
    setMemberError("")

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/users/verify/${encodeURIComponent(normalizedName)}`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Username '${normalizedName}' tidak terdaftar!`)
        }

        let detail = ""
        try {
          const errorBody = await response.json()
          detail = errorBody?.detail || errorBody?.message || ""
        } catch {
          detail = ""
        }

        throw new Error(detail || `Validasi username gagal (${response.status}).`)
      }

      let nextMembers = formData.members

      setFormData((prev) => {
        const exists = prev.members.some((member) => member.toLowerCase() === normalizedName.toLowerCase())
        if (exists) {
          nextMembers = prev.members
          return { ...prev, memberInput: "" }
        }

        nextMembers = [...prev.members, normalizedName]
        return {
          ...prev,
          members: nextMembers,
          memberInput: "",
        }
      })

      return { ok: true, members: nextMembers }
    } catch (error) {
      const message = isApiError(error)
        ? getUserFriendlyErrorMessage(error, "Tidak dapat memverifikasi username.")
        : error instanceof Error
          ? error.message
          : `Username '${normalizedName}' tidak terdaftar!`

      setMemberError(message)
      return { ok: false, members: formData.members }
    } finally {
      setIsVerifying(false)
    }
  }

  const removeMember = (memberToRemove) => {
    setFormData((prev) => {
      const nextMembers = prev.members.filter((member) => member !== memberToRemove)
      return {
        ...prev,
        members: nextMembers,
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

  const handleMemberKeyDown = async (event) => {
    if (event.key === "Enter") {
      event.preventDefault()
      await addMember(formData.memberInput)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isVerifying) return

    const pendingInput = formData.memberInput.trim()
    let nextMembers = formData.type === "group" ? formData.members : []

    if (formData.type === "group" && pendingInput) {
      const result = await addMember(pendingInput)
      if (!result.ok) {
        return
      }
      nextMembers = result.members
    }

    await onSubmit({
      name: formData.name.trim(),
      type: formData.type,
      description: formData.description.trim() || "Folder reminder baru.",
      members: formData.type === "group" ? nextMembers.filter(Boolean) : [],
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
              <small>Pilih foto untuk avatar folder.</small>
            </div>
          </label>

          <label>
            <span>Jenis folder</span>
            <select
              value={formData.type}
              onChange={(event) => {
                const nextType = event.target.value
                setFormData((prev) => ({
                  ...prev,
                  type: nextType,
                  memberInput: nextType === "group" ? prev.memberInput : "",
                }))
                if (nextType !== "group") {
                  setMemberError("")
                }
              }}
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

          {formData.type === "group" ? (
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
                  onChange={(event) => {
                    const nextValue = event.target.value
                    setFormData((prev) => ({ ...prev, memberInput: nextValue }))
                    if (memberError) {
                      setMemberError("")
                    }
                  }}
                  onKeyDown={handleMemberKeyDown}
                  placeholder="Tulis username member lalu tekan Enter"
                  disabled={isVerifying}
                />
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => addMember(formData.memberInput)}
                  disabled={isVerifying || !formData.memberInput.trim()}
                >
                  {isVerifying ? "Memverifikasi..." : "Tambah member"}
                </button>
                {memberError ? <small className="form-error">{memberError}</small> : null}
                <small>Setiap tekan `Enter`, username akan diverifikasi dulu sebelum masuk ke daftar member.</small>
              </div>
            </label>
          ) : null}

          <div className="modal-form__actions">
            <button type="button" className="ghost-button" onClick={onClose} disabled={isVerifying}>Cancel</button>
            <button type="submit" className="primary-button" disabled={isVerifying}>
              {mode === "edit" ? "Save changes" : "Create folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FolderModal
