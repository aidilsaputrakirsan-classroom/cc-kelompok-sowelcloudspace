import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import SearchBar from "../SearchBar"

describe("SearchBar Component", () => {
  it("memanggil onSearchChange saat user mengetik di input", () => {
    const handleSearchChange = vi.fn()

    render(
      <SearchBar
        totalTasks={5}
        filteredTasks={5}
        searchQuery=""
        priorityFilter="all"
        onSearchChange={handleSearchChange}
        onPriorityChange={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByPlaceholderText(/cari nama task/i), {
      target: { value: "meeting" },
    })

    expect(handleSearchChange).toHaveBeenCalledWith("meeting")
  })

  it("menampilkan tombol clear dan mengosongkan query saat diklik", () => {
    const handleSearchChange = vi.fn()

    render(
      <SearchBar
        totalTasks={5}
        filteredTasks={1}
        searchQuery="meeting"
        priorityFilter="all"
        onSearchChange={handleSearchChange}
        onPriorityChange={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /clear/i }))

    expect(handleSearchChange).toHaveBeenCalledWith("")
  })
})
