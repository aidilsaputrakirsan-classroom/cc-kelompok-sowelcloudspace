import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Header from '../Header'

describe('Header Component', () => {
  it('menampilkan judul aplikasi', () => {
    render(
      <Header
        totalTasks={0}
        completedTasks={0}
        isConnected={true}
        onLogout={vi.fn()}
        onOpenAbout={vi.fn()}
      />,
    )

    expect(screen.getByText(/sowel task/i)).toBeInTheDocument()
  })

  it('menampilkan jumlah total task', () => {
    render(
      <Header
        totalTasks={5}
        completedTasks={2}
        isConnected={true}
        onLogout={vi.fn()}
        onOpenAbout={vi.fn()}
      />,
    )

    expect(screen.getByText(/5 total/i)).toBeInTheDocument()
  })
})
