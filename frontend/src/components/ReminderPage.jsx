import { useEffect, useMemo, useState } from "react"
import { fetchCalendarReminders, fetchUpcomingReminders, getUserFriendlyErrorMessage } from "../services/api"

const DIFFICULTY_FILTERS = [
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
]

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]

function buildMonthMatrix(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1)
  const startWeekday = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells = []

  for (let index = 0; index < startWeekday; index += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, monthIndex, day))
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

function getTaskDateKey(task) {
  if (!task.deadline) return ""
  const deadline = task.deadline instanceof Date ? task.deadline : new Date(task.deadline)
  if (Number.isNaN(deadline.getTime())) return ""
  const year = deadline.getFullYear()
  const month = String(deadline.getMonth() + 1).padStart(2, "0")
  const day = String(deadline.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatDeadline(value) {
  if (!value) return "Tanpa deadline"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Deadline tidak valid"

  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function isOverdue(task) {
  if (!task.deadline || task.status === "done") return false
  const dueTime = new Date(task.deadline).getTime()
  return !Number.isNaN(dueTime) && dueTime < Date.now()
}

function CalendarSummary({ tasks, loading, selectedDate, onSelectDate }) {
  const now = useMemo(() => new Date(), [])
  const year = now.getFullYear()
  const monthIndex = now.getMonth()
  const todayKey = getTaskDateKey({ deadline: now })

  const cells = useMemo(() => buildMonthMatrix(year, monthIndex), [monthIndex, year])
  const tasksByDate = useMemo(() => {
    return tasks.reduce((groups, task) => {
      const key = getTaskDateKey(task)
      if (!key) return groups
      return { ...groups, [key]: [...(groups[key] || []), task] }
    }, {})
  }, [tasks])

  const selectedTasks = selectedDate ? tasksByDate[selectedDate] || [] : []

  return (
    <article className="panel reminder-calendar">
      <div className="panel__head reminder-panel-head">
        <div>
          <h2>Calendar Summary</h2>
          <p>
            {new Date(year, monthIndex, 1).toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span>{tasks.length} deadline</span>
      </div>

      <div className="reminder-calendar__weekdays">
        {WEEKDAYS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="reminder-calendar__grid" aria-busy={loading}>
        {cells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} className="reminder-calendar__cell reminder-calendar__cell--empty" />
          }

          const key = getTaskDateKey({ deadline: cell })
          const dayTasks = tasksByDate[key] || []
          const hasDeadline = dayTasks.length > 0
          const overdueCount = dayTasks.filter(isOverdue).length

          return (
            <button
              key={key}
              type="button"
              className={[
                "reminder-calendar__cell",
                hasDeadline ? "reminder-calendar__cell--has-task" : "",
                overdueCount > 0 ? "reminder-calendar__cell--overdue" : "",
                key === todayKey ? "reminder-calendar__cell--today" : "",
                key === selectedDate ? "reminder-calendar__cell--selected" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => hasDeadline && onSelectDate(key)}
              disabled={!hasDeadline}
              aria-label={`${cell.getDate()} ${hasDeadline ? `${dayTasks.length} deadline` : "tanpa deadline"}`}
            >
              <span>{cell.getDate()}</span>
              {hasDeadline && (
                <strong>
                  {dayTasks.length}
                  <span className="sr-only"> task</span>
                </strong>
              )}
            </button>
          )
        })}
      </div>

      <div className="calendar-summary-list">
        {selectedDate && selectedTasks.length > 0 ? (
          selectedTasks.slice(0, 4).map((task) => (
            <div key={task.id} className={`calendar-summary-item ${isOverdue(task) ? "calendar-summary-item--overdue" : ""}`}>
              <strong>{task.title}</strong>
              <span>{formatDeadline(task.deadline)}</span>
            </div>
          ))
        ) : (
          <div className="empty-inline">Pilih tanggal bertanda untuk melihat deadline di hari itu.</div>
        )}
      </div>
    </article>
  )
}

function ReminderPage({ onOpenFolder, onEditTask }) {
  const [difficulty, setDifficulty] = useState("high")
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [calendarTasks, setCalendarTasks] = useState([])
  const [selectedDate, setSelectedDate] = useState("")
  const [loadingUpcoming, setLoadingUpcoming] = useState(false)
  const [loadingCalendar, setLoadingCalendar] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true

    setLoadingUpcoming(true)
    setError("")

    fetchUpcomingReminders(difficulty)
      .then((data) => {
        if (!isMounted) return
        setUpcomingTasks(data)
      })
      .catch((err) => {
        if (!isMounted) return
        setUpcomingTasks([])
        setError(getUserFriendlyErrorMessage(err, "Gagal memuat reminder mendatang."))
      })
      .finally(() => {
        if (isMounted) {
          setLoadingUpcoming(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [difficulty])

  useEffect(() => {
    let isMounted = true
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    setLoadingCalendar(true)

    fetchCalendarReminders(year, month)
      .then((data) => {
        if (!isMounted) return
        setCalendarTasks(data)
        const firstDateWithTask = data.map(getTaskDateKey).find(Boolean) || ""
        setSelectedDate((current) => current || firstDateWithTask)
      })
      .catch((err) => {
        if (!isMounted) return
        setCalendarTasks([])
        setError(getUserFriendlyErrorMessage(err, "Gagal memuat calendar summary."))
      })
      .finally(() => {
        if (isMounted) {
          setLoadingCalendar(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const overdueCount = upcomingTasks.filter(isOverdue).length

  return (
    <section className="stack-page reminder-page">
      <div className="stack-page__header reminder-hero">
        <div>
          <p className="eyebrow">Reminder Board</p>
          <h1>Deadline terdekat berdasarkan kesulitan</h1>
          <p className="stack-page__lead">
            Pilih tingkat kesulitan untuk melihat task belum selesai yang sudah diurutkan otomatis dari deadline terdekat.
          </p>
        </div>

        <div className="reminder-hero__stats">
          <span>{upcomingTasks.length} task aktif</span>
          <span className={overdueCount > 0 ? "is-danger" : ""}>{overdueCount} overdue</span>
        </div>
      </div>

      <div className="reminder-layout">
        <article className="panel reminder-list-panel">
          <div className="panel__head reminder-panel-head">
            <div>
              <h2>Upcoming Tasks</h2>
              <p>Filter aktif: {DIFFICULTY_FILTERS.find((item) => item.id === difficulty)?.label}</p>
            </div>
            <div className="difficulty-segment" aria-label="Filter tingkat kesulitan">
              {DIFFICULTY_FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={difficulty === item.id ? "difficulty-segment__button difficulty-segment__button--active" : "difficulty-segment__button"}
                  onClick={() => setDifficulty(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="reminder-error">{error}</div>}

          {loadingUpcoming ? (
            <div className="loading-state">
              <div className="loading-spinner" />
            </div>
          ) : upcomingTasks.length === 0 ? (
            <div className="empty-inline">Belum ada task untuk tingkat kesulitan ini.</div>
          ) : (
            <div className="reminder-items">
              {upcomingTasks.map((task) => {
                const overdue = isOverdue(task)

                return (
                  <button
                    key={task.id}
                    type="button"
                    className={`reminder-item reminder-item--modern ${overdue ? "reminder-item--overdue" : ""}`}
                    onClick={() => onEditTask(task)}
                  >
                    <div className="reminder-item__top">
                      <div>
                        <h3>{task.title}</h3>
                        <p>{task.description || "Tidak ada deskripsi tambahan."}</p>
                      </div>
                      <span className={`tag tag--${overdue ? "urgent" : difficulty}`}>
                        {overdue ? "Overdue" : difficulty}
                      </span>
                    </div>

                    <div className="reminder-item__meta">
                      <span>{task.folder?.name || "Unassigned folder"}</span>
                      <span>{formatDeadline(task.deadline)}</span>
                      {task.folder && (
                        <span
                          className="linkish"
                          onClick={(event) => {
                            event.stopPropagation()
                            onOpenFolder(task.folder.id)
                          }}
                        >
                          Buka folder
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </article>

        <CalendarSummary
          tasks={calendarTasks}
          loading={loadingCalendar}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>
    </section>
  )
}

export default ReminderPage
