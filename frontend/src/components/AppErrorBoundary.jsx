import { Component } from "react"
import { getUserFriendlyErrorMessage, isApiError } from "../services/api"

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error("AppErrorBoundary caught an error:", error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleRetry = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state

    if (error) {
      const is503 = error.status === 503
      const title = is503 
        ? "Layanan Tidak Tersedia (503)" 
        : (isApiError(error) ? "Koneksi aplikasi bermasalah" : "Aplikasi mengalami kendala")
      const description = getUserFriendlyErrorMessage(
        error,
        "Terjadi error yang tidak terduga. Muat ulang halaman untuk mencoba lagi.",
      )

      return (
        <main className="error-boundary">
          <section className="error-boundary__card">
            <p className="error-boundary__eyebrow">Production Safety</p>
            <h1>{title}</h1>
            <p>{description}</p>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button type="button" className="primary-button" onClick={this.handleRetry}>
                Coba Lagi
              </button>
              <button type="button" className="ghost-button" onClick={this.handleReload}>
                Muat ulang halaman
              </button>
            </div>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary
