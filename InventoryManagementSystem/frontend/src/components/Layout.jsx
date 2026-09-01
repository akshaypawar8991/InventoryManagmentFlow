import { useNavigate, Link, useLocation } from 'react-router-dom'
import './Layout.css'

function Layout({ title, roleLabel, children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
  localStorage.removeItem('user')
  navigate('/login', { replace: true })
}

  const dashboardPath =
    roleLabel === 'Admin' ? '/admin' :
    roleLabel === 'Manager' ? '/manager' : '/employee'

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect x="4" y="4" width="14" height="14" rx="3" fill="#F5A623" />
            <rect x="22" y="4" width="14" height="14" rx="3" fill="#F5A623" opacity="0.5" />
            <rect x="4" y="22" width="14" height="14" rx="3" fill="#F5A623" opacity="0.5" />
            <rect x="22" y="22" width="14" height="14" rx="3" fill="#F5A623" />
          </svg>
          <span>StockFlow</span>
        </div>

        <nav className="sidebar-nav">
          <Link
            className={`nav-item ${location.pathname === dashboardPath ? 'active' : ''}`}
            to={dashboardPath}
          >
            Dashboard
          </Link>
          <Link className="nav-item" to={dashboardPath}>
            My Requests
          </Link>
          <Link
            className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
            to="/profile"
          >
            Profile
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="avatar-chip">
            <div className="avatar-circle">{roleLabel?.[0]}</div>
            <div>
              <div className="avatar-name">{roleLabel}</div>
              <div className="avatar-role">Signed in</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <h1>{title}</h1>
          <button className="logout-btn" onClick={handleLogout}>Log out</button>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  )
}

export default Layout