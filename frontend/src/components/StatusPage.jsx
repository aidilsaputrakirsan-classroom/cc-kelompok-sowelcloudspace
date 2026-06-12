import { useState, useEffect, useCallback } from "react"
import { fetchServiceHealth, fetchServiceMetrics } from "../services/api"

export default function StatusPage() {
  const [services, setServices] = useState({
    auth: { health: null, metrics: null, loading: true },
    tasks: { health: null, metrics: null, loading: true },
  })
  const [timeLeft, setTimeLeft] = useState(10)
  const [lastChecked, setLastChecked] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchStatus = useCallback(async () => {
    setIsRefreshing(true)
    const now = new Date()
    setLastChecked(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))

    // Fetch Auth Service status
    let authHealth = null
    let authMetrics = null
    try {
      authHealth = await fetchServiceHealth("auth")
    } catch (e) {
      authHealth = { status: "unreachable", database: "disconnected" }
    }

    try {
      authMetrics = await fetchServiceMetrics("auth")
    } catch (e) {
      authMetrics = null
    }

    // Fetch Task Service status
    let taskHealth = null
    let taskMetrics = null
    try {
      taskHealth = await fetchServiceHealth("tasks")
    } catch (e) {
      taskHealth = { status: "unreachable", database: "disconnected" }
    }

    try {
      taskMetrics = await fetchServiceMetrics("tasks")
    } catch (e) {
      taskMetrics = null
    }

    setServices({
      auth: { health: authHealth, metrics: authMetrics, loading: false },
      tasks: { health: taskHealth, metrics: taskMetrics, loading: false },
    })
    setIsRefreshing(false)
  }, [])

  // Auto-refresh mechanism
  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchStatus()
          return 10
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [fetchStatus])

  const handleManualRefresh = () => {
    fetchStatus()
    setTimeLeft(10)
  }

  // Format uptime into readable string
  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return "N/A"
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor((seconds % (3600 * 24)) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    const parts = []
    if (d > 0) parts.push(`${d}d`)
    if (h > 0) parts.push(`${h}h`)
    if (m > 0) parts.push(`${m}m`)
    if (s > 0 || parts.length === 0) parts.push(`${s}s`)

    return parts.join(" ")
  }

  const isAllHealthy =
    services.auth.health?.status === "healthy" &&
    services.tasks.health?.status === "healthy"

  const isAnyWarning =
    services.auth.health?.status === "unhealthy" ||
    services.tasks.health?.status === "unhealthy" ||
    services.auth.health?.status === "unreachable" ||
    services.tasks.health?.status === "unreachable"

  // Get data for charts
  const authErrRate = services.auth.metrics?.error_rate ?? 0
  const tasksErrRate = services.tasks.metrics?.error_rate ?? 0
  const authRequests = services.auth.metrics?.requests?.total ?? 0
  const tasksRequests = services.tasks.metrics?.requests?.total ?? 0

  // Calculate SVG heights/widths
  const maxErrRate = Math.max(authErrRate, tasksErrRate, 10)
  const maxRequests = Math.max(authRequests, tasksRequests, 50)

  const authErrHeight = (authErrRate / maxErrRate) * 140
  const tasksErrHeight = (tasksErrRate / maxErrRate) * 140

  const authReqHeight = (authRequests / maxRequests) * 140
  const tasksReqHeight = (tasksRequests / maxRequests) * 140

  return (
    <div className="status-page">
      <header className="status-page__header">
        <div>
          <h1 className="status-page__title">Service Status Dashboard</h1>
          <p className="status-page__subtitle">Pemantauan real-time microservices Sowel Cloudspace</p>
        </div>
        <div className="status-page__controls">
          <div className="status-page__refresh-indicator" aria-label="Auto refresh countdown">
            <svg className="status-page__refresh-svg" viewBox="0 0 36 36">
              <path
                className="status-page__refresh-track"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="status-page__refresh-fill"
                strokeDasharray={`${(timeLeft / 10) * 100}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="status-page__countdown-text">{timeLeft}s</span>
          </div>
          <button
            type="button"
            className={`status-page__refresh-btn ${isRefreshing ? "status-page__refresh-btn--loading" : ""}`}
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Memuat..." : "Refresh Sekarang"}
          </button>
        </div>
      </header>

      {/* Aggregate Banner */}
      <section
        className={`status-page__banner ${
          isAllHealthy
            ? "status-page__banner--healthy"
            : isAnyWarning
            ? "status-page__banner--warning"
            : "status-page__banner--loading"
        }`}
      >
        <div className="status-page__banner-icon">
          {isAllHealthy ? "✓" : isAnyWarning ? "⚠️" : "⟳"}
        </div>
        <div className="status-page__banner-content">
          <h2>
            {isAllHealthy
              ? "Semua Sistem Operasional"
              : isAnyWarning
              ? "Beberapa Layanan Mengalami Kendala"
              : "Menghubungi Layanan Monitoring..."}
          </h2>
          <p>
            Pengecekan terakhir dilakukan pada pukul <strong className="status-page__timestamp">{lastChecked || "Menghubungi..."}</strong>
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <div className="status-page__grid">
        {/* Auth Service Card */}
        <article className="status-card">
          <div className="status-card__header">
            <div className="status-card__title-group">
              <span className="status-card__icon" role="img" aria-label="Auth Service">🔐</span>
              <div>
                <h3 className="status-card__title">Authentication Service</h3>
                <span className="status-card__port">Port 8001 via /auth/*</span>
              </div>
            </div>
            {services.auth.loading ? (
              <span className="status-indicator status-indicator--loading">Checking</span>
            ) : services.auth.health?.status === "healthy" ? (
              <span className="status-indicator status-indicator--healthy">Online</span>
            ) : (
              <span className="status-indicator status-indicator--offline">Offline</span>
            )}
          </div>

          <div className="status-card__body">
            <div className="status-card__metric-row">
              <span className="status-card__metric-label">Status Database</span>
              <span
                className={`status-card__metric-val status-card__db-status ${
                  services.auth.health?.database === "connected"
                    ? "status-card__db-status--connected"
                    : "status-card__db-status--disconnected"
                }`}
              >
                {services.auth.loading
                  ? "Checking..."
                  : services.auth.health?.database === "connected"
                  ? "Connected"
                  : "Disconnected"}
              </span>
            </div>

            <div className="status-card__metric-row">
              <span className="status-card__metric-label">Service Uptime</span>
              <span className="status-card__metric-val">
                {services.auth.loading
                  ? "..."
                  : formatUptime(services.auth.metrics?.uptime_seconds)}
              </span>
            </div>

            <div className="status-card__metric-row">
              <span className="status-card__metric-label">Total Requests</span>
              <span className="status-card__metric-val">
                {services.auth.loading ? "..." : services.auth.metrics?.requests?.total ?? 0}
              </span>
            </div>

            <div className="status-card__metric-row">
              <span className="status-card__metric-label">Rata-Rata Latensi</span>
              <span className="status-card__metric-val">
                {services.auth.loading
                  ? "..."
                  : `${services.auth.metrics?.avg_latency_ms ?? 0} ms`}
              </span>
            </div>

            <div className="status-card__progress-container">
              <div className="status-card__progress-label">
                <span>Success Rate</span>
                <span>
                  {services.auth.loading
                    ? "..."
                    : `${100 - (services.auth.metrics?.error_rate ?? 0)}%`}
                </span>
              </div>
              <div className="status-card__progress-bar">
                <div
                  className="status-card__progress-fill"
                  style={{
                    width: services.auth.loading
                      ? "0%"
                      : `${100 - (services.auth.metrics?.error_rate ?? 0)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </article>

        {/* Task Service Card */}
        <article className="status-card">
          <div className="status-card__header">
            <div className="status-card__title-group">
              <span className="status-card__icon" role="img" aria-label="Task Service">📋</span>
              <div>
                <h3 className="status-card__title">Task & Folder Service</h3>
                <span className="status-card__port">Port 8002 via /tasks/* & /api/folders</span>
              </div>
            </div>
            {services.tasks.loading ? (
              <span className="status-indicator status-indicator--loading">Checking</span>
            ) : services.tasks.health?.status === "healthy" ? (
              <span className="status-indicator status-indicator--healthy">Online</span>
            ) : (
              <span className="status-indicator status-indicator--offline">Offline</span>
            )}
          </div>

          <div className="status-card__body">
            <div className="status-card__metric-row">
              <span className="status-card__metric-label">Status Database</span>
              <span
                className={`status-card__metric-val status-card__db-status ${
                  services.tasks.health?.database === "connected"
                    ? "status-card__db-status--connected"
                    : "status-card__db-status--disconnected"
                }`}
              >
                {services.tasks.loading
                  ? "Checking..."
                  : services.tasks.health?.database === "connected"
                  ? "Connected"
                  : "Disconnected"}
              </span>
            </div>

            <div className="status-card__metric-row">
              <span className="status-card__metric-label">Service Uptime</span>
              <span className="status-card__metric-val">
                {services.tasks.loading
                  ? "..."
                  : formatUptime(services.tasks.metrics?.uptime_seconds)}
              </span>
            </div>

            <div className="status-card__metric-row">
              <span className="status-card__metric-label">Total Requests</span>
              <span className="status-card__metric-val">
                {services.tasks.loading ? "..." : services.tasks.metrics?.requests?.total ?? 0}
              </span>
            </div>

            <div className="status-card__metric-row">
              <span className="status-card__metric-label">Rata-Rata Latensi</span>
              <span className="status-card__metric-val">
                {services.tasks.loading
                  ? "..."
                  : `${services.tasks.metrics?.avg_latency_ms ?? 0} ms`}
              </span>
            </div>

            <div className="status-card__progress-container">
              <div className="status-card__progress-label">
                <span>Success Rate</span>
                <span>
                  {services.tasks.loading
                    ? "..."
                    : `${100 - (services.tasks.metrics?.error_rate ?? 0)}%`}
                </span>
              </div>
              <div className="status-card__progress-bar">
                <div
                  className="status-card__progress-fill"
                  style={{
                    width: services.tasks.loading
                      ? "0%"
                      : `${100 - (services.tasks.metrics?.error_rate ?? 0)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Visualizations Section */}
      <section className="status-charts">
        <h2 className="status-charts__title">Visualisasi Metrik Performa</h2>
        <div className="status-charts__grid">
          {/* Chart 1: Error Rate */}
          <div className="status-chart-card">
            <h3 className="status-chart-card__title">Error Rate (%)</h3>
            <div className="status-chart-card__svg-container">
              <svg className="status-chart-svg" viewBox="0 0 320 200">
                {/* Horizontal Grid lines */}
                <line x1="40" y1="30" x2="300" y2="30" stroke="#dacfee" strokeDasharray="4 4" />
                <line x1="40" y1="90" x2="300" y2="90" stroke="#dacfee" strokeDasharray="4 4" />
                <line x1="40" y1="150" x2="300" y2="150" stroke="#dacfee" />

                {/* Y Axis Labels */}
                <text x="30" y="34" className="status-chart-label" textAnchor="end">
                  {maxErrRate.toFixed(1)}%
                </text>
                <text x="30" y="94" className="status-chart-label" textAnchor="end">
                  {(maxErrRate / 2).toFixed(1)}%
                </text>
                <text x="30" y="154" className="status-chart-label" textAnchor="end">
                  0%
                </text>

                {/* Bars */}
                {/* Auth Bar */}
                <rect
                  x="80"
                  y={150 - authErrHeight}
                  width="50"
                  height={authErrHeight}
                  rx="6"
                  className="status-chart-bar status-chart-bar--auth-err"
                />
                <text x="105" y={145 - authErrHeight} className="status-chart-value" textAnchor="middle">
                  {authErrRate.toFixed(1)}%
                </text>

                {/* Task Bar */}
                <rect
                  x="190"
                  y={150 - tasksErrHeight}
                  width="50"
                  height={tasksErrHeight}
                  rx="6"
                  className="status-chart-bar status-chart-bar--tasks-err"
                />
                <text x="215" y={145 - tasksErrHeight} className="status-chart-value" textAnchor="middle">
                  {tasksErrRate.toFixed(1)}%
                </text>

                {/* X Axis Labels */}
                <text x="105" y="174" className="status-chart-label status-chart-label--x" textAnchor="middle">
                  Auth
                </text>
                <text x="215" y="174" className="status-chart-label status-chart-label--x" textAnchor="middle">
                  Task
                </text>
              </svg>
            </div>
          </div>

          {/* Chart 2: Total Requests */}
          <div className="status-chart-card">
            <h3 className="status-chart-card__title">Volume Request (Total)</h3>
            <div className="status-chart-card__svg-container">
              <svg className="status-chart-svg" viewBox="0 0 320 200">
                {/* Horizontal Grid lines */}
                <line x1="40" y1="30" x2="300" y2="30" stroke="#dacfee" strokeDasharray="4 4" />
                <line x1="40" y1="90" x2="300" y2="90" stroke="#dacfee" strokeDasharray="4 4" />
                <line x1="40" y1="150" x2="300" y2="150" stroke="#dacfee" />

                {/* Y Axis Labels */}
                <text x="30" y="34" className="status-chart-label" textAnchor="end">
                  {Math.round(maxRequests)}
                </text>
                <text x="30" y="94" className="status-chart-label" textAnchor="end">
                  {Math.round(maxRequests / 2)}
                </text>
                <text x="30" y="154" className="status-chart-label" textAnchor="end">
                  0
                </text>

                {/* Bars */}
                {/* Auth Bar */}
                <rect
                  x="80"
                  y={150 - authReqHeight}
                  width="50"
                  height={authReqHeight}
                  rx="6"
                  className="status-chart-bar status-chart-bar--auth-req"
                />
                <text x="105" y={145 - authReqHeight} className="status-chart-value" textAnchor="middle">
                  {authRequests}
                </text>

                {/* Task Bar */}
                <rect
                  x="190"
                  y={150 - tasksReqHeight}
                  width="50"
                  height={tasksReqHeight}
                  rx="6"
                  className="status-chart-bar status-chart-bar--tasks-req"
                />
                <text x="215" y={145 - tasksReqHeight} className="status-chart-value" textAnchor="middle">
                  {tasksRequests}
                </text>

                {/* X Axis Labels */}
                <text x="105" y="174" className="status-chart-label status-chart-label--x" textAnchor="middle">
                  Auth
                </text>
                <text x="215" y="174" className="status-chart-label status-chart-label--x" textAnchor="middle">
                  Task
                </text>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
