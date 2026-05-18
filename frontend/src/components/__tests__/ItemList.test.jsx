import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ItemList from "../ItemList"

const mockItems = [
  {
    id: 1,
    name: "Laptop",
    description: "Laptop kerja tim",
    price: 15000000,
    quantity: 2,
    created_at: "2026-05-10T09:00:00Z",
  },
  {
    id: 2,
    name: "Keyboard",
    description: "Keyboard mekanikal",
    price: 750000,
    quantity: 4,
    created_at: "2026-05-10T10:00:00Z",
  },
]

describe("ItemList Component", () => {
  it("menampilkan empty state saat tidak ada item", () => {
    render(
      <ItemList
        items={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        loading={false}
      />,
    )

    expect(screen.getByText(/belum ada item/i)).toBeInTheDocument()
    expect(screen.getByText(/menambahkan item pertama/i)).toBeInTheDocument()
  })

  it("me-render daftar item saat data tersedia", () => {
    render(
      <ItemList
        items={mockItems}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        loading={false}
      />,
    )

    expect(screen.getByText("Laptop")).toBeInTheDocument()
    expect(screen.getByText("Keyboard")).toBeInTheDocument()
  })
})
