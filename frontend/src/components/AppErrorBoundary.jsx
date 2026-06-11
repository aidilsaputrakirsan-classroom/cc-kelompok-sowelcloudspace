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

  render() {
    const { error } = this.state

    if (error) {
      const title = isApiError(error) ? "Koneksi aplikasi bermasalah" : "Aplikasi mengalami kendala"
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
            <button type="button" className="primary-button error-boundary__action" onClick={this.handleReload}>
              Muat ulang aplikasi
            </button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary
