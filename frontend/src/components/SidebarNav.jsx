const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "HM" },
  { id: "reminders", label: "Reminder", icon: "RM" },
  { id: "calendar", label: "Calendar", icon: "CL" },
  { id: "workspace", label: "Workspace", icon: "WS" },
  { id: "about", label: "About", icon: "AB" },
]

function SidebarNav({ currentPage, onNavigate, onLogout }) {
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar__brand">
          <div className="sidebar__brand-mark">ST</div>
          <div>
            <p className="sidebar__brand-title">sowel</p>
            <p className="sidebar__brand-subtitle">task space</p>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar__nav-item ${currentPage === item.id ? "sidebar__nav-item--active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="sidebar__icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <button type="button" className="sidebar__logout" onClick={onLogout}>
        Logout
      </button>
    </aside>
  )
}

export default SidebarNav
