function buildMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1)
  const startWeekday = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []

  for (let index = 0; index < startWeekday; index += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day))
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

function YearCalendarPage({ tasks, year, onOpenFolder }) {
  const months = Array.from({ length: 12 }, (_, month) => {
    const monthTasks = tasks.filter((task) => {
      if (!task.deadline) return false
      const deadline = new Date(task.deadline)
      return deadline.getFullYear() === year && deadline.getMonth() === month
    })

    return {
      month,
      cells: buildMonthMatrix(year, month),
      monthTasks,
    }
  })

  return (
    <section className="stack-page">
      <div className="stack-page__header">
        <div>
          <p className="eyebrow">Calendar View</p>
          <h1>Yearly planner {year}</h1>
        </div>
        <p className="stack-page__lead">
          Setiap bulan menampilkan reminder yang jatuh pada tanggal terkait, mirip ringkasan calendar app.
        </p>
      </div>

      <div className="year-grid">
        {months.map(({ month, cells, monthTasks }) => (
          <article key={month} className="panel month-card">
            <div className="panel__head">
              <h2>{new Date(year, month, 1).toLocaleDateString("en-GB", { month: "long" })}</h2>
              <span>{monthTasks.length} reminder</span>
            </div>

            <div className="month-card__weekdays">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            <div className="month-card__grid">
              {cells.map((cell, index) => {
                if (!cell) {
                  return <div key={`empty-${index}`} className="month-card__cell month-card__cell--empty" />
                }

                const dayTasks = monthTasks.filter((task) => {
                  const deadline = new Date(task.deadline)
                  return deadline.getDate() === cell.getDate()
                })

                return (
                  <div key={cell.toISOString()} className="month-card__cell">
                    <strong>{cell.getDate()}</strong>
                    {dayTasks.slice(0, 2).map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        className="calendar-pill"
                        onClick={() => task.folder && onOpenFolder(task.folder.id)}
                      >
                        {task.title}
                      </button>
                    ))}
                    {dayTasks.length > 2 && <span className="calendar-more">+{dayTasks.length - 2}</span>}
                  </div>
                )
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default YearCalendarPage
