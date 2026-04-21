import { Link } from "react-router-dom"
import { FiUser } from "react-icons/fi"

function AppHeader({ title, icon, rightContent = null }) {
  const resolvedRightContent = rightContent ?? (
    <Link to="/profile" className="header-profile-link" aria-label="Open profiel">
      <FiUser />
    </Link>
  )

  return (
    <header className="home-header app-header-sticky">
      <div className="header-left">{icon}</div>
      <h1 className="header-title">{title}</h1>
      <div className="header-right">{resolvedRightContent}</div>
    </header>
  )
}

export default AppHeader
