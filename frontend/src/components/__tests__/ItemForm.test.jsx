import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ItemForm from "../ItemForm"

describe("ItemForm Component", () => {
  it("submit item baru dengan data yang valid", async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <ItemForm
        onSubmit={handleSubmit}
        editingItem={null}
        onCancelEdit={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByPlaceholderText(/contoh: laptop/i), {
      target: { value: "Mouse Gaming" },
    })
    fireEvent.change(screen.getByPlaceholderText(/contoh: 15000000/i), {
      target: { value: "250000" },
    })
    fireEvent.change(screen.getByPlaceholderText(/opsional/i), {
      target: { value: "RGB wireless" },
    })

    fireEvent.click(screen.getByRole("button", { name: /tambah item/i }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        {
          name: "Mouse Gaming",
          description: "RGB wireless",
          price: 250000,
          quantity: 0,
        },
        undefined,
      )
    })
  })

  it("menampilkan validasi saat nama item kosong", async () => {
    const handleSubmit = vi.fn()

    render(
      <ItemForm
        onSubmit={handleSubmit}
        editingItem={null}
        onCancelEdit={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByPlaceholderText(/contoh: 15000000/i), {
      target: { value: "50000" },
    })

    fireEvent.click(screen.getByRole("button", { name: /tambah item/i }))

    expect(await screen.findByText(/nama item wajib diisi/i)).toBeInTheDocument()
    expect(handleSubmit).not.toHaveBeenCalled()
  })
})
